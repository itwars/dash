// eslint-disable-next-line lodash/import-scope
import _ from 'lodash';
import { SiteSection, AssetSection, TeamSection, SearchItemType, QueryResult } from 'app/features/search/types';
import { backendSrv } from './backend_srv';

interface SiteSections {
  [key: string]: Partial<SiteSection>;
}

interface AssetSections {
  [key: string]: Partial<AssetSection>;
}

interface TeamSections {
  [key: string]: Partial<TeamSection>;
}

export class CustomSearchSrv {
  searchSites(options: any) {
    const sections: any = {};
    const query = _.clone(options);
    const promises = [];

    promises.push(
      backendSrv.searchSites(query).then((results) => {
        return this.handleSitesSearchResult(sections, results);
      })
    );

    return Promise.all(promises).then(() => {
      return _.sortBy(_.values(sections), 'score');
    });
  }

  searchTeams(options: any) {
    const sections: any = {};
    const query = _.clone(options);
    const promises = [];

    promises.push(
      backendSrv.searchTeams(query).then((results) => {
        return this.handleTeamsSearchResult(sections, results);
      })
    );

    return Promise.all(promises).then(() => {
      return _.sortBy(_.values(sections), 'score');
    });
  }

  searchAssets(options: any) {
    const sections: any = {};
    const query = _.clone(options);
    const promises = [];

    promises.push(
      backendSrv.searchAssets(query).then((results) => {
        return this.handleAssetsSearchResult(sections, results);
      })
    );

    return Promise.all(promises).then(() => {
      return _.sortBy(_.values(sections), 'score');
    });
  }

  searchTeamSites(options: any) {
    const sections: any = {};
    const query = _.clone(options);
    const promises = [];

    promises.push(
      backendSrv.searchTeamSites(query).then((results) => {
        return this.handleSitesSearchResult(sections, results);
      })
    );

    return Promise.all(promises).then(() => {
      return _.sortBy(_.values(sections), 'score');
    });
  }

  private handleAssetsSearchResult(sections: AssetSections, results: QueryResult): any {
    if (results.data.length === 0) {
      return sections;
    }
    // create folder index
    for (const hit of results.data) {
      sections[hit.id] = {
        id: hit.id,
        name: hit.name,
        serial: hit.serial,
        description: hit.description,
        type: hit.type,
        itemType: SearchItemType.DashDB,
        alarmCount: hit.alarm_count,
        icon: 'rss',
        url: hit.url,
      };
    }
    return sections;
  }

  private handleSitesSearchResult(sections: SiteSections, results: QueryResult): any {
    if (results.data.length === 0) {
      return sections;
    }
    // create folder index
    for (const hit of results.data) {
      sections[hit.id] = {
        id: hit.id,
        name: hit.name,
        description: hit.description,
        type: hit.type,
        itemType: SearchItemType.DashFolder,
        expanded: false,
        alarmCount: hit.alarm_count,
        icon: 'map-marker',
        url: hit.url,
        assets: [],
      };
    }
    return sections;
  }

  private handleTeamsSearchResult(sections: TeamSections, results: QueryResult): any {
    if (results.teams.length === 0) {
      return sections;
    }
    for (const hit of results.teams) {
      sections[hit.id] = {
        id: hit.id,
        name: hit.name,
        expanded: false,
        itemType: SearchItemType.DashFolder,
        avatarUrl: hit.avatarUrl,
        sites: [],
      };
    }
    return sections;
  }
}
