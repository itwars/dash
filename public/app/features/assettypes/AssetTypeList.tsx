import React, { PureComponent } from 'react';
import Page from 'app/core/components/Page/Page';
import { DeleteButton, LinkButton, FilterInput } from '@grafana/ui';
import { NavModel } from '@grafana/data';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import { StoreState, AssetType } from 'app/types';
import { deleteAssetType, loadAssetTypes } from './state/actions';
import { getSearchQuery, getAssetTypes, getAssetTypesCount } from './state/selectors';
import { getNavModel } from 'app/core/selectors/navModel';
import { contextSrv, User } from 'app/core/services/context_srv';
import { connectWithCleanUp } from '../../core/components/connectWithCleanUp';
import { setSearchQuery } from './state/reducers';

export interface Props {
  navModel: NavModel;
  assetTypesCount: number;
  assetTypes: AssetType[];
  searchQuery: string;
  hasFetched: boolean;
  loadAssetTypes: typeof loadAssetTypes;
  deleteAssetType: typeof deleteAssetType;
  setSearchQuery: typeof setSearchQuery;
  signedInUser: User;
}

export class AssetTypeList extends PureComponent<Props, any> {
  componentDidMount() {
    this.fetchAssetTypes();
  }

  async fetchAssetTypes() {
    await this.props.loadAssetTypes();
  }

  deleteAssetType = (assetType: AssetType) => {
    this.props.deleteAssetType(assetType.id);
  };

  onSearchQueryChange = (value: string) => {
    this.props.setSearchQuery(value);
  };

  renderAssetType(assetType: AssetType) {
    const { signedInUser } = this.props;
    const assetTypeUrl = `admin/assettypes/edit/${assetType.id}`;
    const canDelete = signedInUser.isGrafanaAdmin;

    return (
      <tr key={assetType.id}>
        <td className="link-td">
          <a href={assetTypeUrl}>{assetType.type}</a>
        </td>
        <td className="text-right">
          <DeleteButton
            aria-label="Delete"
            size="sm"
            disabled={!canDelete}
            onConfirm={() => this.deleteAssetType(assetType)}
          />
        </td>
      </tr>
    );
  }

  renderEmptyList() {
    return (
      <EmptyListCTA
        title="You haven't created any assettypes yet."
        buttonIcon="users-alt"
        buttonLink="admin/assettypes/new"
        buttonTitle=" New assettype"
      />
    );
  }

  renderAssetTypeList() {
    const { assetTypes, searchQuery, signedInUser } = this.props;
    const disabledClass = signedInUser.isGrafanaAdmin ? '' : ' disabled';
    const newAssetTypeHref = signedInUser.isGrafanaAdmin ? 'admin/assettypes/new' : '#';

    return (
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search assetTypes" value={searchQuery} onChange={this.onSearchQueryChange} />
          </div>

          <LinkButton className={disabledClass} href={newAssetTypeHref}>
            New AssetType
          </LinkButton>
        </div>

        <div className="admin-list-table">
          <table className="filter-table filter-table--hover form-inline">
            <thead>
              <tr>
                <th>Type</th>
                <th style={{ width: '1%' }} />
              </tr>
            </thead>
            <tbody>{assetTypes.map((assetType) => this.renderAssetType(assetType))}</tbody>
          </table>
        </div>
      </>
    );
  }

  renderList() {
    const { assetTypesCount, hasFetched } = this.props;

    if (!hasFetched) {
      return null;
    }

    if (assetTypesCount > 0) {
      return this.renderAssetTypeList();
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
    navModel: getNavModel(state.navIndex, 'assettypes'),
    assetTypes: getAssetTypes(state.assetTypes),
    searchQuery: getSearchQuery(state.assetTypes),
    assetTypesCount: getAssetTypesCount(state.assetTypes),
    hasFetched: state.assetTypes.hasFetched,
    signedInUser: contextSrv.user,
  };
}

const mapDispatchToProps = {
  loadAssetTypes,
  deleteAssetType,
  setSearchQuery,
};

export default connectWithCleanUp(mapStateToProps, mapDispatchToProps, (state) => state.assetTypes)(AssetTypeList);
