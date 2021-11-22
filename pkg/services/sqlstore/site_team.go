package sqlstore

import (
	"bytes"
	"time"

	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/models"
	"github.com/pkg/errors"
)

func init() {
	bus.AddHandler("sql", AddSiteTeam)
	bus.AddHandler("sql", DeleteSiteTeam)
	bus.AddHandler("sql", GetSiteTeamsBySearchQuery)
	bus.AddHandler("sql", SiteAccess)
	bus.AddHandler("sql", TeamAccess)
}

func AddSiteTeam(msg *models.AddSiteTeamMsg) error {

	return inTransaction(func(sess *DBSession) (err error) {
		team := models.Team{}
		exists, err := sess.Where("id = ?", msg.TeamId).Get(&team)
		if err != nil {
			return errors.Wrapf(err, "team  ID: %d get failed", msg.TeamId)
		}
		if !exists {
			return models.ErrTeamNotFound
		}
		site := models.Site{}
		exists, err = sess.Where("id = ?", msg.SiteId).Get(&site)
		if err != nil {
			return errors.Wrapf(err, "site  ID: %d get failed", msg.SiteId)
		}
		if !exists {
			return models.ErrSiteNotFound
		}
		siteTeam := models.SiteTeam{
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			SiteId:    msg.SiteId,
			TeamId:    msg.TeamId,
		}
		if _, err = sess.Insert(&siteTeam); err != nil {
			return errors.Wrapf(err, "site team site id: %d, team id: %d creation failed", msg.SiteId, msg.TeamId)
		}
		return err
	})
}

func DeleteSiteTeam(msg *models.DeleteSiteTeamMsg) error {
	return inTransaction(func(sess *DBSession) (err error) {
		siteTeam := models.SiteTeam{}

		exists, err := sess.Where("id = ?", msg.Id).Get(&siteTeam)
		if err != nil {
			return errors.Wrapf(err, "site team  ID: %d get failed", msg.Id)
		}
		if !exists {
			return models.ErrSiteTeamNotFound
		}
		deletes := []struct {
			query string
			args  interface{}
		}{
			{
				query: "DELETE FROM site_team WHERE id = ?",
				args:  msg.Id,
			},
		}

		for _, sql := range deletes {
			_, err := sess.Exec(sql.query, sql.args)
			if err != nil {
				return errors.Wrapf(err, "query: %s failed", sql.query)
			}
		}
		return err
	})
}

func GetSiteTeamsBySearchQuery(msg *models.GetSiteTeamsBySearchQueryMsg) error {
	var sql bytes.Buffer
	params := make([]interface{}, 0)

	queryWithWildcards := "%" + msg.Query + "%"
	sql.WriteString(`SELECT
						site_team.id AS id,
						site_team.updated_at AS updated_at,
						site_team.site_id AS site_id,
						site_team.team_id AS team_id,
						team.name AS team_name,
						team.email AS email,
						(SELECT COUNT(*) from team_member where team_member.team_id = team.id) AS member_count
						FROM site_team INNER JOIN team ON team.id = site_team.team_id `)

	if msg.PermissionLevel >= models.PERMISSIONLEVEL_ADMIN {
		sql.WriteString(` WHERE site_team.site_id = ?`)
		params = append(params, msg.SiteId)
	} else {
		sql.WriteString(` INNER JOIN team_member ON team_member.team_id = site_team.team_id
						WHERE site_team.site_id = ? AND team_member.user_id = ? `)
		params = append(params, msg.SiteId)
		params = append(params, msg.UserId)
	}

	sql.WriteString(` AND team.name ` + dialect.LikeStr() + ` ?`)
	params = append(params, queryWithWildcards)
	sql.WriteString(` ORDER BY team.name ASC `)
	offset := msg.PerPage * (msg.Page - 1)
	sql.WriteString(dialect.LimitOffset(int64(msg.PerPage), int64(offset)))

	msg.Result.Data = make([]*models.SiteTeamRsp, 0)
	if err := x.SQL(sql.String(), params...).Find(&msg.Result.Data); err != nil {
		return errors.Wrapf(err, "fetch site team: %s failed", msg.Query)
	}

	sql.Reset()
	params = make([]interface{}, 0)

	sql.WriteString(`SELECT COUNT(*)
					 FROM site_team INNER JOIN team ON team.id = site_team.team_id `)

	if msg.PermissionLevel >= models.PERMISSIONLEVEL_ADMIN {
		sql.WriteString(` WHERE site_team.site_id = ?`)
		params = append(params, msg.SiteId)
	} else {
		sql.WriteString(` INNER JOIN team_member ON team_member.team_id = site_team.team_id
						  WHERE site_team.site_id = ? AND team_member.user_id = ? `)
		params = append(params, msg.SiteId)
		params = append(params, msg.UserId)
	}

	sql.WriteString(` AND team.name ` + dialect.LikeStr() + ` ?`)
	params = append(params, queryWithWildcards)

	resp := make([]*models.QueryCount, 0)
	if err := x.SQL(sql.String(), params...).Find(&resp); err != nil {
		return errors.Wrapf(err, "fetch site_team count query: %s failed", msg.Query)
	}
	msg.Result.PerPage = msg.PerPage
	msg.Result.Page = msg.Page
	msg.Result.TotalCount = 0
	if len(resp) > 0 {
		msg.Result.TotalCount = resp[0].Count
	}
	return nil
}

func SiteAccess(msg *models.SiteAccessMsg) error {
	msg.Result = false
	if msg.PermissionLevel >= models.PERMISSIONLEVEL_ADMIN {
		query := `SELECT 1 from site WHERE org_id = ? and id = ?`
		if result, err := x.Query(query, msg.OrgId, msg.SiteId); err != nil {
			msg.Result = false
			return nil
		} else if len(result) == 1 {
			msg.Result = true
			return nil
		}

	} else {
		query := `SELECT 1 FROM site_team INNER JOIN team_member ON team_member.team_id = site_team.team_id WHERE site_team.site_id = ? AND team_member.user_id = ?`
		if result, err := x.Query(query, msg.OrgId, msg.SiteId); err != nil {
			msg.Result = false
			return nil
		} else if len(result) == 1 {
			msg.Result = true
			return nil
		}
	}
	return nil
}

func TeamAccess(msg *models.TeamAccessMsg) error {
	msg.Result = false
	if msg.PermissionLevel >= models.PERMISSIONLEVEL_ADMIN {
		query := `SELECT 1 from team WHERE org_id = ? and id = ?`
		if result, err := x.Query(query, msg.OrgId, msg.TeamId); err != nil {
			msg.Result = false
			return nil
		} else if len(result) == 1 {
			msg.Result = true
			return nil
		}
	} else {
		query := `SELECT 1 FROM team_member WHERE team_member.team_id = ? AND team_member.user_id = ?`
		if result, err := x.Query(query, msg.TeamId, msg.UserId); err != nil {
			msg.Result = false
			return nil
		} else if len(result) == 1 {
			msg.Result = true
			return nil
		}
	}
	return nil
}
