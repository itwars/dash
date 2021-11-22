import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { DeleteButton, FilterInput } from '@grafana/ui';
import { StoreState, Team, OrgRole, SiteTeam } from 'app/types';
import { deleteTeam, addTeam } from './state/actions';
import { getSearchTeamQuery, getTeamsCount } from './state/selectors';
import { contextSrv } from 'app/core/services/context_srv';
import { setSearchTeamQuery } from './state/reducers';
import { SlideDown } from 'app/core/components/Animations/SlideDown';
import { TeamPicker } from 'app/core/components/Select/TeamPicker';
import EmptyList from 'app/core/components/EmptyListCTA/EmptyList';
import { SelectableValue } from '@grafana/data';

export interface OwnProps {
  siteId: number;
  teams: SiteTeam[];
}

export interface State {
  isAdding: boolean;
  newSiteTeam?: SiteTeam | null;
}

function mapStateToProps(state: StoreState, props: OwnProps) {
  return {
    siteId: props.siteId,
    searchTeamQuery: getSearchTeamQuery(state.site),
    teamsCount: getTeamsCount(state.site),
    signedInUser: contextSrv.user,
  };
}

const mapDispatchToProps = {
  deleteTeam,
  addTeam,
  setSearchTeamQuery,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = OwnProps & ConnectedProps<typeof connector>;

export class TeamList extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isAdding: false, newSiteTeam: null };
  }

  deleteTeam = (team: SiteTeam) => {
    this.props.deleteTeam(team.id);
  };

  onSearchTeamQueryChange = (value: string) => {
    this.props.setSearchTeamQuery(value);
  };

  onToggleAdding = () => {
    this.setState({ isAdding: !this.state.isAdding });
  };

  onTeamSelected = (team: SelectableValue<Team>) => {
    const t = team.value!;
    this.setState({
      newSiteTeam: {
        id: 0,
        team_name: t.name,
        avatarUrl: t.avatarUrl,
        email: '',
        memberCount: 0,
        team_id: t.id,
        site_id: 0,
      },
    });
  };

  onAddSiteToTeam = async () => {
    this.props.addTeam(this.state.newSiteTeam!.id);
    this.setState({ newSiteTeam: null });
  };

  renderTeam(team: SiteTeam) {
    const teamUrl = `org/teams/edit/${team.team_id}`;
    const canDelete = this.isEditable();

    return (
      <tr key={team.id}>
        <td className="width-4 text-center link-td">
          <a href={teamUrl}>
            <img className="filter-table__avatar" src={team.avatarUrl} />
          </a>
        </td>
        <td className="link-td">
          <a href={teamUrl}>{team.team_name}</a>
        </td>
        <td className="link-td">
          <a href={teamUrl}>{team.email}</a>
        </td>
        <td className="link-td">
          <a href={teamUrl}>{team.memberCount}</a>
        </td>
        <td className="text-right">
          <DeleteButton size="sm" disabled={!canDelete} onConfirm={() => this.deleteTeam(team)} />
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
    const { isAdding } = this.state;
    const { searchTeamQuery } = this.props;
    return (
      <div>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search teams" value={searchTeamQuery} onChange={this.onSearchTeamQueryChange} />
          </div>

          <button
            className="btn btn-primary pull-right"
            onClick={this.onToggleAdding}
            disabled={isAdding || !this.isEditable()}
          >
            Add team
          </button>
        </div>
        <SlideDown in={isAdding}>
          <div className="cta-form">
            <button className="cta-form__close btn btn-transparent" onClick={this.onToggleAdding}>
              <i className="fa fa-close" />
            </button>
            <h5>Add this site to a team</h5>
            <div className="gf-form-inline">
              <TeamPicker onSelected={this.onTeamSelected} className="min-width-30" />
              <div className="page-action-bar__spacer" />
              {this.state.newSiteTeam && (
                <button className="btn btn-primary gf-form-btn" type="submit" onClick={this.onAddSiteToTeam}>
                  Add to team
                </button>
              )}
            </div>
          </div>
        </SlideDown>
        <EmptyList title="No teams are added yet." proTip="Ask administrator to update teams." />
      </div>
    );
  }

  renderTeamList() {
    const { isAdding } = this.state;
    const { teams, searchTeamQuery } = this.props;

    return (
      <div>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search teams" value={searchTeamQuery} onChange={this.onSearchTeamQueryChange} />
          </div>

          <button
            className="btn btn-primary pull-right"
            onClick={this.onToggleAdding}
            disabled={isAdding || !this.isEditable()}
          >
            Add team
          </button>
        </div>
        <SlideDown in={isAdding}>
          <div className="cta-form">
            <button className="cta-form__close btn btn-transparent" onClick={this.onToggleAdding}>
              <i className="fa fa-close" />
            </button>
            <h5>Add site to a team</h5>
            <div className="gf-form-inline">
              <TeamPicker onSelected={this.onTeamSelected} className="min-width-30" />
              <div className="page-action-bar__spacer" />
              {this.state.newSiteTeam && (
                <button className="btn btn-primary gf-form-btn" type="submit" onClick={this.onAddSiteToTeam}>
                  Add to team
                </button>
              )}
            </div>
          </div>
        </SlideDown>
        <div className="admin-list-table">
          <table className="filter-table filter-table--hover form-inline">
            <thead>
              <tr>
                <th />
                <th>Name</th>
                <th>Email</th>
                <th>member Count</th>
                <th style={{ width: '1%' }} />
              </tr>
            </thead>
            <tbody>{teams.map((team) => this.renderTeam(team))}</tbody>
          </table>
        </div>
      </div>
    );
  }

  render() {
    const { teamsCount } = this.props;

    if (teamsCount > 0) {
      return this.renderTeamList();
    } else {
      return this.renderEmptyList();
    }
  }
}

export default connector(TeamList);
