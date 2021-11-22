// eslint-disable-next-line lodash/import-scope
import _ from 'lodash';
import { BackendSrv } from 'app/core/services/backend_srv';
import { TemplateSrv } from 'app/features/templating/template_srv';
import { contextSrv } from 'app/core/services/context_srv';
import { DataserviceQuery, DataserviceOptions } from './types';
import { dateMath, DataSourceApi, DataSourceInstanceSettings, DataQueryResponse } from '@grafana/data';
import { getLocationSrv } from '@grafana/runtime';

export class DataserviceDatasource extends DataSourceApi<DataserviceQuery, DataserviceOptions> {
  name: any;
  type: any;
  url: any;
  withCredentials: any;
  headers: any;
  context: any;
  dataConfigs: any;

  /** @ngInject */
  constructor(
    instanceSettings: DataSourceInstanceSettings<DataserviceOptions>,
    private backendSrv: BackendSrv,
    private templateSrv: TemplateSrv
  ) {
    super(instanceSettings);
    this.type = instanceSettings.type;
    this.url = instanceSettings.url;
    this.name = instanceSettings.name;
    this.withCredentials = instanceSettings.withCredentials;
    this.headers = { 'Content-Type': 'application/json' };
    this.context = contextSrv;
    let { siteId, assetId } = getLocationSrv().getLocationQuery();
    this.headers = { 'Site-Id': siteId, 'Asset-Id': assetId };
    if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
      this.headers['Authorization'] = instanceSettings.basicAuth;
    }
  }

  query(options: any): Promise<DataQueryResponse> {
    const query = this.buildQueryParameters(options);
    query.targets = _.filter(query.targets, (item) => item.hide !== true);
    let { siteId, assetId } = getLocationSrv().getLocationQuery();
    siteId = siteId ? Number(siteId) : 0;
    assetId = assetId ? Number(assetId) : 0;
    query.userid = this.context.user.id;
    query.orgid = this.context.user.orgId;
    query.siteid = siteId;
    query.assetid = assetId;
    query.role = this.context.user.orgRole;
    query.role = this.context.user.isGrafanaAdmin ? 'SuperAdmin' : query.role;
    query.role = this.convertRole(query.role);
    query.intervalms = options.intervalMs;
    query.range = {
      from: dateMath.parse(options.rangeRaw.from, false, options.timezone),
      to: dateMath.parse(options.rangeRaw.to, true, options.timezone),
      raw: {
        from: options.range.from.valueOf(),
        to: options.range.to.valueOf(),
      },
    };

    if (query.targets.length <= 0) {
      return Promise.resolve({ data: [] });
    }

    if (this.templateSrv.getAdhocFilters) {
      query.adhocFilters = this.templateSrv.getAdhocFilters(this.name);
    } else {
      query.adhocFilters = [];
    }

    return new Promise((resolve, reject) => {
      this.doRequest({
        url: this.url + '/api/query',
        data: query,
        method: 'POST',
      }).then((result: { data: any }) => {
        var decodedPayload = atob(result.data.data);
        resolve({
          data: JSON.parse(decodedPayload),
        });
      });
    });
  }
  async testDatasource(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.doRequest({
        url: this.url + '/api/search',
        method: 'POST',
      }).then((response: { status: number }) => {
        if (response.status === 200) {
          resolve({
            status: 'success',
            message: 'Data source is working',
            title: 'Success',
          });
        } else {
          reject({
            status: 'fail',
            message: 'Data source is not working',
            title: 'Fail',
          });
        }
      });
    });
  }

  convertRole(role: string) {
    switch (role) {
      case 'Viewer':
        return 'ROLE_VIEWER';
      case 'Editor':
        return 'ROLE_EDITOR';
      case 'Admin':
        return 'ROLE_ADMIN';
      case 'SuperAdmin':
        return 'ROLE_SUPERADMIN';
      default:
        return 'ROLE_UNSPECIFIED';
    }
  }

  metricFindQuery(target: any) {
    return this.doRequest({
      url: this.url + '/api/search',
      data: {},
      method: 'POST',
    }).then((result) => this.mapTargetsToTextValue(result, target));
  }

  mapTargetsToTextValue(result: { data: any }, target: any) {
    if (target !== undefined && target !== '') {
      for (const t of result.data.targets) {
        if (t.application === target) {
          return _.map(t.apis, (api) => {
            return { text: api.name, value: api.name, data: api.data };
          });
        }
      }
      return [];
    } else {
      return _.map(result.data.targets, (val) => {
        return { text: val.application, value: val.application };
      });
    }
  }

  doRequest(options: any) {
    options.withCredentials = this.withCredentials;
    options.headers = this.headers;

    return this.backendSrv.datasourceRequest(options);
  }

  buildQueryParameters(options: any) {
    //remove placeholder targets
    options.targets = _.filter(options.targets, (target) => {
      return target.target !== 'select metric';
    });

    let { siteId, assetId, orgId } = getLocationSrv().getLocationQuery();
    options.scopedVars = {
      ...options.scopedVars,
      siteId: { text: 'siteId', value: siteId },
      assetId: { text: 'assetId', value: assetId },
      orgId: { text: 'orgId', value: orgId },
    };

    const targets = _.map(options.targets, (target) => {
      for (var i = 0; i < target.apidata.length; i++) {
        target.apidata[i].value = this.templateSrv.replace(target.apidata[i].value, options.scopedVars, 'regex');
      }
      return {
        application: target.target,
        apis: [{ name: target.api, data: target.apidata }],
        refId: target.refId,
        hide: target.hide,
        type: 'table',
      };
    });
    options.targets = targets;
    return options;
  }
}
