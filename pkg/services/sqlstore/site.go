package sqlstore

import (
	"bytes"
	"fmt"
	"time"

	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/components/simplejson"
	"github.com/grafana/grafana/pkg/models"
	"github.com/pkg/errors"
)

func init() {
	bus.AddHandler("sql", CreateSite)
	bus.AddHandler("sql", UpdateSite)
	bus.AddHandler("sql", GetSiteByID)
	bus.AddHandler("sql", GetSiteBySearchQuery)
	bus.AddHandler("sql", GetTeamSitesBySearchQuery)
	bus.AddHandler("sql", DeleteSiteByID)
	bus.AddHandler("sql", CloneSite)
}

func CreateSite(msg *models.CreateSiteMsg) error {

	return inTransaction(func(sess *DBSession) (err error) {
		siteType := models.SiteType{}
		exists, err := sess.Where("type = ?", msg.Type).Get(&siteType)
		if err != nil {
			return errors.Wrapf(err, "site_type  type: %s get failed", msg.Type)
		}
		if !exists {
			return models.ErrSiteTypeNotFound
		}
		site := models.Site{
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
			OrgId:          msg.OrgId,
			Name:           msg.Name,
			Description:    msg.Description,
			Type:           msg.Type,
			Serial:         msg.Serial,
			SiteAppConfigs: siteType.SiteAppConfigs,
			SiteProps:      siteType.SiteProps,
		}
		if _, err = sess.Insert(&site); err != nil {
			return errors.Wrapf(err, "site name: %s creation failed", msg.Name)
		}

		alarms := make([]models.Alarm, 0)
		err = sess.Where("alarm_level = ?", models.ALARMLEVEL_SITE).Limit(5000, 0).Find(&alarms)
		if err != nil {
			return errors.Wrapf(err, "fetch alarms for site level failed")
		}

		for i := range alarms {
			alarmState := models.AlarmState{
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
				AlarmId:   alarms[i].Id,
				OrgId:     site.OrgId,
				SiteId:    site.Id,
				Name:      alarms[i].Name,
				State:     models.AlarmStateOK,
				Enabled:   true,
				For:       alarms[i].For,
				Context:   alarms[i].Context,
			}
			if _, err := sess.Insert(&alarmState); err != nil {
				return errors.Wrapf(err, "alarm_state org_id: %d, site_id: %d,  alarm id: %d creation failed", site.OrgId, site.Id, alarms[i].Id)
			}
		}

		msg.Result = &models.SiteRsp{
			Id:             site.Id,
			UpdatedAt:      site.UpdatedAt,
			OrgId:          site.OrgId,
			Name:           site.Name,
			Description:    site.Description,
			Type:           site.Type,
			Serial:         site.Serial,
			SiteAppConfigs: site.SiteAppConfigs,
			SiteProps:      site.SiteProps,
		}
		return err
	})
}

func CloneSite(msg *models.CloneSiteMsg) error {

	return inTransaction(func(sess *DBSession) (err error) {
		site := models.Site{}
		exists, err := sess.Where("id = ?", msg.Id).Get(&site)
		if err != nil {
			return errors.Wrapf(err, "site  ID: %d get failed", msg.Id)
		}
		if !exists {
			return models.ErrSiteNotFound
		}

		site.Id = 0
		site.CreatedAt = timeNow()
		site.UpdatedAt = timeNow()
		site.Name = fmt.Sprintf("%s-%d", site.Name, time.Now().Unix())

		if _, err = sess.Insert(&site); err != nil {
			return errors.Wrapf(err, "site name: %s creation failed", site.Name)
		}

		siteTeams := make([]models.SiteTeam, 0)
		err = sess.Where("site_id = ?", site.Id).Limit(5000, 0).Find(&siteTeams)
		if err != nil {
			return errors.Wrapf(err, "fetch site teams from site id: %d failed", site.Id)
		}

		for i := range siteTeams {
			siteTeam := models.SiteTeam{
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
				SiteId:    site.Id,
				TeamId:    siteTeams[i].TeamId,
			}
			if _, err = sess.Insert(&siteTeam); err != nil {
				return errors.Wrapf(err, "site team site id: %d, team id: %d creation failed", site.Id, siteTeams[i].TeamId)
			}
		}

		alarms := make([]models.Alarm, 0)
		err = sess.Where("alarm_level = ?", models.ALARMLEVEL_SITE).Limit(5000, 0).Find(&alarms)
		if err != nil {
			return errors.Wrapf(err, "fetch alarms for site level failed")
		}

		for i := range alarms {
			alarmState := models.AlarmState{
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
				AlarmId:   alarms[i].Id,
				OrgId:     site.OrgId,
				SiteId:    site.Id,
				AssetId:   0,
				State:     models.AlarmStateOK,
				Name:      alarms[i].Name,
				Enabled:   true,
				For:       alarms[i].For,
				Context:   alarms[i].Context,
			}
			if _, err := sess.Insert(&alarmState); err != nil {
				return errors.Wrapf(err, "alarm_state org_id: %d, site_id: %d,  alarm id: %d creation failed", site.OrgId, site.Id, alarms[i].Id)
			}
		}

		msg.Result = &models.SiteRsp{
			Id:             site.Id,
			UpdatedAt:      site.UpdatedAt,
			OrgId:          site.OrgId,
			Name:           site.Name,
			Description:    site.Description,
			Type:           site.Type,
			Serial:         site.Serial,
			SiteAppConfigs: site.SiteAppConfigs,
			SiteProps:      site.SiteProps,
		}
		return err
	})
}

func UpdateSite(msg *models.UpdateSiteMsg) error {

	return inTransaction(func(sess *DBSession) (err error) {
		siteType := models.SiteType{}
		exists, err := sess.Where("type = ?", msg.Type).Get(&siteType)
		if err != nil {
			return errors.Wrapf(err, "site  ID: %d get failed", msg.Id)
		}
		if !exists {
			return models.ErrSiteTypeNotFound
		}
		site := models.Site{}
		exists, err = sess.Where("id = ?", msg.Id).Get(&site)
		if err != nil {
			return errors.Wrapf(err, "site  ID: %d get failed", msg.Id)
		}
		if !exists {
			return models.ErrSiteNotFound
		}
		site.UpdatedAt = time.Now()
		site.Description = msg.Description
		site.Serial = msg.Serial
		site.Name = msg.Name
		if site.Type != msg.Type {
			site.SiteAppConfigs = siteType.SiteAppConfigs
			site.SiteProps = siteType.SiteProps
			site.Type = msg.Type
		} else {
			if err := copySimpleJson(msg.SiteAppConfigs, site.SiteAppConfigs); err != nil {
				return errors.Wrapf(err, "site name: %s copy app config failed ", msg.Name)
			}

			if err := copySimpleJson(msg.SiteProps, site.SiteProps); err != nil {
				return errors.Wrapf(err, "site name: %s copy site props failed ", msg.Name)
			}
		}
		if _, err = sess.ID(msg.Id).Update(&site); err != nil {
			return errors.Wrapf(err, "site name: %s updation failed", msg.Name)
		}
		return err
	})
}

func copySimpleJson(from *simplejson.Json, to *simplejson.Json) error {
	t, err := to.Map()
	if err != nil {
		return errors.Wrapf(err, "decode simple json: %v failed", to)
	}
	f, err := from.Map()
	if err != nil {
		return errors.Wrapf(err, "decode simple json: %v failed", to)
	}
	for key := range t {
		_, ok := f[key]
		if ok {
			t[key] = f[key]
		}
	}
	to = simplejson.NewFromAny(t)
	return nil
}

func GetSiteByID(msg *models.GetSiteByIDMsg) error {
	site := models.Site{}
	exists, err := x.Where("id = ?", msg.Id).Get(&site)
	if err != nil {
		return errors.Wrapf(err, "site ID: %d get failed", msg.Id)
	}
	if !exists {
		return models.ErrSiteNotFound
	}

	alarmCount, err := x.Table("alarm_state").
		Join("INNER", "alarm", "alarm.id = alarm_state.alarm_id AND alarm.permission_level <= ?", msg.PermissionLevel).
		Where("site_id = ? AND state = 'alerting' ", site.Id).Count(&models.AlarmState{})

	if err != nil {
		return errors.Wrapf(err, "alarm count for site name: %s failed", site.Name)
	}

	teamCount, err := x.Where("site_id = ?", site.Id).Count(&models.SiteTeam{})
	if err != nil {
		return errors.Wrapf(err, "team count for site name: %s failed", site.Name)
	}

	assetCount, err := x.Where("site_id = ?", site.Id).Count(&models.Asset{})
	if err != nil {
		return errors.Wrapf(err, "asset count for site name: %s failed", site.Name)
	}

	msg.Result = &models.SiteRsp{
		Id:             site.Id,
		UpdatedAt:      site.UpdatedAt,
		Name:           site.Name,
		Description:    site.Description,
		Type:           site.Type,
		Serial:         site.Serial,
		SiteAppConfigs: site.SiteAppConfigs,
		SiteProps:      site.SiteProps,
		AlarmCount:     alarmCount,
		TeamCount:      teamCount,
		AssetCount:     assetCount,
	}
	return nil
}

func GetSiteBySearchQuery(msg *models.GetSitesBySearchQueryMsg) error {
	var sql bytes.Buffer
	params := make([]interface{}, 0)

	queryWithWildcards := "%" + msg.Query + "%"
	sql.WriteString(`SELECT
						site.id AS id,
						site.updated_at AS updated_at,
						site.name AS name,
						site.description AS description,
						site.serial AS serial,
						site.type AS type,
						site.site_app_configs AS site_app_configs,
						site.site_props AS site_props,
						(SELECT COUNT(*) FROM alarm_state
						 INNER JOIN alarm ON alarm.id = alarm_state.alarm_id AND alarm.permission_level <= ?
						 WHERE alarm_state.site_id = site.id AND state = 'alerting') AS alarm_count,
						 `)
	params = append(params, msg.PermissionLevel)

	if msg.PermissionLevel >= models.PERMISSIONLEVEL_ADMIN {
		sql.WriteString(`(SELECT COUNT(*) FROM site_team
		                  WHERE site_team.site_id = site.id) AS team_count,
	                      (SELECT COUNT(*) FROM asset WHERE asset.site_id = site.id ) AS asset_count
	                      FROM site AS site  WHERE site.org_id = ? `)
		params = append(params, msg.OrgId)
	} else {
		sql.WriteString(`(SELECT COUNT(*) FROM site_team
		                 WHERE site_team.site_id = site.id AND team_member.team_id = site_team.team_id) AS team_count,
	                     (SELECT COUNT(*) FROM asset WHERE asset.site_id = site.id ) AS asset_count
	                     FROM site AS site,
	                          alarm_state AS alarm_state,
	                          site_team AS site_team,
							  team_member AS team_member
						 WHERE team_member.user_id = ? AND team_member.org_id = ?
						 AND site_team.team_id = team_member.team_id
						 AND site.id = site_team.site_id`)
		params = append(params, msg.UserId)
		params = append(params, msg.OrgId)
	}

	sql.WriteString(` AND site.name ` + dialect.LikeStr() + ` ?`)
	params = append(params, queryWithWildcards)

	sql.WriteString(` ORDER BY site.name ASC `)

	offset := msg.PerPage * (msg.Page - 1)
	sql.WriteString(dialect.LimitOffset(int64(msg.PerPage), int64(offset)))

	msg.Result.Data = make([]*models.SiteRsp, 0)
	if err := x.SQL(sql.String(), params...).Find(&msg.Result.Data); err != nil {
		return errors.Wrapf(err, "fetch site query: %s failed", msg.Query)
	}

	sql.Reset()
	params = make([]interface{}, 0)

	sql.WriteString(`SELECT COUNT(*)
						FROM site AS site `)
	if msg.PermissionLevel >= models.PERMISSIONLEVEL_ADMIN {
		sql.WriteString(` WHERE site.org_id = ?`)
		params = append(params, msg.OrgId)
	} else {
		sql.WriteString(`, site_team AS site_team, team_member AS team_member
						   WHERE team_member.user_id = ? AND team_member.org_id = ?
						   AND site_team.team_id = team_member.team_id
						   AND site.id = site_team.site_id`)
		params = append(params, msg.UserId)
		params = append(params, msg.OrgId)
	}

	sql.WriteString(` AND site.name ` + dialect.LikeStr() + ` ?`)
	params = append(params, queryWithWildcards)

	resp := make([]*models.QueryCount, 0)
	if err := x.SQL(sql.String(), params...).Find(&resp); err != nil {
		return errors.Wrapf(err, "fetch site count query: %s failed", msg.Query)
	}
	msg.Result.PerPage = msg.PerPage
	msg.Result.Page = msg.Page
	msg.Result.TotalCount = 0
	if len(resp) > 0 {
		msg.Result.TotalCount = resp[0].Count
	}
	return nil
}

func GetTeamSitesBySearchQuery(msg *models.GetTeamSitesBySearchQueryMsg) error {
	var sql bytes.Buffer
	params := make([]interface{}, 0)

	queryWithWildcards := "%" + msg.Query + "%"
	sql.WriteString(`SELECT
						site.id AS id,
						site.updated_at AS updated_at,
						site.name AS name,
						site.description AS description,
						site.serial AS serial,
						site.type AS type,
						site.site_app_configs AS site_app_configs,
						site.site_props AS site_props,
						(SELECT COUNT(*) FROM alarm_state
						 INNER JOIN alarm ON alarm.id = alarm_state.alarm_id AND alarm.permission_level <= ?
						 WHERE alarm_state.site_id = site.id AND state = 'alerting') AS alarm_count,
						 `)
	params = append(params, msg.PermissionLevel)

	if msg.PermissionLevel >= models.PERMISSIONLEVEL_ADMIN {
		sql.WriteString(`(SELECT COUNT(*) FROM site_team
		                  WHERE site_team.site_id = site.id) AS team_count,
	                      (SELECT COUNT(*) FROM asset WHERE asset.site_id = site.id ) AS asset_count
	                      FROM site AS site, site_team AS site_team
						  WHERE site.org_id = ?
						  AND site.id = site_team.site_id
						  AND site_team.team_id = ? `)
		params = append(params, msg.OrgId)
		params = append(params, msg.TeamId)
	} else {
		sql.WriteString(`(SELECT COUNT(*) FROM site_team
		                 WHERE site_team.site_id = site.id AND team_member.team_id = site_team.team_id) AS team_count,
	                     (SELECT COUNT(*) FROM asset WHERE asset.site_id = site.id ) AS asset_count
	                     FROM site AS site,
	                          alarm_state AS alarm_state,
	                          site_team AS site_team,
							  team_member AS team_member
						 WHERE team_member.user_id = ? AND team_member.org_id = ?
						 AND site_team.team_id = team_member.team_id
						 AND site.id = site_team.site_id
						 AND site_team.team_id = ?`)
		params = append(params, msg.UserId)
		params = append(params, msg.OrgId)
		params = append(params, msg.TeamId)
	}

	sql.WriteString(` AND site.name ` + dialect.LikeStr() + ` ?`)

	params = append(params, queryWithWildcards)

	sql.WriteString(` ORDER BY site.name ASC `)

	offset := msg.PerPage * (msg.Page - 1)
	sql.WriteString(dialect.LimitOffset(int64(msg.PerPage), int64(offset)))

	msg.Result.Data = make([]*models.SiteRsp, 0)
	if err := x.SQL(sql.String(), params...).Find(&msg.Result.Data); err != nil {
		return errors.Wrapf(err, "fetch site query: %s failed", msg.Query)
	}

	sql.Reset()
	params = make([]interface{}, 0)

	sql.WriteString(`SELECT COUNT(*)
						FROM site AS site,
						site_team AS site_team`)
	if msg.PermissionLevel >= models.PERMISSIONLEVEL_ADMIN {
		sql.WriteString(` WHERE site.org_id = ?`)
		params = append(params, msg.OrgId)
	} else {
		sql.WriteString(`, team_member AS team_member
						   WHERE team_member.user_id = ? AND team_member.org_id = ?
						   AND site_team.team_id = team_member.team_id`)
		params = append(params, msg.UserId)
		params = append(params, msg.OrgId)
	}

	sql.WriteString(` AND site.id = site_team.site_id AND site_team.team_id = ? AND site.name ` + dialect.LikeStr() + ` ?`)
	params = append(params, msg.TeamId)
	params = append(params, queryWithWildcards)

	resp := make([]*models.QueryCount, 0)
	if err := x.SQL(sql.String(), params...).Find(&resp); err != nil {
		return errors.Wrapf(err, "fetch site count query: %s failed", msg.Query)
	}
	msg.Result.PerPage = msg.PerPage
	msg.Result.Page = msg.Page
	msg.Result.TotalCount = 0
	if len(resp) > 0 {
		msg.Result.TotalCount = resp[0].Count
	}
	return nil
}

func DeleteSiteByID(msg *models.DeleteSiteByIDMsg) error {
	return inTransaction(func(sess *DBSession) (err error) {
		site := models.Site{}

		exists, err := sess.Where("id = ?", msg.Id).Get(&site)
		if err != nil {
			return errors.Wrapf(err, "site  ID: %d get failed", msg.Id)
		}
		if !exists {
			return models.ErrSiteNotFound
		}

		deletes := []struct {
			query string
			args  interface{}
		}{
			{
				query: "DELETE FROM alarm_history WHERE site_id = ?",
				args:  msg.Id,
			},
			{
				query: "DELETE FROM alarm_state WHERE site_id = ?",
				args:  msg.Id,
			},
			{
				query: "DELETE FROM asset WHERE site_id = ?",
				args:  msg.Id,
			},
			{
				query: "DELETE FROM site_team WHERE site_id = ?",
				args:  msg.Id,
			},
			{
				query: "DELETE FROM site WHERE id = ?",
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
