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
  asset_controller_configs: any;
  asset_app_configs: any;
  asset_props: any;
  isAddingAssetControllerConfig: boolean;
  isAddingAssetAppConfig: boolean;
  isAddingAssetProps: boolean;
}

export class CreateAssetType extends PureComponent<Props, State> {
  state: State = {
    type: '',
    asset_controller_configs: {},
    asset_app_configs: {},
    asset_props: {},
    isAddingAssetControllerConfig: false,
    isAddingAssetAppConfig: false,
    isAddingAssetProps: false,
  };

  create = async () => {
    const { type, asset_controller_configs, asset_app_configs, asset_props } = this.state;
    const result = await getBackendSrv().post('/api/assettypes', {
      type,
      asset_app_configs,
      asset_props,
      asset_controller_configs,
    });
    if (result.assetTypeId) {
      locationService.push(`/admin/assettypes/edit/${result.assetTypeId}`);
    }
  };

  onToggleAddingAssetAppConfig = () => {
    this.setState({
      isAddingAssetAppConfig: !this.state.isAddingAssetAppConfig,
    });
    if (this.state.isAddingAssetProps === true) {
      this.onToggleAddingAssetProps();
    }
    if (this.state.isAddingAssetControllerConfig === true) {
      this.onToggleAddingAssetControllerConfig();
    }
  };

  onToggleAddingAssetProps = () => {
    this.setState({ isAddingAssetProps: !this.state.isAddingAssetProps });
    if (this.state.isAddingAssetAppConfig === true) {
      this.onToggleAddingAssetAppConfig();
    }
    if (this.state.isAddingAssetControllerConfig === true) {
      this.onToggleAddingAssetControllerConfig();
    }
  };

  onToggleAddingAssetControllerConfig = () => {
    this.setState({ isAddingAssetControllerConfig: !this.state.isAddingAssetControllerConfig });
    if (this.state.isAddingAssetAppConfig === true) {
      this.onToggleAddingAssetAppConfig();
    }
    if (this.state.isAddingAssetProps === true) {
      this.onToggleAddingAssetProps();
    }
  };

  onTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      type: event.target.value,
    });
  };

  onUpdateAssetControllerConfig = (config: any) => {
    this.setState({
      asset_controller_configs: config,
    });
  };

  onUpdateAssetAppConfig = (config: any) => {
    this.setState({
      asset_app_configs: config,
    });
  };

  onUpdateAssetProps = (config: any) => {
    this.setState({
      asset_props: config,
    });
  };

  render() {
    const { navModel } = this.props;
    const {
      type,
      isAddingAssetControllerConfig,
      isAddingAssetAppConfig,
      isAddingAssetProps,
      asset_controller_configs,
      asset_app_configs,
      asset_props,
    } = this.state;
    return (
      <Page navModel={navModel}>
        <Page.Contents>
          <div>
            <h3 className="page-sub-heading">New AssetType</h3>

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
                    onClick={this.onToggleAddingAssetAppConfig}
                    disabled={isAddingAssetAppConfig}
                  >
                    Add application configurations
                  </button>
                </div>
                <JsonCreatorSlider
                  isOpen={isAddingAssetAppConfig}
                  onToggle={this.onToggleAddingAssetAppConfig}
                  configs={asset_app_configs}
                  updateConfig={this.onUpdateAssetAppConfig}
                />
                <JsonList
                  isEditable={true}
                  isDeletable={true}
                  configs={asset_app_configs}
                  updateConfig={this.onUpdateAssetAppConfig}
                />
              </div>
              <div className="gf-form-group">
                <h3 className="page-heading">Properties</h3>
                <div className="page-action-bar">
                  <div className="page-action-bar__spacer" />
                  <button
                    className="btn btn-primary pull-right"
                    onClick={this.onToggleAddingAssetProps}
                    disabled={isAddingAssetProps}
                  >
                    Add properties
                  </button>
                </div>
                <JsonCreatorSlider
                  isOpen={isAddingAssetProps}
                  onToggle={this.onToggleAddingAssetProps}
                  configs={asset_props}
                  updateConfig={this.onUpdateAssetProps}
                />
                <JsonList
                  isEditable={true}
                  isDeletable={true}
                  configs={asset_props}
                  updateConfig={this.onUpdateAssetProps}
                />
              </div>
              <div className="gf-form-group">
                <h3 className="page-heading">Controller Configurations</h3>
                <div className="page-action-bar">
                  <div className="page-action-bar__spacer" />
                  <button
                    className="btn btn-primary pull-right"
                    onClick={this.onToggleAddingAssetControllerConfig}
                    disabled={isAddingAssetControllerConfig}
                  >
                    Add controller configurations
                  </button>
                </div>
                <JsonCreatorSlider
                  isOpen={isAddingAssetControllerConfig}
                  onToggle={this.onToggleAddingAssetControllerConfig}
                  configs={asset_controller_configs}
                  updateConfig={this.onUpdateAssetControllerConfig}
                />
                <JsonList
                  isEditable={true}
                  isDeletable={true}
                  configs={asset_controller_configs}
                  updateConfig={this.onUpdateAssetControllerConfig}
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
    navModel: getNavModel(state.navIndex, 'assettypes'),
  };
}

export default connect(mapStateToProps)(CreateAssetType);
