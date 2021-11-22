import React, { PureComponent } from 'react';
import Page from 'app/core/components/Page/Page';
import { Button, DeleteButton, LinkButton, FilterInput } from '@grafana/ui';
import { NavModel } from '@grafana/data';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import { StoreState, Site, OrgRole } from 'app/types';
import { cloneSite, deleteSite, loadSites } from './state/actions';
import { getSearchQuery, getSites, getSitesCount } from './state/selectors';
import { getNavModel } from 'app/core/selectors/navModel';
import { contextSrv, User } from 'app/core/services/context_srv';
import { connectWithCleanUp } from '../../core/components/connectWithCleanUp';
import { setSearchQuery } from './state/reducers';

export interface Props {
  navModel: NavModel;
  sitesCount: number;
  sites: Site[];
  searchQuery: string;
  hasFetched: boolean;
  loadSites: typeof loadSites;
  deleteSite: typeof deleteSite;
  cloneSite: typeof cloneSite;
  setSearchQuery: typeof setSearchQuery;
  signedInUser: User;
}

export class SiteList extends PureComponent<Props, any> {
  componentDidMount() {
    this.fetchSites();
  }

  async fetchSites() {
    await this.props.loadSites();
  }

  deleteSite = (site: Site) => {
    this.props.deleteSite(site.id);
  };

  cloneSite = (site: Site) => {
    this.props.cloneSite(site.id);
  };

  onSearchQueryChange = (value: string) => {
    this.props.setSearchQuery(value);
  };

  renderSite(site: Site) {
    const siteUrl = `org/sites/edit/${site.id}`;
    const isEditable = this.isEditable();

    return (
      <tr key={site.id}>
        <td className="link-td">
          <a href={siteUrl}>{site.name}</a>
        </td>
        <td className="link-td">
          <a href={siteUrl}>{site.type}</a>
        </td>
        <td className="link-td">
          <a href={siteUrl}>{site.description}</a>
        </td>
        <td className="link-td">
          <a href={siteUrl}>{site.serial}</a>
        </td>
        <td className="link-td">
          <a href={siteUrl}>{site.alarm_count}</a>
        </td>
        <td className="link-td">
          <a href={siteUrl}>{site.team_count}</a>
        </td>
        <td className="link-td">
          <a href={siteUrl}>{site.asset_count}</a>
        </td>
        <td className="text-left">
          <Button size="sm" disabled={!isEditable} onClick={() => this.cloneSite(site)}>
            Clone
          </Button>
        </td>
        <td className="text-right">
          <DeleteButton size="sm" disabled={!isEditable} onConfirm={() => this.deleteSite(site)} />
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
    const newSiteHref = this.isEditable() ? 'org/sites/new' : '#';
    return (
      <EmptyListCTA
        title="No sites are created yet."
        buttonIcon="map-marker"
        buttonLink={newSiteHref}
        buttonTitle=" New site"
      />
    );
  }

  renderSiteList() {
    const { sites, searchQuery } = this.props;
    const disabledClass = this.isEditable() === true ? '' : ' disabled';
    const newSiteHref = this.isEditable() === true ? 'org/sites/new' : '#';

    return (
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search sites" value={searchQuery} onChange={this.onSearchQueryChange} />
          </div>

          <LinkButton className={disabledClass} href={newSiteHref}>
            New Site
          </LinkButton>
        </div>

        <div className="admin-list-table">
          <table className="filter-table filter-table--hover form-inline">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Description</th>
                <th>Serial</th>
                <th>Alarm Count</th>
                <th>Team Count</th>
                <th>Asset Count</th>
                <th />
                <th style={{ width: '1%' }} />
              </tr>
            </thead>
            <tbody>{sites.map((site) => this.renderSite(site))}</tbody>
          </table>
        </div>
      </>
    );
  }

  renderList() {
    const { sitesCount, hasFetched } = this.props;

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
    navModel: getNavModel(state.navIndex, 'sites'),
    sites: getSites(state.sites),
    searchQuery: getSearchQuery(state.sites),
    sitesCount: getSitesCount(state.sites),
    hasFetched: state.sites.hasFetched,
    signedInUser: contextSrv.user,
  };
}

const mapDispatchToProps = {
  loadSites,
  deleteSite,
  cloneSite,
  setSearchQuery,
};

export default connectWithCleanUp(mapStateToProps, mapDispatchToProps, (state) => state.sites)(SiteList);
