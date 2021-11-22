import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Checkbox, FilterInput } from '@grafana/ui';
import { StoreState, UserAlarm, AlarmLevels, AlarmLevel } from 'app/types';
import { loadUserAlarms } from '../useralarms/state/actions';
import { getSearchAlarmQuery, getUserAlarmsCount } from './state/selectors';
import { contextSrv } from 'app/core/services/context_srv';
import { setSearchAlarmQuery } from './state/reducers';
import EmptyList from 'app/core/components/EmptyListCTA/EmptyList';

export interface OwnProps {
  siteId: number;
  userAlarms: UserAlarm[];
}

function mapStateToProps(state: StoreState, props: OwnProps) {
  return {
    searchAlarmQuery: getSearchAlarmQuery(state.site),
    userAlarmsCount: getUserAlarmsCount(state.site),
    signedInUser: contextSrv.user,
    siteId: props.siteId,
  };
}

const mapDispatchToProps = {
  loadUserAlarms,
  setSearchAlarmQuery,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = OwnProps & ConnectedProps<typeof connector>;

export class UserAlarmList extends PureComponent<Props, any> {
  constructor(props: Props) {
    super(props);
  }

  onSearchAlarmQueryChange = (value: string) => {
    this.props.setSearchAlarmQuery(value);
  };

  renderAlarm(alarm: UserAlarm) {
    const { siteId } = this.props;
    const alarmLevel = AlarmLevels.find((dp) => Number(dp.value) === alarm.alarm_level);
    const alarmUrl = `site/useralarms/edit/${alarm.alarm_id}?alarm_level=${AlarmLevel.Site}&site_id=${siteId}&asset_id=0`;

    return (
      <tr key={alarm.alarm_id}>
        <td className="link-td">
          <a href={alarmUrl}>{alarm.name}</a>
        </td>
        <td className="text-center link-td">
          <a href={alarmUrl}>{alarmLevel?.label}</a>
        </td>
        <td className="text-center link-td">
          <a href={alarmUrl}>{alarm.for_duration}</a>
        </td>
        <td className="text-center link-td">
          <a href={alarmUrl}>
            <Checkbox value={alarm.enabled} disabled={true} />
          </a>
        </td>
      </tr>
    );
  }

  renderEmptyList() {
    return (
      <EmptyList title="There are no items created for this Object" proTip="Ask administrator to update Object." />
    );
  }

  renderUserAlarmList() {
    const { userAlarms, searchAlarmQuery } = this.props;

    return (
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput
              placeholder="Search alarms"
              value={searchAlarmQuery}
              onChange={this.onSearchAlarmQueryChange}
            />
          </div>
        </div>

        <div className="admin-list-table">
          <table className="filter-table filter-table--hover form-inline">
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>Name</th>
                <th style={{ textAlign: 'center' }}>Scope</th>
                <th style={{ textAlign: 'center' }}>For Duration</th>
                <th style={{ textAlign: 'center' }}>Enabled</th>
              </tr>
            </thead>
            <tbody>{userAlarms.map((alarm) => this.renderAlarm(alarm))}</tbody>
          </table>
        </div>
      </>
    );
  }

  render() {
    const { userAlarmsCount } = this.props;

    if (userAlarmsCount > 0) {
      return this.renderUserAlarmList();
    } else {
      return this.renderEmptyList();
    }
  }
}

export default connector(UserAlarmList);
