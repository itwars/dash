import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Button, LegacyForms } from '@grafana/ui';
const { FormField } = LegacyForms;
import { updateAssetType } from './state/actions';
import { AssetType, StoreState } from 'app/types';
import JsonList from 'app/core/components/JsonEditors/JsonList';
import JsonCreatorSlider from 'app/core/components/JsonEditors/JsonCreatorSlider';

export interface OwnProps {
  assetType: AssetType;
}

function mapStateToProps(state: StoreState, props: OwnProps) {
  return {
    assetType: props.assetType,
  };
}

const mapDispatchToProps = {
  updateAssetType,
};

interface State {
  type: string;
  asset_app_configs: any;
  asset_props: any;
  asset_controller_configs: any;
  isAddingAssetAppConfig: boolean;
  isAddingAssetProps: boolean;
  isAddingAssetControllerConfig: boolean;
}
const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = OwnProps & ConnectedProps<typeof connector>;

export class AssetTypeSettings extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      type: this.props.assetType.type,
      asset_app_configs: this.props.assetType.asset_app_configs,
      asset_props: this.props.assetType.asset_props,
      asset_controller_configs: this.props.assetType.asset_controller_configs,
      isAddingAssetAppConfig: false,
      isAddingAssetProps: false,
      isAddingAssetControllerConfig: false,
    };
  }

  update = async () => {
    const { type, asset_app_configs, asset_props, asset_controller_configs } = this.state;
    this.props.updateAssetType(type, asset_app_configs, asset_props, asset_controller_configs);
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

  onToggleAddingAssetAppConfig = () => {
    this.setState({ isAddingAssetAppConfig: !this.state.isAddingAssetAppConfig });
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

  render() {
    const {
      type,
      isAddingAssetAppConfig,
      isAddingAssetProps,
      isAddingAssetControllerConfig,
      asset_controller_configs,
      asset_app_configs,
      asset_props,
    } = this.state;

    return (
      <div>
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
            <Button variant="secondary" onClick={this.update}>
              Update
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default connector(AssetTypeSettings);
