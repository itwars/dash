import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';
// eslint-disable-next-line lodash/import-scope
import _ from 'lodash';
import Page from 'app/core/components/Page/Page';
import SiteTypeSettings from './SiteTypeSettings';
import { StoreState } from 'app/types';
import { loadSiteType } from './state/actions';
import { getSiteType } from './state/selectors';
import { getSiteTypeLoadingNav } from './state/navModel';
import { getNavModel } from 'app/core/selectors/navModel';
import { contextSrv } from 'app/core/services/context_srv';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';

interface SiteTypePageRouteParams {
  id: string;
  page: string | null;
}

export interface OwnProps extends GrafanaRouteComponentProps<SiteTypePageRouteParams> {}

interface State {
  isLoading: boolean;
}

enum PageTypes {
  Settings = 'settings',
}

function mapStateToProps(state: StoreState, props: OwnProps) {
  const siteTypeId = parseInt(props.match.params.id, 10);
  const pageName = props.match.params.page || 'settings';
  const siteTypeLoadingNav = getSiteTypeLoadingNav(pageName as string);
  const navModel = getNavModel(state.navIndex, `sitetype-${pageName}-${siteTypeId}`, siteTypeLoadingNav);
  const siteType = getSiteType(state.siteType, siteTypeId);

  return {
    navModel,
    siteTypeId: siteTypeId,
    pageName: pageName,
    siteType,
    signedInUser: contextSrv.user,
  };
}

const mapDispatchToProps = {
  loadSiteType,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = OwnProps & ConnectedProps<typeof connector>;

export class SiteTypePages extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: false,
    };
  }

  async componentDidMount() {
    await this.fetchSiteType();
  }

  async fetchSiteType() {
    const { loadSiteType, siteTypeId } = this.props;
    this.setState({ isLoading: true });
    const siteType = await loadSiteType(siteTypeId);
    this.setState({ isLoading: false });
    return siteType;
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
    const { siteType } = this.props;

    switch (currentPage) {
      case grafanaAdmin && PageTypes.Settings:
        return <SiteTypeSettings siteType={siteType!} />;
    }

    return null;
  }

  render() {
    const { siteType, navModel, signedInUser } = this.props;

    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={this.state.isLoading}>
          {siteType && Object.keys(siteType).length !== 0 && this.renderPage(signedInUser.isGrafanaAdmin)}
        </Page.Contents>
      </Page>
    );
  }
}

export default connector(SiteTypePages);
