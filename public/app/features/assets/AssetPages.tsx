import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';
// eslint-disable-next-line lodash/import-scope
import _ from 'lodash';
import Page from 'app/core/components/Page/Page';
import AssetSettings from './AssetSettings';
import { StoreState } from 'app/types';
import { loadAsset, loadUserAlarms } from './state/actions';
import { getAsset, getAlarms } from './state/selectors';
import { getAssetLoadingNav } from './state/navModel';
import { getNavModel } from 'app/core/selectors/navModel';
import UserAlarmList from './UserAlarmList';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';

interface AssetPageRouteParams {
  id: string;
  siteId: string;
  page: string | null;
}
export interface OwnProps extends GrafanaRouteComponentProps<AssetPageRouteParams> {}

interface State {
  isLoading: boolean;
}

enum PageTypes {
  Settings = 'settings',
  Alarms = 'alarms',
}

function mapStateToProps(state: StoreState, props: OwnProps) {
  const assetId = parseInt(props.match.params.id, 10);
  const siteId = parseInt(props.match.params.siteId, 10);
  const pageName = props.match.params.page || 'alarms';
  const assetLoadingNav = getAssetLoadingNav(pageName as string);
  const navModel = getNavModel(state.navIndex, `asset-${pageName}-${assetId}`, assetLoadingNav);
  const asset = getAsset(state.asset, assetId);
  const alarms = getAlarms(state.asset);

  return {
    navModel,
    assetId: assetId,
    siteId: siteId,
    pageName: pageName,
    asset,
    alarms,
  };
}

const mapDispatchToProps = {
  loadAsset,
  loadUserAlarms,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = OwnProps & ConnectedProps<typeof connector>;

export class AssetPages extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: false,
    };
  }

  async componentDidMount() {
    await this.fetchAsset();
  }

  async fetchAsset() {
    const { loadAsset, assetId, siteId } = this.props;
    this.setState({ isLoading: true });
    const asset = await loadAsset(assetId, siteId);
    await this.props.loadUserAlarms(siteId, assetId);
    this.setState({ isLoading: false });
    return asset;
  }

  getCurrentPage() {
    const pages = ['settings', 'alarms'];
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
    const { alarms, asset, assetId, siteId } = this.props;

    switch (currentPage) {
      case PageTypes.Settings:
        return <AssetSettings asset={asset!} />;
      case PageTypes.Alarms:
        return <UserAlarmList userAlarms={alarms} siteId={siteId} assetId={assetId} />;
    }

    return null;
  }

  render() {
    const { asset, navModel } = this.props;

    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={this.state.isLoading}>
          {asset && Object.keys(asset).length !== 0 && this.renderPage()}
        </Page.Contents>
      </Page>
    );
  }
}

export default connector(AssetPages);
