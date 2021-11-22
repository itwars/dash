import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Button, DeleteButton, LinkButton, FilterInput } from '@grafana/ui';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import { StoreState, Asset, OrgRole } from 'app/types';
import { deleteAsset, cloneAsset } from './state/actions';
import { getSearchAssetQuery, getAssetsCount } from './state/selectors';
import { contextSrv } from 'app/core/services/context_srv';
import { setSearchAssetQuery } from './state/reducers';

export interface OwnProps {
  siteId: number;
  assets: Asset[];
}

export interface State {}

function mapStateToProps(state: StoreState, props: OwnProps) {
  return {
    siteId: props.siteId,
    searchAssetQuery: getSearchAssetQuery(state.site),
    assetsCount: getAssetsCount(state.site),
    signedInUser: contextSrv.user,
  };
}

const mapDispatchToProps = {
  deleteAsset,
  cloneAsset,
  setSearchAssetQuery,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = OwnProps & ConnectedProps<typeof connector>;

export class AssetList extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  deleteAsset = (asset: Asset) => {
    this.props.deleteAsset(asset.id);
  };

  cloneAsset = (asset: Asset) => {
    this.props.cloneAsset(asset.id);
  };

  onSearchAssetQueryChange = (value: string) => {
    this.props.setSearchAssetQuery(value);
  };

  renderAsset(asset: Asset) {
    const assetUrl = `org/sites/${this.props.siteId}/assets/edit/${asset.id}`;
    const isEditable = this.isEditable();

    return (
      <tr key={asset.id}>
        <td className="link-td">
          <a href={assetUrl}>{asset.name}</a>
        </td>
        <td className="link-td">
          <a href={assetUrl}>{asset.serial}</a>
        </td>
        <td className="link-td">
          <a href={assetUrl}>{asset.type}</a>
        </td>
        <td className="link-td">
          <a href={assetUrl}>{asset.description}</a>
        </td>
        <td className="link-td">
          <a href={assetUrl}>{asset.alarm_count}</a>
        </td>
        <td className="text-left">
          <Button size="sm" disabled={!isEditable} onClick={() => this.cloneAsset(asset)}>
            Clone
          </Button>
        </td>
        <td className="text-right">
          <DeleteButton size="sm" disabled={!isEditable} onConfirm={() => this.deleteAsset(asset)} />
        </td>
      </tr>
    );
  }

  isEditable = () => {
    return (
      this.props.signedInUser.isGrafanaAdmin ||
      this.props.signedInUser.orgRole === OrgRole.Admin ||
      this.props.signedInUser.orgRole === OrgRole.Editor
    );
  };

  renderEmptyList() {
    const newAssetHref = this.isEditable() ? `org/sites/${this.props.siteId}/assets/new` : '#';
    return (
      <div>
        <EmptyListCTA
          title="No assets are created yet."
          buttonIcon="rss"
          buttonLink={newAssetHref}
          buttonTitle=" New asset"
        />
      </div>
    );
  }

  renderAssetList() {
    const { assets, searchAssetQuery } = this.props;
    const disabledClass = this.isEditable() === true ? '' : ' disabled';
    const newAssetHref = this.isEditable() === true ? `org/sites/${this.props.siteId}/assets/new` : '#';

    return (
      <div>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput
              placeholder="Search assets"
              value={searchAssetQuery}
              onChange={this.onSearchAssetQueryChange}
            />
          </div>

          <LinkButton className={disabledClass} href={newAssetHref}>
            New Asset
          </LinkButton>
        </div>

        <div className="admin-list-table">
          <table className="filter-table filter-table--hover form-inline">
            <thead>
              <tr>
                <th>Name</th>
                <th>Serial</th>
                <th>Type</th>
                <th>Description</th>
                <th>Alarm Count</th>
                <th />
                <th style={{ width: '1%' }} />
              </tr>
            </thead>
            <tbody>{assets.map((asset) => this.renderAsset(asset))}</tbody>
          </table>
        </div>
      </div>
    );
  }

  render() {
    const { assetsCount } = this.props;

    if (assetsCount > 0) {
      return this.renderAssetList();
    } else {
      return this.renderEmptyList();
    }
  }
}

export default connector(AssetList);
