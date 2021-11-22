import { AssetOptions } from './types';
import { PanelProps } from '@grafana/data';
import React, { PureComponent } from 'react';
import { Asset } from 'app/types';
import { getBackendSrv, getLocationSrv } from '@grafana/runtime';
import Page from 'app/core/components/Page/Page';
import { FilterInput, Pagination } from '../../../../../packages/grafana-ui/src';
import EmptyList from 'app/core/components/EmptyListCTA/EmptyList';

interface Props extends PanelProps<AssetOptions> {}

interface State {
  assets: Asset[];
  page: number;
  searchQuery: string;
  hasFetched: boolean;
  assetsCount: number;
}

export class AssetListPanel extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      assets: [],
      hasFetched: false,
      searchQuery: '',
      page: 1,
      assetsCount: 0,
    };
  }

  async componentDidMount() {
    const { options } = this.props;
    const { searchQuery, page } = this.state;
    let { siteId } = getLocationSrv().getLocationQuery();
    siteId = siteId ? Number(siteId) : 0;
    await this.loadAssets(searchQuery, siteId, page, options.limit);
  }

  async loadAssets(query: string, site: number, page: number, limit: number) {
    const response = await getBackendSrv().get('/api/assets/search', {
      perpage: limit,
      siteId: site,
      page: page,
      query: query,
    });
    this.setState({
      assets: response.data,
      page: response.page,
      assetsCount: response.totalCount,
      hasFetched: true,
    });
    return response;
  }

  onNavigate = async (page: number) => {
    const { options } = this.props;
    this.setState({
      page: page,
      hasFetched: false,
    });
    const { searchQuery } = this.state;
    let { siteId } = getLocationSrv().getLocationQuery();
    siteId = siteId ? Number(siteId) : 0;
    await this.loadAssets(searchQuery, siteId, page, options.limit);
  };

  renderAsset(asset: Asset) {
    return (
      <tr key={asset.id}>
        <td className="link-td">
          <a href={asset.url}>{asset.name}</a>
        </td>
        <td className="link-td">
          <a href={asset.url}>{asset.type}</a>
        </td>
        <td className="link-td">
          <a href={asset.url}>{asset.description}</a>
        </td>
        <td className="link-td">
          <a href={asset.url}>{asset.alarm_count}</a>
        </td>
      </tr>
    );
  }

  onSearchQueryChange = async (value: string) => {
    this.setState({
      searchQuery: value,
    });
    const { options } = this.props;
    const { page } = this.state;
    let { siteId } = getLocationSrv().getLocationQuery();
    siteId = siteId ? Number(siteId) : 0;
    await this.loadAssets(value, siteId, page, options.limit);
  };

  renderEmptyList() {
    return <EmptyList title="There are no assets available." />;
  }

  renderAssetList() {
    const { options } = this.props;
    const { assets, assetsCount, page } = this.state;
    const totalPages = Math.floor(assetsCount / options.limit) + 1;

    return (
      <>
        <div className="admin-list-table">
          <table className="filter-table filter-table--hover form-inline">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Description</th>
                <th>Alarm Count</th>
              </tr>
            </thead>
            <tbody>{assets.map((asset) => this.renderAsset(asset))}</tbody>
          </table>
          {<Pagination numberOfPages={totalPages} currentPage={page} onNavigate={this.onNavigate} />}
        </div>
      </>
    );
  }

  renderList() {
    const { assetsCount, hasFetched } = this.state;

    if (!hasFetched) {
      return null;
    }

    if (assetsCount > 0) {
      return this.renderAssetList();
    } else {
      return this.renderEmptyList();
    }
  }

  render() {
    const { hasFetched, searchQuery } = this.state;
    return (
      <Page.Contents isLoading={!hasFetched}>
        <>
          <div className="page-action-bar">
            <div className="gf-form gf-form--grow">
              <FilterInput placeholder="Search assets" value={searchQuery} onChange={this.onSearchQueryChange} />
            </div>
          </div>
          {this.renderList()}
        </>
      </Page.Contents>
    );
  }
}
