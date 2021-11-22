import React, { PureComponent } from 'react';
import Page from 'app/core/components/Page/Page';
import { Button, LegacyForms, Select } from '@grafana/ui';
const { FormField } = LegacyForms;
import { NavModel, SelectableValue } from '@grafana/data';
import { getBackendSrv, locationService } from '@grafana/runtime';
import { connect } from 'react-redux';
import { getNavModel } from 'app/core/selectors/navModel';
import { FormLabel } from '@grafana/ui/src/components/FormLabel/FormLabel';

import {
  AlarmLevelInfo,
  AlarmLevels,
  AlarmPermissions,
  PermissionInfo,
  Severities,
  SeverityInfo,
  StoreState,
} from 'app/types';
import JsonCreatorSlider from 'app/core/components/JsonEditors/JsonCreatorSlider';
import JsonList from 'app/core/components/JsonEditors/JsonList';

export interface Props {
  navModel: NavModel;
}

interface State {
  name: string;
  description: string;
  alerting_msg: string;
  ok_msg: string;
  severity: number;
  permission_level: number;
  alarm_level: number;
  for_duration: number;
  manual_reset: boolean;
  context: any;
  isAddingContext: boolean;
}

export class CreateAlarm extends PureComponent<Props, State> {
  state: State = {
    name: '',
    description: '',
    alerting_msg: '',
    ok_msg: '',
    severity: 0,
    permission_level: 0,
    alarm_level: 0,
    for_duration: 0,
    manual_reset: false,
    context: {},
    isAddingContext: false,
  };

  severities = Severities.map(
    (severity: SeverityInfo): SelectableValue<number> => ({
      value: severity.value,
      label: severity.description,
      name: severity.label,
    })
  );

  alarmLevels = AlarmLevels.map(
    (level: AlarmLevelInfo): SelectableValue<number> => ({
      value: level.value,
      label: level.description,
      name: level.label,
    })
  );

  permissions = AlarmPermissions.map(
    (permission: PermissionInfo): SelectableValue<number> => ({
      value: permission.value,
      label: permission.description,
      name: permission.label,
    })
  );

  create = async () => {
    const {
      name,
      description,
      alerting_msg,
      ok_msg,
      severity,
      permission_level,
      alarm_level,
      for_duration,
      manual_reset,
      context,
    } = this.state;
    const result = await getBackendSrv().post('/api/admin/alarms', {
      name,
      description,
      alerting_msg,
      ok_msg,
      severity,
      permission_level,
      alarm_level,
      for_duration,
      manual_reset,
      context,
    });
    if (result.alarmId) {
      locationService.push(`/admin/alarms/edit/${result.alarmId}`);
    }
  };

  onToggleAddingContext = () => {
    this.setState({ isAddingContext: !this.state.isAddingContext });
  };

  onSeverityChange = (event: any) => {
    this.setState({
      severity: Number(event.value),
    });
  };

  onPermissionLevelChange = (event: any) => {
    this.setState({
      permission_level: Number(event.value),
    });
  };

  onAlarmLevelChange = (event: any) => {
    this.setState({
      alarm_level: Number(event.value),
    });
  };

  onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    switch (event.target.id) {
      case 'name':
        this.setState({
          name: event.target.value,
        });
        break;
      case 'description':
        this.setState({
          description: event.target.value,
        });
        break;
      case 'alerting_msg':
        this.setState({
          alerting_msg: event.target.value,
        });
        break;
      case 'ok_msg':
        this.setState({
          ok_msg: event.target.value,
        });
        break;
      case 'for_duration':
        this.setState({
          for_duration: Number(event.target.value),
        });
        break;
    }
  };

  onManualResetChange = (checked: boolean) => {
    this.setState({
      manual_reset: checked,
    });
  };

  onUpdateContext = (config: any) => {
    this.setState({
      context: config,
    });
  };

  render() {
    const { navModel } = this.props;
    const {
      name,
      description,
      alerting_msg,
      ok_msg,
      severity,
      permission_level,
      alarm_level,
      for_duration,
      manual_reset,
      isAddingContext,
      context,
    } = this.state;
    return (
      <Page navModel={navModel}>
        <Page.Contents>
          <div>
            <h3 className="page-sub-heading">New Alarm</h3>

            <div className="gf-form-group">
              <FormField
                id="name"
                className="gf-form"
                label="Name"
                value={name}
                onChange={this.onChange}
                inputWidth={20}
                labelWidth={10}
              />
              <FormField
                id="description"
                className="gf-form"
                label="Description"
                value={description}
                onChange={this.onChange}
                inputWidth={20}
                labelWidth={10}
              />
              <FormField
                id="alerting_msg"
                className="gf-form"
                label="Alerting Message"
                value={alerting_msg}
                onChange={this.onChange}
                inputWidth={20}
                labelWidth={10}
              />
              <FormField
                id="ok_msg"
                className="gf-form"
                label="Resolved Message"
                value={ok_msg}
                onChange={this.onChange}
                inputWidth={20}
                labelWidth={10}
              />
              <div className="gf-form">
                <FormLabel width={10}>Severity</FormLabel>
                <Select
                  onChange={this.onSeverityChange}
                  options={this.severities}
                  placeholder="Choose severity"
                  className="gf-form-select-box__single-value max-width-20"
                  width={20}
                  value={severity}
                />
              </div>
              <div className="gf-form">
                <FormLabel width={10}>Permission</FormLabel>
                <Select
                  onChange={this.onPermissionLevelChange}
                  options={this.permissions}
                  placeholder="Choose permission"
                  className="gf-form-select-box__single-value max-width-20"
                  width={20}
                  value={permission_level}
                />
              </div>
              <div className="gf-form">
                <FormLabel width={10}>Scope</FormLabel>
                <Select
                  onChange={this.onAlarmLevelChange}
                  options={this.alarmLevels}
                  placeholder="Choose scope"
                  className="gf-form-select-box__single-value max-width-20"
                  width={20}
                  value={alarm_level}
                />
              </div>
              <FormField
                id="for_duration"
                className="gf-form"
                label="For duration"
                value={for_duration}
                onChange={this.onChange}
                inputWidth={20}
                labelWidth={10}
              />
              <div className="gf-form">
                <LegacyForms.Switch
                  label={'Manual Reset'}
                  checked={manual_reset}
                  onChange={() => this.onManualResetChange(!manual_reset)}
                />
              </div>
              <div className="gf-form-group">
                <h3 className="page-heading">Alarm Configuration</h3>
                <div className="page-action-bar">
                  <div className="page-action-bar__spacer" />
                  <button
                    className="btn btn-primary pull-right"
                    onClick={this.onToggleAddingContext}
                    disabled={isAddingContext}
                  >
                    Add alarm configurations
                  </button>
                </div>
                <JsonCreatorSlider
                  isOpen={isAddingContext}
                  onToggle={this.onToggleAddingContext}
                  configs={context}
                  updateConfig={this.onUpdateContext}
                />
                <JsonList isEditable={true} isDeletable={true} configs={context} updateConfig={this.onUpdateContext} />
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
    navModel: getNavModel(state.navIndex, 'alarms'),
  };
}

export default connect(mapStateToProps)(CreateAlarm);
