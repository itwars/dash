import React, { PureComponent } from 'react';
import { getFieldDisplayValues, PanelProps } from '@grafana/data';

import { config } from 'app/core/config';
import { SwitchDisplayMode, SwitchPanelOptions } from './types';
import Switch from 'react-switch';
import { Slider } from '@grafana/ui';
import { getBackendSrv, getLocationSrv } from '@grafana/runtime';

interface State {
  value: number;
  enabled: boolean;
}

interface OwnProps {}

export type Props = OwnProps & PanelProps<SwitchPanelOptions>;

export class SwitchPanel extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      value: 0,
      enabled: true,
    };
  }

  async componentDidMount() {
    this.setState({
      value: this.getValue(),
    });
  }

  changeSwitch = (state: any) => {
    const { options } = this.props;
    const value = state === true ? options.switchON : options.switchOFF;
    this.setState({
      ...this.state,
      value: value,
      enabled: false,
    });
    this.publish();
  };

  changeSlider = (value: any) => {
    this.setState({
      ...this.state,
      value: value,
    });
  };

  changedSlider = () => {
    this.setState({
      ...this.state,
      enabled: false,
    });
    this.publish();
  };

  publish = async () => {
    const { siteId, assetId } = getLocationSrv().getLocationQuery();
    const { options } = this.props;
    const { value } = this.state;

    let action: any;
    let command: any;
    switch (options.displayMode) {
      case SwitchDisplayMode.Switch:
        action = value;
        command = 'toggle';
        break;
      case SwitchDisplayMode.Slider:
        action = value;
        command = 'dimming';
        break;
    }
    const data = [
      {
        key: 'action',
        value: action.toString(),
      },
    ];
    const payload = {
      client: options.client,
      command: command,
      data: data,
    };

    await getBackendSrv()
      .post(`/api/sites/${siteId}/assets/${assetId}/downlink`, payload)
      .catch(() => {});

    setTimeout(async () => {
      this.setState({
        value: this.getValue(),
        enabled: true,
      });
      this.render();
    }, 20000);
  };

  getValue = (): number => {
    const { data, options, replaceVariables, fieldConfig, timeZone } = this.props;
    let value = 0;

    const values = getFieldDisplayValues({
      fieldConfig,
      reduceOptions: options.reduceOptions,
      replaceVariables,
      theme: config.theme2,
      data: data.series,
      timeZone,
    });
    if (values.length > 0) {
      value = values[0].display.numeric;
    }
    return value;
  };

  render() {
    const { value, enabled } = this.state;
    const { options } = this.props;

    if (options.displayMode === SwitchDisplayMode.Switch) {
      return (
        <div className="switch-panel">
          <div className="switch-container">
            <Switch
              onChange={(state) => this.changeSwitch(state)}
              checked={value === options.switchON ? true : false}
              disabled={!enabled}
            />
          </div>
        </div>
      );
    }
    return (
      <div className="switch-panel">
        <div className="slider-container">
          <Slider
            min={options.sliderMin}
            max={options.sliderMax}
            value={value}
            onChange={this.changeSlider}
            onAfterChange={this.changedSlider}
            disabled={!enabled}
          />
        </div>
      </div>
    );
  }
}
