import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Button, LegacyForms } from '@grafana/ui';
const { FormField } = LegacyForms;
import { updateUserAlarm } from './state/actions';
import { AlarmLevels, UserAlarm, AlarmLevelInfo, StoreState } from 'app/types';
import JsonList from 'app/core/components/JsonEditors/JsonList';
import { SelectableValue } from '@grafana/data';

export interface OwnProps {
  userAlarm: UserAlarm;
  alarmLevel: number;
  site_id: number;
  asset_id: number;
}

function mapStateToProps(state: StoreState, props: OwnProps) {
  return {
    userAlarm: props.userAlarm,
  };
}

const mapDispatchToProps = {
  updateUserAlarm,
};

interface State {
  alarm_id: number;
  name: string;
  alarm_level: number;
  for_duration: number;
  enabled: boolean;
  context: any;
}

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = ConnectedProps<typeof connector> & OwnProps;

export class UserAlarmSettings extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      alarm_id: this.props.userAlarm.alarm_id,
      name: this.props.userAlarm.name,
      alarm_level: this.props.userAlarm.alarm_level,
      for_duration: this.props.userAlarm.for_duration,
      enabled: this.props.userAlarm.enabled,
      context: this.props.userAlarm.context,
    };
  }

  update = async () => {
    const { for_duration, enabled, context } = this.state;
    const { alarmLevel, site_id, asset_id } = this.props;
    this.props.updateUserAlarm(alarmLevel, site_id, asset_id, for_duration, enabled, context);
  };

  alarmLevels = AlarmLevels.map(
    (level: AlarmLevelInfo): SelectableValue<number> => ({
      value: level.value,
      label: level.description,
      name: level.label,
    })
  );

  onUpdateContext = (config: any) => {
    this.setState({
      context: config,
    });
  };

  onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    switch (event.target.id) {
      case 'name':
        this.setState({
          name: event.target.value,
        });
        break;
      case 'for_duration':
        this.setState({
          for_duration: Number(event.target.value),
        });
        break;
    }
  };

  onEnabledChange = (checked: boolean) => {
    this.setState({
      enabled: checked,
    });
  };

  render() {
    const { alarm_level, name, for_duration, enabled, context } = this.state;
    const { alarmLevel } = this.props;
    const warning = alarm_level !== alarmLevel ? true : false;
    const level = AlarmLevels.find((dp) => Number(dp.value) === alarmLevel);
    return (
      <div>
        <div className="gf-form-group">
          {warning && (
            <div className="grafana-info-box span8">
              {' '}
              Warning : Updates all the instances across {level?.label}. To disable all the alarms just update with
              enabled off. The context settings for this alarm would be reset across {level?.label}.
            </div>
          )}
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
              id="for_duration"
              className="gf-form"
              label="For duration"
              value={for_duration}
              onChange={this.onChange}
              inputWidth={20}
              labelWidth={10}
            />
            <div className="gf-form">
              <LegacyForms.Switch label={'Enabled'} checked={enabled} onChange={() => this.onEnabledChange(!enabled)} />
            </div>
          </div>
          <div className="gf-form-group">
            <h3 className="page-heading">Alarm Configurations</h3>
            <JsonList isEditable={true} isDeletable={false} configs={context} updateConfig={this.onUpdateContext} />
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

export default connector(UserAlarmSettings);
