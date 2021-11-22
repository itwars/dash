import React, { PureComponent } from 'react';
import { PanelProps } from '@grafana/data';
import { ButtonPanelOptions } from './types';
import { Button } from '@grafana/ui';
import { getBackendSrv, getLocationSrv, RefreshEvent } from '@grafana/runtime';

interface State {}

interface OwnProps {}

export type Props = OwnProps & PanelProps<ButtonPanelOptions>;

export class ButtonPanel extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  changeButton = () => {
    this.publish();
  };

  publish = async () => {
    const { siteId, assetId } = getLocationSrv().getLocationQuery();
    const { options } = this.props;
    let command: any = options.command;
    const payload = {
      client: options.client,
      command: command,
      data: [],
    };

    await getBackendSrv().post(`/api/sites/${siteId}/assets/${assetId}/downlink`, payload).catch();

    this.props.eventBus.publish(new RefreshEvent());
  };

  render() {
    const { options } = this.props;

    return (
      <div className="switch-panel">
        <div className="switch-container">
          <Button variant="primary" size="md" style={{ margin: '5px' }} onClick={this.changeButton}>
            {options.displayLabel}
          </Button>
        </div>
      </div>
    );
  }
}
