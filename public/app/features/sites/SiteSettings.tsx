import React, { FC, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Button, Field, FieldSet, Form, Select, VerticalGroup } from '@grafana/ui';
import { updateSite } from './state/actions';
import { Site, SiteType, OrgRole, StoreState } from 'app/types';
import JsonList from 'app/core/components/JsonEditors/JsonList';
import { SelectableValue } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { contextSrv } from 'app/core/services/context_srv';
import { FormField } from '@grafana/ui/src/components/FormField/FormField';
import { FormLabel } from '@grafana/ui/src/components/FormLabel/FormLabel';

export interface OwnProps {
  site: Site;
}

function mapStateToProps(state: StoreState, props: OwnProps) {
  return {
    site: props.site,
    signedInUser: contextSrv.user,
  };
}

const mapDispatchToProps = {
  updateSite,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = ConnectedProps<typeof connector> & OwnProps;

export const SiteSettings: FC<Props> = ({ site, updateSite, signedInUser }) => {
  const [siteData, setSiteData] = useState(site);
  const [types, setTypes] = useState<Array<SelectableValue<string>>>([]);

  useEffect(() => {
    setSiteData(site);
  }, [site]);

  const onTypeChange = (event: any) => {
    setSiteData({ ...siteData, type: event.value });
  };

  const onUpdateSiteAppConfig = (config: any) => {
    setSiteData({ ...siteData, site_app_configs: config });
  };

  const onUpdateSiteProps = (config: any) => {
    setSiteData({ ...siteData, site_props: config });
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    switch (event.target.id) {
      case 'name':
        setSiteData({
          ...siteData,
          name: event.target.value,
        });
        break;
      case 'description':
        setSiteData({
          ...siteData,
          description: event.target.value,
        });
        break;
      case 'serial':
        setSiteData({
          ...siteData,
          serial: event.target.value,
        });
        break;
      case 'long':
        setSiteData({
          ...siteData,
          long: Number(event.target.value),
        });
        break;
      case 'lat':
        setSiteData({
          ...siteData,
          lat: Number(event.target.value),
        });
        break;
    }
  };

  const isEditable = () => {
    return (
      signedInUser.isGrafanaAdmin || signedInUser.orgRole === OrgRole.Admin || signedInUser.orgRole === OrgRole.Editor
    );
  };

  const initializeTypes = async () => {
    const types = await getBackendSrv().get('/api/sitetypes', { perpage: 10000, page: 1 });
    setTypes(
      types.data.map(
        (type: SiteType): SelectableValue<string> => ({
          value: type.type,
          label: type.type,
          name: type.type,
        })
      )
    );
  };

  useEffect(() => {
    initializeTypes();
  }, []);

  return (
    <VerticalGroup>
      <FieldSet label="Team Settings">
        <Form
          defaultValues={{ ...siteData }}
          onSubmit={() => {
            updateSite(
              siteData.type,
              siteData.name,
              siteData.description,
              siteData.long,
              siteData.lat,
              siteData.serial,
              siteData.site_app_configs,
              siteData.site_props
            );
          }}
        >
          {() => (
            <div>
              <div className="gf-form-group">
                <div className="gf-form">
                  <FormLabel width={15}>Type</FormLabel>
                  <Select
                    onChange={onTypeChange}
                    options={types}
                    placeholder="Choose site type"
                    className="gf-form-select-box__single-value max-width-20"
                    width={20}
                    disabled={!isEditable()}
                    value={siteData.type}
                  />
                </div>
                <FormField
                  id="name"
                  className="gf-form"
                  label="Name"
                  value={siteData.name}
                  onChange={onChange}
                  inputWidth={20}
                  labelWidth={15}
                  disabled={!isEditable()}
                />
                <FormField
                  id="description"
                  className="gf-form"
                  label="Description"
                  value={siteData.description}
                  onChange={onChange}
                  inputWidth={20}
                  labelWidth={15}
                  disabled={!isEditable()}
                />
                <FormField
                  id="serial"
                  className="gf-form"
                  label="Serial"
                  value={siteData.serial}
                  onChange={onChange}
                  inputWidth={20}
                  labelWidth={15}
                  disabled={!isEditable()}
                />
                <FormField
                  id="long"
                  className="gf-form"
                  label="Long"
                  value={siteData.long}
                  onChange={onChange}
                  inputWidth={20}
                  labelWidth={15}
                  disabled={!isEditable()}
                />
                <FormField
                  id="lat"
                  className="gf-form"
                  label="Lat"
                  value={siteData.lat}
                  onChange={onChange}
                  inputWidth={20}
                  labelWidth={15}
                  disabled={!isEditable()}
                />
                <div className="page-action-bar__spacer" />
              </div>
              <Field label="Application Configurations">
                <JsonList
                  isEditable={isEditable()}
                  isDeletable={false}
                  configs={siteData.site_app_configs}
                  updateConfig={onUpdateSiteAppConfig}
                />
              </Field>
              <Field label="Properties">
                <JsonList
                  isEditable={isEditable()}
                  isDeletable={false}
                  configs={siteData.site_props}
                  updateConfig={onUpdateSiteProps}
                />
              </Field>
              <Button type="submit">Update</Button>
            </div>
          )}
        </Form>
      </FieldSet>
    </VerticalGroup>
  );
};

export default connector(SiteSettings);
