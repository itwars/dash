import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Button, LegacyForms } from '@grafana/ui';
const { FormField } = LegacyForms;
import { updateSiteType } from './state/actions';
import { SiteType, StoreState } from 'app/types';
import JsonList from 'app/core/components/JsonEditors/JsonList';
import JsonCreatorSlider from 'app/core/components/JsonEditors/JsonCreatorSlider';

export interface OwnProps {
  siteType: SiteType;
}

function mapStateToProps(state: StoreState, props: OwnProps) {
  return {
    siteType: props.siteType,
  };
}

const mapDispatchToProps = {
  updateSiteType,
};

interface State {
  type: string;
  site_app_configs: any;
  site_props: any;
  isAddingSiteAppConfig: boolean;
  isAddingSiteProps: boolean;
}

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = OwnProps & ConnectedProps<typeof connector>;

export class SiteTypeSettings extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      type: this.props.siteType.type,
      site_app_configs: this.props.siteType.site_app_configs,
      site_props: this.props.siteType.site_props,
      isAddingSiteAppConfig: false,
      isAddingSiteProps: false,
    };
  }

  update = async () => {
    const { type, site_app_configs, site_props } = this.state;
    this.props.updateSiteType(type, site_app_configs, site_props);
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
  render() {
    const { type, isAddingSiteAppConfig, isAddingSiteProps, site_app_configs, site_props } = this.state;

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
            <JsonList isEditable={true} isDeletable={true} configs={site_props} updateConfig={this.onUpdateSiteProps} />
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

export default connector(SiteTypeSettings);
