import React, { PureComponent } from 'react';
import Page from 'app/core/components/Page/Page';
import { DeleteButton, LinkButton, FilterInput } from '@grafana/ui';
import { NavModel } from '@grafana/data';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import { StoreState, SiteType } from 'app/types';
import { deleteSiteType, loadSiteTypes } from './state/actions';
import { getSearchQuery, getSiteTypes, getSiteTypesCount } from './state/selectors';
import { getNavModel } from 'app/core/selectors/navModel';
import { contextSrv, User } from 'app/core/services/context_srv';
import { connectWithCleanUp } from '../../core/components/connectWithCleanUp';
import { setSearchQuery } from './state/reducers';

export interface Props {
  navModel: NavModel;
  siteTypesCount: number;
  siteTypes: SiteType[];
  searchQuery: string;
  hasFetched: boolean;
  loadSiteTypes: typeof loadSiteTypes;
  deleteSiteType: typeof deleteSiteType;
  setSearchQuery: typeof setSearchQuery;
  signedInUser: User;
}

export class SiteTypeList extends PureComponent<Props, any> {
  componentDidMount() {
    this.fetchSiteTypes();
  }

  async fetchSiteTypes() {
    await this.props.loadSiteTypes();
  }

  deleteSiteType = (siteType: SiteType) => {
    this.props.deleteSiteType(siteType.id);
  };

  onSearchQueryChange = (value: string) => {
    this.props.setSearchQuery(value);
  };

  renderSiteType(siteType: SiteType) {
    const { signedInUser } = this.props;
    const siteTypeUrl = `admin/sitetypes/edit/${siteType.id}`;
    const canDelete = signedInUser.isGrafanaAdmin;

    return (
      <tr key={siteType.id}>
        <td className="link-td">
          <a href={siteTypeUrl}>{siteType.type}</a>
        </td>
        <td className="text-right">
          <DeleteButton size="sm" disabled={!canDelete} onConfirm={() => this.deleteSiteType(siteType)} />
        </td>
      </tr>
    );
  }

  renderEmptyList() {
    return (
      <EmptyListCTA
        title="You haven't created any sitetypes yet."
        buttonIcon="users-alt"
        buttonLink="admin/sitetypes/new"
        buttonTitle=" New sitetype"
      />
    );
  }

  renderSiteTypeList() {
    const { siteTypes, searchQuery, signedInUser } = this.props;
    const disabledClass = signedInUser.isGrafanaAdmin ? '' : ' disabled';
    const newSiteTypeHref = signedInUser.isGrafanaAdmin ? 'admin/sitetypes/new' : '#';

    return (
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search siteTypes" value={searchQuery} onChange={this.onSearchQueryChange} />
          </div>

          <LinkButton className={disabledClass} href={newSiteTypeHref}>
            New SiteType
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
            <tbody>{siteTypes.map((siteType) => this.renderSiteType(siteType))}</tbody>
          </table>
        </div>
      </>
    );
  }

  renderList() {
    const { siteTypesCount, hasFetched } = this.props;

    if (!hasFetched) {
      return null;
    }

    if (siteTypesCount > 0) {
      return this.renderSiteTypeList();
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
    navModel: getNavModel(state.navIndex, 'sitetypes'),
    siteTypes: getSiteTypes(state.siteTypes),
    searchQuery: getSearchQuery(state.siteTypes),
    siteTypesCount: getSiteTypesCount(state.siteTypes),
    hasFetched: state.siteTypes.hasFetched,
    signedInUser: contextSrv.user,
  };
}

const mapDispatchToProps = {
  loadSiteTypes,
  deleteSiteType,
  setSearchQuery,
};

export default connectWithCleanUp(mapStateToProps, mapDispatchToProps, (state) => state.siteTypes)(SiteTypeList);
