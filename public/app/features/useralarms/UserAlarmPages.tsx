import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';
// eslint-disable-next-line lodash/import-scope
import _ from 'lodash';
import Page from 'app/core/components/Page/Page';
import UserAlarmSettings from './UserAlarmSettings';
import { AlarmLevel, StoreState } from 'app/types';
import { loadUserAlarm } from './state/actions';
import { getUserAlarm } from './state/selectors';
import { getUserAlarmLoadingNav } from './state/navModel';
import { getNavModel } from 'app/core/selectors/navModel';
import { contextSrv } from 'app/core/services/context_srv';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';

interface AlarmPageRouteParams {
  id: string;
  page: string | null;
}

interface QueryParams {
  site_id: string;
  asset_id: string;
  alarm_level?: string;
}

export interface OwnProps extends GrafanaRouteComponentProps<AlarmPageRouteParams, QueryParams> {}

function mapStateToProps(state: StoreState, props: OwnProps) {
  const alarmLevel = props.queryParams.alarm_level ? parseInt(props.queryParams.alarm_level, 10) : AlarmLevel.Org;
  const alarmId = parseInt(props.match.params.id, 10);
  const pageName = props.match.params.page || 'settings';
  const alarm = getUserAlarm(state.userAlarm, alarmId);
  const alarmName = alarm ? alarm.name : 'Loading';
  const site_id = parseInt(props.queryParams.site_id, 10);
  const asset_id = parseInt(props.queryParams.asset_id, 10);
  const userAlarmLoadingNav = getUserAlarmLoadingNav(pageName as string, alarmName, site_id, asset_id);
  const navModel = getNavModel(state.navIndex, `alarm-${pageName}-${alarmId}`, userAlarmLoadingNav);

  return {
    navModel,
    alarmId: alarmId,
    pageName: pageName,
    alarm,
    alarmLevel: alarmLevel,
    signedInUser: contextSrv.user,
    site_id: site_id,
    asset_id: asset_id,
  };
}

const mapDispatchToProps = {
  loadUserAlarm,
};

interface State {
  isLoading: boolean;
}

enum PageTypes {
  Settings = 'settings',
}

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = OwnProps & ConnectedProps<typeof connector>;

export class UserAlarmPages extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: false,
    };
  }

  async componentDidMount() {
    await this.fetchAlarm();
  }

  async fetchAlarm() {
    const { loadUserAlarm, alarmId, alarmLevel, site_id, asset_id } = this.props;
    this.setState({ isLoading: true });
    const alarm = await loadUserAlarm(alarmId, alarmLevel, site_id, asset_id);
    this.setState({ isLoading: false });
    return alarm;
  }

  getCurrentPage() {
    const pages = ['settings'];
    const currentPage = this.props.pageName;
    return _.includes(pages, currentPage) ? currentPage : pages[0];
  }

  textsAreEqual = (text1: string, text2: string) => {
    if (!text1 && !text2) {
      return true;
    }

    if (!text1 || !text2) {
      return false;
    }

    return text1.toLocaleLowerCase() === text2.toLocaleLowerCase();
  };

  renderPage(grafanaAdmin: boolean): React.ReactNode {
    const currentPage = this.getCurrentPage();
    const { alarm, alarmLevel, site_id, asset_id } = this.props;

    switch (currentPage) {
      case grafanaAdmin && PageTypes.Settings:
        return <UserAlarmSettings alarmLevel={alarmLevel} site_id={site_id} asset_id={asset_id} userAlarm={alarm!} />;
    }

    return null;
  }

  render() {
    const { alarm, navModel, signedInUser } = this.props;

    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={this.state.isLoading}>
          {alarm && Object.keys(alarm).length !== 0 && this.renderPage(signedInUser.isGrafanaAdmin)}
        </Page.Contents>
      </Page>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserAlarmPages);
