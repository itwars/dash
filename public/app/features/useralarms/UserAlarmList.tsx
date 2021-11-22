import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Page from 'app/core/components/Page/Page';
import { Checkbox, FilterInput } from '@grafana/ui';
import { StoreState, UserAlarm, AlarmLevels, AlarmLevel } from 'app/types';
import { loadUserAlarms } from './state/actions';
import { getSearchQuery, getUserAlarms, getUserAlarmsCount } from './state/selectors';
import { getNavModel } from 'app/core/selectors/navModel';
import { contextSrv } from 'app/core/services/context_srv';
import { setSearchQuery } from './state/reducers';
import EmptyList from 'app/core/components/EmptyListCTA/EmptyList';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';

interface QueryParams {
  site_id: string;
  asset_id: string;
  alarm_level?: string;
}

export interface OwnProps extends GrafanaRouteComponentProps<{}, QueryParams> {}

function mapStateToProps(state: StoreState, props: OwnProps) {
  const alarmLevel = props.queryParams.alarm_level ? parseInt(props.queryParams.alarm_level, 10) : AlarmLevel.Org;
  return {
    navModel: getNavModel(state.navIndex, 'useralarms'),
    userAlarms: getUserAlarms(state.userAlarms),
    searchQuery: getSearchQuery(state.userAlarms),
    userAlarmsCount: getUserAlarmsCount(state.userAlarms),
    hasFetched: state.userAlarms.hasFetched,
    signedInUser: contextSrv.user,
    site_id: parseInt(props.queryParams.site_id, 10),
    asset_id: parseInt(props.queryParams.asset_id, 10),
    alarm_level: alarmLevel,
  };
}

const mapDispatchToProps = {
  loadUserAlarms,
  setSearchQuery,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = OwnProps & ConnectedProps<typeof connector>;

export class UserAlarmList extends PureComponent<Props, any> {
  componentDidMount() {
    this.fetchAlarms();
  }

  async fetchAlarms() {
    const { alarm_level, site_id, asset_id } = this.props;
    await this.props.loadUserAlarms(alarm_level, site_id, asset_id);
  }

  onSearchQueryChange = (value: string) => {
    this.props.setSearchQuery(value);
  };

  renderAlarm(alarm: UserAlarm) {
    const alarmUrl = `org/useralarms/edit/${alarm.alarm_id}`;
    const alarmLevel = AlarmLevels.find((dp) => Number(dp.value) === alarm.alarm_level);

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
    const { userAlarms, searchQuery } = this.props;

    return (
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search alarms" value={searchQuery} onChange={this.onSearchQueryChange} />
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

  renderList() {
    const { userAlarmsCount, hasFetched } = this.props;

    if (!hasFetched) {
      return null;
    }

    if (userAlarmsCount > 0) {
      return this.renderUserAlarmList();
    } else {
      return this.renderEmptyList();
    }
  }

  render() {
    const { hasFetched, navModel } = this.props;

    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={!hasFetched}>{this.renderList()}</Page.Contents>
      </Page>
    );
  }
}

export default connector(UserAlarmList);
