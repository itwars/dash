import React, { PureComponent } from 'react';
import Page from 'app/core/components/Page/Page';
import { Checkbox, DeleteButton, FilterInput, LinkButton } from '@grafana/ui';
import { NavModel } from '@grafana/data';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import { StoreState, Alarm, AlarmPermissions, Severities, AlarmLevels } from 'app/types';
import { deleteAlarm, loadAlarms } from './state/actions';
import { getSearchQuery, getAlarms, getAlarmsCount } from './state/selectors';
import { getNavModel } from 'app/core/selectors/navModel';
import { contextSrv, User } from 'app/core/services/context_srv';
import { connectWithCleanUp } from '../../core/components/connectWithCleanUp';
import { setSearchQuery } from './state/reducers';

export interface Props {
  navModel: NavModel;
  alarmsCount: number;
  alarms: Alarm[];
  searchQuery: string;
  hasFetched: boolean;
  loadAlarms: typeof loadAlarms;
  deleteAlarm: typeof deleteAlarm;
  setSearchQuery: typeof setSearchQuery;
  signedInUser: User;
}

export class AlarmList extends PureComponent<Props, any> {
  componentDidMount() {
    this.fetchAlarms();
  }

  async fetchAlarms() {
    await this.props.loadAlarms();
  }

  deleteAlarm = (alarm: Alarm) => {
    this.props.deleteAlarm(alarm.id);
  };

  onSearchQueryChange = (value: string) => {
    this.props.setSearchQuery(value);
  };

  renderAlarm(alarm: Alarm) {
    const { signedInUser } = this.props;
    const alarmUrl = `admin/alarms/edit/${alarm.id}`;
    const canDelete = signedInUser.isGrafanaAdmin;

    const permission = AlarmPermissions.find((dp) => Number(dp.value) === alarm.permission_level);
    const severity = Severities.find((dp) => Number(dp.value) === alarm.severity);
    const alarmLevel = AlarmLevels.find((dp) => Number(dp.value) === alarm.alarm_level);

    return (
      <tr key={alarm.id}>
        <td className="link-td">
          <a href={alarmUrl}>{alarm.name}</a>
        </td>
        <td className="link-td">
          <a href={alarmUrl}>{alarm.description}</a>
        </td>
        <td className="text-center link-td">
          <a href={alarmUrl}>{severity?.label}</a>
        </td>
        <td className="text-center link-td">
          <a href={alarmUrl}>{permission?.label}</a>
        </td>
        <td className="text-center link-td">
          <a href={alarmUrl}>{alarmLevel?.label}</a>
        </td>
        <td className="text-center link-td">
          <a href={alarmUrl}>{alarm.for_duration}</a>
        </td>
        <td className="text-center link-td">
          <a href={alarmUrl}>
            <Checkbox value={alarm.manual_reset} disabled={true} />
          </a>
        </td>
        <td className="text-right">
          <DeleteButton
            aria-label="Delete alarm"
            size="sm"
            disabled={!canDelete}
            onConfirm={() => this.deleteAlarm(alarm)}
          />
        </td>
      </tr>
    );
  }

  renderEmptyList() {
    return (
      <EmptyListCTA
        title="You haven't created any alarms yet."
        buttonIcon="bell"
        buttonLink="admin/alarms/new"
        buttonTitle=" New alarm"
      />
    );
  }

  renderAlarmList() {
    const { alarms, searchQuery, signedInUser } = this.props;
    const disabledClass = signedInUser.isGrafanaAdmin ? '' : ' disabled';
    const newAlarmHref = signedInUser.isGrafanaAdmin ? 'admin/alarms/new' : '#';

    return (
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search alarms" value={searchQuery} onChange={this.onSearchQueryChange} />
          </div>

          <LinkButton className={disabledClass} href={newAlarmHref}>
            New Alarm
          </LinkButton>
        </div>

        <div className="admin-list-table">
          <table className="filter-table filter-table--hover form-inline">
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>Name</th>
                <th style={{ textAlign: 'center' }}>Description</th>
                <th style={{ textAlign: 'center' }}>Severity</th>
                <th style={{ textAlign: 'center' }}>Premission</th>
                <th style={{ textAlign: 'center' }}>Scope</th>
                <th style={{ textAlign: 'center' }}>For Duration</th>
                <th style={{ textAlign: 'center' }}>Manual Reset</th>
                <th style={{ width: '1%' }} />
              </tr>
            </thead>
            <tbody>{alarms.map((alarm) => this.renderAlarm(alarm))}</tbody>
          </table>
        </div>
      </>
    );
  }

  renderList() {
    const { alarmsCount, hasFetched } = this.props;

    if (!hasFetched) {
      return null;
    }

    if (alarmsCount > 0) {
      return this.renderAlarmList();
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

function mapStateToProps(state: StoreState) {
  return {
    navModel: getNavModel(state.navIndex, 'alarms'),
    alarms: getAlarms(state.alarms),
    searchQuery: getSearchQuery(state.alarms),
    alarmsCount: getAlarmsCount(state.alarms),
    hasFetched: state.alarms.hasFetched,
    signedInUser: contextSrv.user,
  };
}

const mapDispatchToProps = {
  loadAlarms,
  deleteAlarm,
  setSearchQuery,
};

export default connectWithCleanUp(mapStateToProps, mapDispatchToProps, (state) => state.alarms)(AlarmList);
