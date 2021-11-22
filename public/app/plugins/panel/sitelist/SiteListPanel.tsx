import { SiteOptions } from './types';
import { PanelProps } from '@grafana/data';
import React, { PureComponent } from 'react';
import { Site } from 'app/types';
import { getBackendSrv } from '@grafana/runtime';
import Page from 'app/core/components/Page/Page';
import { FilterInput, Pagination } from '../../../../../packages/grafana-ui/src';
import EmptyList from 'app/core/components/EmptyListCTA/EmptyList';

interface Props extends PanelProps<SiteOptions> {}

interface State {
  sites: Site[];
  page: number;
  searchQuery: string;
  hasFetched: boolean;
  sitesCount: number;
}

export class SiteListPanel extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      sites: [],
      hasFetched: false,
      searchQuery: '',
      page: 1,
      sitesCount: 0,
    };
  }

  async componentDidMount() {
    const { options } = this.props;
    const { searchQuery, page } = this.state;
    await this.loadSites(searchQuery, page, options.limit);
  }

  async loadSites(query: string, page: number, limit: number) {
    const response = await getBackendSrv().get('/api/sites/search', { perpage: limit, page: page, query: query });
    this.setState({
      sites: response.data,
      page: response.page,
      sitesCount: response.totalCount,
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
    await this.loadSites(searchQuery, page, options.limit);
  };

  renderSite(site: Site) {
    return (
      <tr key={site.id}>
        <td className="link-td">
          <a href={site.url}>{site.name}</a>
        </td>
        <td className="link-td">
          <a href={site.url}>{site.type}</a>
        </td>
        <td className="link-td">
          <a href={site.url}>{site.description}</a>
        </td>
        <td className="link-td">
          <a href={site.url}>{site.alarm_count}</a>
        </td>
        <td className="link-td">
          <a href={site.url}>{site.team_count}</a>
        </td>
        <td className="link-td">
          <a href={site.url}>{site.asset_count}</a>
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
    await this.loadSites(value, page, options.limit);
  };

  renderEmptyList() {
    return <EmptyList title="There are no sites available." />;
  }

  renderSiteList() {
    const { options } = this.props;
    const { sites, sitesCount, page } = this.state;
    const totalPages = Math.floor(sitesCount / options.limit) + 1;

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
                <th>Team Count</th>
                <th>Asset Count</th>
              </tr>
            </thead>
            <tbody>{sites.map((site) => this.renderSite(site))}</tbody>
          </table>
          {<Pagination numberOfPages={totalPages} currentPage={page} onNavigate={this.onNavigate} />}
        </div>
      </>
    );
  }

  renderList() {
    const { sitesCount, hasFetched } = this.state;

    if (!hasFetched) {
      return null;
    }

    if (sitesCount > 0) {
      return this.renderSiteList();
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
              <FilterInput placeholder="Search sites" value={searchQuery} onChange={this.onSearchQueryChange} />
            </div>
          </div>
          {this.renderList()}
        </>
      </Page.Contents>
    );
  }
}
