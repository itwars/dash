import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';
// eslint-disable-next-line lodash/import-scope
import _ from 'lodash';
import Page from 'app/core/components/Page/Page';
import SiteSettings from './SiteSettings';
import { loadAssets, loadTeams, loadUserAlarms, loadSite } from './state/actions';
import { getAssets, getTeams, getSite, getAlarms } from './state/selectors';
import { getSiteLoadingNav } from './state/navModel';
import { getNavModel } from 'app/core/selectors/navModel';
import { StoreState } from 'app/types';
import AssetList from './AssetList';
import TeamList from './TeamList';
import UserAlarmList from './UserAlarmList';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';

interface SitePageRouteParams {
  id: string;
  page: string | null;
}

export interface OwnProps extends GrafanaRouteComponentProps<SitePageRouteParams> {}

interface State {
  isLoading: boolean;
}

enum PageTypes {
  Assets = 'assets',
  Teams = 'teams',
  Settings = 'settings',
  Alarms = 'alarms',
}

function mapStateToProps(state: StoreState, props: OwnProps) {
  const siteId = parseInt(props.match.params.id, 10);
  const pageName = props.match.params.page || 'assets';
  const siteLoadingNav = getSiteLoadingNav(pageName as string);
  const navModel = getNavModel(state.navIndex, `site-${pageName}-${siteId}`, siteLoadingNav);
  const site = getSite(state.site, siteId);
  const assets = getAssets(state.site);
  const teams = getTeams(state.site);
  const alarms = getAlarms(state.site);

  return {
    navModel,
    siteId: siteId,
    pageName: pageName,
    site,
    assets,
    teams,
    alarms,
  };
}

const mapDispatchToProps = {
  loadSite,
  loadAssets,
  loadTeams,
  loadUserAlarms,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = OwnProps & ConnectedProps<typeof connector>;

export class SitePages extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: false,
    };
  }

  async componentDidMount() {
    await this.fetchSite();
  }

  async fetchSite() {
    const { loadSite, siteId } = this.props;
    this.setState({ isLoading: true });
    const site = await loadSite(siteId);
    await this.props.loadAssets(siteId);
    await this.props.loadTeams(siteId);
    await this.props.loadUserAlarms(siteId);
    this.setState({ isLoading: false });
    return site;
  }

  getCurrentPage() {
    const pages = ['assets', 'teams', 'alarms', 'settings'];
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

  renderPage(): React.ReactNode {
    const currentPage = this.getCurrentPage();
    const { assets, teams, alarms, siteId, site } = this.props;

    switch (currentPage) {
      case PageTypes.Assets:
        return <AssetList assets={assets} siteId={siteId} />;
      case PageTypes.Teams:
        return <TeamList teams={teams} siteId={siteId} />;
      case PageTypes.Alarms:
        return <UserAlarmList userAlarms={alarms} siteId={siteId} />;
      case PageTypes.Settings:
        return <SiteSettings site={site!} />;
    }

    return null;
  }

  render() {
    const { site, navModel } = this.props;

    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={this.state.isLoading}>
          {site && Object.keys(site).length !== 0 && this.renderPage()}
        </Page.Contents>
      </Page>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SitePages);
