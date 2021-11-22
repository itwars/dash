import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';
// eslint-disable-next-line lodash/import-scope
import _ from 'lodash';
import Page from 'app/core/components/Page/Page';
import AlarmSettings from './AlarmSettings';
import { StoreState } from 'app/types';
import { loadAlarm } from './state/actions';
import { getAlarm } from './state/selectors';
import { getAlarmLoadingNav } from './state/navModel';
import { getNavModel } from 'app/core/selectors/navModel';
import { contextSrv } from 'app/core/services/context_srv';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';

interface AlarmPageRouteParams {
  id: string;
  page: string | null;
}

export interface OwnProps extends GrafanaRouteComponentProps<AlarmPageRouteParams> {}

interface State {
  isLoading: boolean;
}

enum PageTypes {
  Settings = 'settings',
}

function mapStateToProps(state: StoreState, props: OwnProps) {
  const alarmId = parseInt(props.match.params.id, 10);
  const pageName = props.match.params.page || 'settings';
  const alarmLoadingNav = getAlarmLoadingNav(pageName as string);
  const navModel = getNavModel(state.navIndex, `alarm-${pageName}-${alarmId}`, alarmLoadingNav);
  const alarm = getAlarm(state.alarm, alarmId);

  return {
    navModel,
    alarmId: alarmId,
    pageName: pageName,
    alarm,
    signedInUser: contextSrv.user,
  };
}

const mapDispatchToProps = {
  loadAlarm,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = OwnProps & ConnectedProps<typeof connector>;

export class AlarmPages extends PureComponent<Props, State> {
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
    const { loadAlarm, alarmId } = this.props;
    this.setState({ isLoading: true });
    const alarm = await loadAlarm(alarmId);
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
    const { alarm } = this.props;

    switch (currentPage) {
      case grafanaAdmin && PageTypes.Settings:
        return <AlarmSettings alarm={alarm!} />;
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

export default connector(AlarmPages);
