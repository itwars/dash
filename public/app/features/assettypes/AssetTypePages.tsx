import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';
// eslint-disable-next-line lodash/import-scope
import _ from 'lodash';
import Page from 'app/core/components/Page/Page';
import AssetTypeSettings from './AssetTypeSettings';
import { StoreState } from 'app/types';
import { loadAssetType } from './state/actions';
import { getAssetType } from './state/selectors';
import { getAssetTypeLoadingNav } from './state/navModel';
import { getNavModel } from 'app/core/selectors/navModel';
import { contextSrv } from 'app/core/services/context_srv';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';

interface AssetTypePageRouteParams {
  id: string;
  page: string | null;
}

export interface OwnProps extends GrafanaRouteComponentProps<AssetTypePageRouteParams> {}

interface State {
  isLoading: boolean;
}

enum PageTypes {
  Settings = 'settings',
}

function mapStateToProps(state: StoreState, props: OwnProps) {
  const assetTypeId = parseInt(props.match.params.id, 10);
  const pageName = props.match.params.page || 'settings';
  const assetTypeLoadingNav = getAssetTypeLoadingNav(pageName as string);
  const navModel = getNavModel(state.navIndex, `assettype-${pageName}-${assetTypeId}`, assetTypeLoadingNav);
  const assetType = getAssetType(state.assetType, assetTypeId);

  return {
    navModel,
    assetTypeId: assetTypeId,
    pageName: pageName,
    assetType,
    signedInUser: contextSrv.user,
  };
}

const mapDispatchToProps = {
  loadAssetType,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = OwnProps & ConnectedProps<typeof connector>;

export class AssetTypePages extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: false,
    };
  }

  async componentDidMount() {
    await this.fetchAssetType();
  }

  async fetchAssetType() {
    const { loadAssetType, assetTypeId } = this.props;
    this.setState({ isLoading: true });
    const assetType = await loadAssetType(assetTypeId);
    this.setState({ isLoading: false });
    return assetType;
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
    const { assetType } = this.props;

    switch (currentPage) {
      case grafanaAdmin && PageTypes.Settings:
        return <AssetTypeSettings assetType={assetType!} />;
    }

    return null;
  }

  render() {
    const { assetType, navModel, signedInUser } = this.props;

    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={this.state.isLoading}>
          {assetType && Object.keys(assetType).length !== 0 && this.renderPage(signedInUser.isGrafanaAdmin)}
        </Page.Contents>
      </Page>
    );
  }
}

export default connector(AssetTypePages);
