import React, { PureComponent } from 'react';
import Page from 'app/core/components/Page/Page';
import { Button, LegacyForms } from '@grafana/ui';
const { FormField } = LegacyForms;
import { NavModel } from '@grafana/data';
import { getBackendSrv, locationService } from '@grafana/runtime';
import { connect } from 'react-redux';
import { getNavModel } from 'app/core/selectors/navModel';
import { StoreState } from 'app/types';
import JsonCreatorSlider from 'app/core/components/JsonEditors/JsonCreatorSlider';
import JsonList from 'app/core/components/JsonEditors/JsonList';

export interface Props {
  navModel: NavModel;
}

interface State {
  type: string;
  site_app_configs: any;
  site_props: any;
  isAddingSiteAppConfig: boolean;
  isAddingSiteProps: boolean;
}

export class CreateSiteType extends PureComponent<Props, State> {
  state: State = {
    type: '',
    site_app_configs: {},
    site_props: {},
    isAddingSiteAppConfig: false,
    isAddingSiteProps: false,
  };

  create = async () => {
    const { type, site_app_configs, site_props } = this.state;
    const result = await getBackendSrv().post('/api/sitetypes', { type, site_app_configs, site_props });
    if (result.siteTypeId) {
      locationService.push(`/admin/sitetypes/edit/${result.siteTypeId}`);
    }
  };

  onToggleAddingSiteAppConfig = () => {
    this.setState({ isAddingSiteAppConfig: !this.state.isAddingSiteAppConfig });
    if (this.state.isAddingSiteProps === true) {
      this.onToggleAddingSiteProps();
    }
  };

  onToggleAddingSiteProps = () => {
    this.setState({ isAddingSiteProps: !this.state.isAddingSiteProps });
    if (this.state.isAddingSiteAppConfig === true) {
      this.onToggleAddingSiteAppConfig();
    }
  };

  onTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      type: event.target.value,
    });
  };

  onUpdateSiteAppConfig = (config: any) => {
    this.setState({
      site_app_configs: config,
    });
  };

  onUpdateSiteProps = (config: any) => {
    this.setState({
      site_props: config,
    });
  };

  render() {
    const { navModel } = this.props;
    const { type, isAddingSiteAppConfig, isAddingSiteProps, site_app_configs, site_props } = this.state;
    return (
      <Page navModel={navModel}>
        <Page.Contents>
          <div>
            <h3 className="page-sub-heading">New SiteType</h3>

            <div className="gf-form-group">
              <div className="gf-form-group">
                <FormField
                  className="gf-form"
                  label="Type"
                  value={type}
                  onChange={this.onTypeChange}
                  inputWidth={20}
                  labelWidth={10}
                />
              </div>
              <div className="gf-form-group">
                <h3 className="page-heading">Application Configurations</h3>
                <div className="page-action-bar">
                  <div className="page-action-bar__spacer" />
                  <button
                    className="btn btn-primary pull-right"
                    onClick={this.onToggleAddingSiteAppConfig}
                    disabled={isAddingSiteAppConfig}
                  >
                    Add application configurations
                  </button>
                </div>
                <JsonCreatorSlider
                  isOpen={isAddingSiteAppConfig}
                  onToggle={this.onToggleAddingSiteAppConfig}
                  configs={site_app_configs}
                  updateConfig={this.onUpdateSiteAppConfig}
                />
                <JsonList
                  isEditable={true}
                  isDeletable={true}
                  configs={site_app_configs}
                  updateConfig={this.onUpdateSiteAppConfig}
                />
              </div>
              <div className="gf-form-group">
                <h3 className="page-heading">Properties</h3>
                <div className="page-action-bar">
                  <div className="page-action-bar__spacer" />
                  <button
                    className="btn btn-primary pull-right"
                    onClick={this.onToggleAddingSiteProps}
                    disabled={isAddingSiteProps}
                  >
                    Add properties
                  </button>
                </div>
                <JsonCreatorSlider
                  isOpen={isAddingSiteProps}
                  onToggle={this.onToggleAddingSiteProps}
                  configs={site_props}
                  updateConfig={this.onUpdateSiteProps}
                />
                <JsonList
                  isEditable={true}
                  isDeletable={true}
                  configs={site_props}
                  updateConfig={this.onUpdateSiteProps}
                />
              </div>
              <div className="gf-form-button-row">
                <Button variant="secondary" onClick={this.create}>
                  Create
                </Button>
              </div>
            </div>
          </div>
        </Page.Contents>
      </Page>
    );
  }
}

function mapStateToProps(state: StoreState) {
  return {
    navModel: getNavModel(state.navIndex, 'sitetypes'),
  };
}

export default connect(mapStateToProps)(CreateSiteType);
