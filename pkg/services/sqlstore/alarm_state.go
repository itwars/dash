package sqlstore

import (
	"bytes"
	"fmt"
	"time"

	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/models"
	"github.com/pkg/errors"
)

func init() {
	bus.AddHandler("sql", CreateAlarmState)
	bus.AddHandler("sql", UpdateUserAlarm)
	bus.AddHandler("sql", GetAlarmStates)
	bus.AddHandler("sql", ResetAlarmState)
	bus.AddHandler("sql", UpdateAlarmState)
	bus.AddHandler("sql", GetUserAlarms)
	bus.AddHandler("sql", GetUserAlarmByAlarmID)
}

func CreateAlarmState(msg *models.CreateAlarmStateMsg) error {
	orgOffset := 0
	orgLimit := 500
	for {
		orgs := make([]*models.Org, 0)
		if err := x.Limit(orgLimit, orgOffset).Find(&orgs); err != nil {
			return errors.Wrap(err, "fetch orgs failed")
		}
		if msg.AlarmLevel == models.ALARMLEVEL_ORG {
			for i := range orgs {
				createAlarmState(orgs[i].Id, 0, 0, msg)
			}
		} else {
			for i := range orgs {
				siteOffset := 0
				siteLimit := 500
				for {
					sites := make([]*models.Site, 0)
					if err := x.Where(`org_id = ?`, orgs[i].Id).Limit(siteLimit, siteOffset).Find(&sites); err != nil {
						return errors.Wrap(err, "fetch sites failed")
					}
					if msg.AlarmLevel == models.ALARMLEVEL_SITE {
						for j := range sites {
							createAlarmState(orgs[i].Id, sites[j].Id, 0, msg)
						}
					} else {
						for j := range sites {
							assetOffset := 0
							assetLimit := 500
							for {
								assets := make([]*models.Asset, 0)
								if err := x.Where(`org_id = ? AND site_id = ?`, orgs[i].Id, sites[j].Id).Limit(assetLimit, assetOffset).Find(&assets); err != nil {
									return errors.Wrap(err, "fetch asset failed")
								}
								for k := range assets {
									createAlarmState(orgs[i].Id, sites[j].Id, assets[k].Id, msg)
								}
								if len(assets) < assetLimit {
									break
								}
								assetOffset += assetLimit
							}
						}
					}
					if len(sites) < siteLimit {
						break
					}
					siteOffset += siteLimit
				}
			}
		}
		if len(orgs) < orgLimit {
			break
		}
		orgOffset += orgLimit
	}
	return nil
}

func createAlarmState(org_id int64, site_id int64, asset_id int64, msg *models.CreateAlarmStateMsg) {
	inTransaction(func(sess *DBSession) (err error) {
		alarmState := models.AlarmState{
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			AlarmId:   msg.AlarmId,
			OrgId:     org_id,
			SiteId:    site_id,
			AssetId:   asset_id,
			State:     models.AlarmStateOK,
			Name:      msg.Name,
			Enabled:   true,
			For:       msg.For,
			Context:   msg.Context,
		}
		if _, err := sess.Insert(&alarmState); err != nil {
			log.New("alarm_state").Error("Failed to create alarm_state", "msg", msg, "error", err)
		}
		return err
	})
}

func UpdateAlarmState(msg *models.UpdateAlarmStateMsg) error {
	offset := 0
	limit := 500
	for {
		alarmStates := make([]*models.AlarmState, 0)
		if err := x.Where(`alarm_id = ?`, msg.AlarmId).Limit(limit, offset).Find(&alarmStates); err != nil {
			return errors.Wrap(err, "fetch alarm_state failed")
		}
		for i := range alarmStates {
			alarmStates[i].UpdatedAt = timeNow()
			if err := copySimpleJson(msg.Context, alarmStates[i].Context); err != nil {
				return errors.Wrapf(err, "alarm_state name: %s copy app config failed ", msg.AlarmId)
			}
			alarmStates[i].Name = msg.Name
			alarmStates[i].For = msg.For
			alarmStates[i].Enabled = msg.Enabled

			if _, err := x.ID(alarmStates[i].Id).Cols("updated_at", "name", "enabled", "context", "for").UseBool(`enabled`).Update(alarmStates[i]); err != nil {
				return errors.Wrapf(err, "alarm_state id: %d updation failed", alarmStates[i].Id)
			}
		}
		if len(alarmStates) < limit {
			break
		}
		offset += limit
	}
	return nil
}

func ResetAlarmState(msg *models.ResetAlarmMsg) error {
	return inTransaction(func(sess *DBSession) (err error) {
		alarmState := models.AlarmState{}
		exists, err := sess.Where("id = ?", msg.Id).Get(&alarmState)
		if err != nil {
			return errors.Wrapf(err, "alarm_state  ID: %d get failed", msg.Id)
		}
		if !exists {
			return models.ErrAlarmNotFound
		}
		alarmState.UpdatedAt = timeNow()
		alarmState.State = models.AlarmStateOK
		if _, err = sess.ID(alarmState.Id).Cols("state").Update(&alarmState); err != nil {
			return errors.Wrapf(err, "alarm_state id: %d updation failed", alarmState.Id)
		}
		return err
	})
}

func GetAlarmStates(msg *models.GetAlarmStatesMsg) error {
	msg.Result = models.AlarmStateQueryResultRsp{
		Data: make([]*models.AlarmStateRsp, 0),
	}

	var sql bytes.Buffer
	params := make([]interface{}, 0)
	sql.WriteString(`SELECT
						alarm_state.updated_at AS updated_at,
						alarm_state.alarm_id AS alarm_id,
						alarm_state.state AS state,
						alarm_state.context AS context,
						alarm_state.for AS for,
						alarm_state.enabled AS enabled,
						alarm.name AS name,
						CASE
							WHEN alarm_state.state = 'ok' THEN alarm.ok_msg ELSE alarm.alerting_msg
						END AS message,
						alarm.manual_reset AS manual_reset,
						alarm.alarm_level AS alarm_level
						FROM alarm_state AS alarm_state
						INNER JOIN alarm ON alarm.id = alarm_state.alarm_id
						WHERE alarm.alarm_level = ?
						AND alarm.permission_level >= ? `)
	params = append(params, msg.AlarmLevel)
	params = append(params, msg.Permission)

	switch msg.AlarmLevel {
	case models.ALARMLEVEL_ORG:
		{
			sql.WriteString(` AND  alarm_state.org_id = ?`)
			params = append(params, msg.OrgId)

		}
	case models.ALARMLEVEL_SITE:
		{
			sql.WriteString(`AND  alarm_state.org_id = ?
							 AND alarm_state.site_id = ?`)
			params = append(params, msg.OrgId)
			params = append(params, msg.SiteId)
		}
	case models.ALARMLEVEL_ASSET:
		{
			sql.WriteString(`AND  alarm_state.org_id = ?
							 AND alarm_state.site_id = ?
							 AND alarm_state.asset_id = ?`)
			params = append(params, msg.OrgId)
			params = append(params, msg.SiteId)
			params = append(params, msg.AssetId)
		}
	default:
		return fmt.Errorf("unkown alarm level: %d", msg.AlarmLevel)
	}

	if err := x.SQL(sql.String(), params...).Limit(5000, 0).Find(&msg.Result.Data); err != nil {
		return errors.Wrap(err, "fetch alarm_states failed")
	}

	alarmCounts, err := getAlarmCounts(msg.OrgId, msg.SiteId, msg.AssetId, msg.AlarmLevel, msg.Permission)
	if err != nil {
		return errors.Wrap(err, "fetch alarm counts failed")
	}
	msg.Result.Data = append(msg.Result.Data, alarmCounts...)

	msg.Result.PerPage = msg.PerPage
	msg.Result.Page = msg.Page
	msg.Result.TotalCount = int64(len(msg.Result.Data))
	return nil
}

func getAlarmCounts(orgID int64, siteID int64, assetID int64, alarmLevel models.AlarmLevelType, Permission models.PermissionLevelType) ([]*models.AlarmStateRsp, error) {
	var sql bytes.Buffer
	params := make([]interface{}, 0)
	alarmCount := make([]*models.AlarmStateRsp, 0)
	sql.WriteString(`SELECT
					DISTINCT(alarm.id) AS alarm_id,
					alarm.context AS context,
					alarm.for AS for,
					alarm.name AS name,
					alarm.alarm_level AS alarm_level,
					(SELECT COUNT(*) FROM alarm_state AS alarm_state_count WHERE alarm_state_count.id = alarm_state.id) AS count
					FROM alarm_state AS alarm_state
					INNER JOIN alarm ON alarm.id = alarm_state.alarm_id `)
	switch alarmLevel {
	case models.ALARMLEVEL_ORG:
		{
			sql.WriteString(` WHERE alarm_state.org_id = ? `)
			params = append(params, orgID)

		}
	case models.ALARMLEVEL_SITE:
		{
			sql.WriteString(` WHERE alarm_state.org_id = ?
							  AND alarm_state.site_id = ? `)
			params = append(params, orgID)
			params = append(params, siteID)
		}
	case models.ALARMLEVEL_ASSET:
		{
			sql.WriteString(` WHERE alarm_state.org_id = ?
							  AND alarm_state.site_id = ?
							  AND alarm_state.asset_id = ? `)
			params = append(params, orgID)
			params = append(params, siteID)
			params = append(params, assetID)
		}
	default:
		return alarmCount, fmt.Errorf("unkown alarm level: %d", alarmLevel)
	}

	sql.WriteString(`AND alarm_state.state = 'alerting'
					 AND alarm.permission_level >= ?
					 AND alarm_level > ?`)
	params = append(params, Permission)
	params = append(params, alarmLevel)

	if err := x.SQL(sql.String(), params...).Limit(5000, 0).Find(&alarmCount); err != nil {
		return nil, errors.Wrap(err, "fetch alarm_state_count failed")
	}

	return alarmCount, nil
}

func GetUserAlarmByAlarmID(msg *models.GetUserAlarmByAlarmIDMsg) error {
	var alarm models.Alarm
	exists, err := x.Where("permission_level <= ? AND alarm_level = ? AND id = ?", msg.Permission, msg.AlarmLevel, msg.AlarmId).Get(&alarm)
	if err != nil {
		return errors.Wrap(err, "fetch alarm failed")
	}
	if !exists {
		exists, err = x.Where("permission_level <= ? AND id = ?", msg.Permission, msg.AlarmId).Get(&alarm)
		if err != nil || !exists {
			return errors.Wrap(err, "fetch alarm failed")
		}
		msg.Result = &models.UserAlarmRsp{
			UpdatedAt:  alarm.UpdatedAt,
			Name:       alarm.Name,
			AlarmId:    alarm.Id,
			AlarmLevel: alarm.AlarmLevel,
			For:        alarm.For,
			Enabled:    false,
			Context:    alarm.Context,
		}
		return nil
	}
	var alarmState models.AlarmState
	exists, err = x.Where("alarm_id = ? AND org_id = ? AND site_id = ? AND asset_id = ?", msg.AlarmId, msg.OrgId, msg.SiteId, msg.AssetId).Get(&alarmState)
	if err != nil {
		return errors.Wrap(err, "fetch alarm failed")
	}
	if !exists {
		alarmState := models.AlarmState{
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			AlarmId:   msg.AlarmId,
			OrgId:     msg.OrgId,
			SiteId:    msg.SiteId,
			AssetId:   msg.AssetId,
			State:     models.AlarmStateOK,
			Name:      alarm.Name,
			Enabled:   true,
			For:       alarm.For,
			Context:   alarm.Context,
		}
		if _, err := x.Insert(&alarmState); err != nil {
			return errors.Wrap(err, "create alarm failed")
		}
		msg.Result = &models.UserAlarmRsp{
			UpdatedAt:  timeNow(),
			Name:       alarm.Name,
			AlarmId:    alarm.Id,
			AlarmLevel: alarm.AlarmLevel,
			For:        alarm.For,
			Enabled:    true,
			Context:    alarm.Context,
		}
		return nil
	} else {
		msg.Result = &models.UserAlarmRsp{
			UpdatedAt:  timeNow(),
			Name:       alarmState.Name,
			AlarmId:    alarm.Id,
			AlarmLevel: alarm.AlarmLevel,
			For:        alarmState.For,
			Enabled:    alarmState.Enabled,
			Context:    alarmState.Context,
		}
	}
	return nil
}

func GetUserAlarms(msg *models.GetUserAlarmsMsg) error {
	alarms := make([]*models.Alarm, 0)
	if err := x.Where("permission_level <= ? AND alarm_level >= ?", msg.Permission, msg.AlarmLevel).Limit(5000, 0).Find(&alarms); err != nil {
		return errors.Wrap(err, "fetch alarms failed")
	}
	alarmStates := make([]*models.AlarmState, 0)
	alarmIds := make([]int, 0)
	userAlarmsResp := make([]*models.UserAlarmRsp, 0)
	for _, alarm := range alarms {
		if alarm.AlarmLevel == msg.AlarmLevel {
			alarmIds = append(alarmIds, int(alarm.Id))
		} else {
			userAlarmsResp = append(userAlarmsResp, &models.UserAlarmRsp{
				UpdatedAt:  alarm.UpdatedAt,
				Name:       alarm.Name,
				AlarmId:    alarm.Id,
				AlarmLevel: alarm.AlarmLevel,
				For:        alarm.For,
				Enabled:    false,
				Context:    alarm.Context,
			})
		}
	}

	if err := x.In("alarm_id", alarmIds).Where(" org_id = ? AND site_id = ? AND asset_id = ?", msg.OrgId, msg.SiteId, msg.AssetId).Limit(5000, 0).Find(&alarmStates); err != nil {
		return errors.Wrap(err, "fetch alarms failed")
	}

	for _, alarm := range alarmStates {
		userAlarmsResp = append(userAlarmsResp, &models.UserAlarmRsp{
			UpdatedAt:  alarm.UpdatedAt,
			Name:       alarm.Name,
			AlarmId:    alarm.AlarmId,
			AlarmLevel: msg.AlarmLevel,
			For:        alarm.For,
			Enabled:    alarm.Enabled,
			Context:    alarm.Context,
		})
	}

	msg.Result.Data = userAlarmsResp
	msg.Result.PerPage = msg.PerPage
	msg.Result.Page = msg.Page
	msg.Result.TotalCount = int64(len(msg.Result.Data))
	return nil
}

func UpdateUserAlarm(msg *models.UpdateUserAlarmMsg) error {
	offset := 0
	limit := 500
	for {
		alarmStates := make([]*models.AlarmState, 0)
		switch msg.AlarmLevel {
		case models.ALARMLEVEL_ORG:
			{
				if err := x.Where(`org_id = ? AND alarm_id = ?`, msg.OrgId, msg.AlarmId).Limit(limit, offset).Find(&alarmStates); err != nil {
					return errors.Wrap(err, "fetch alarm_state failed")
				}
			}
		case models.ALARMLEVEL_SITE:
			{
				if err := x.Where(`org_id = ? AND site_id = ? AND alarm_id = ?`, msg.OrgId, msg.SiteId, msg.AlarmId).Limit(limit, offset).Find(&alarmStates); err != nil {
					return errors.Wrap(err, "fetch alarm_state failed")
				}
			}
		case models.ALARMLEVEL_ASSET:
			{
				if err := x.Where(`org_id = ? AND site_id = ? AND asset_id = ? AND alarm_id = ?`, msg.OrgId, msg.SiteId, msg.AssetId, msg.AlarmId).Limit(limit, offset).Find(&alarmStates); err != nil {
					return errors.Wrap(err, "fetch alarm_state failed")
				}
			}
		}

		for i := range alarmStates {
			alarmStates[i].UpdatedAt = timeNow()
			if err := copySimpleJson(msg.Context, alarmStates[i].Context); err != nil {
				return errors.Wrapf(err, "alarm_state name: %s copy app config failed ", msg.AlarmId)
			}
			alarmStates[i].For = msg.For
			alarmStates[i].Enabled = msg.Enabled

			if _, err := x.ID(alarmStates[i].Id).Cols("updated_at", "enabled", "context", "for").UseBool(`enabled`).Update(alarmStates[i]); err != nil {
				return errors.Wrapf(err, "alarm_state id: %d updation failed", alarmStates[i].Id)
			}
		}
		if len(alarmStates) < limit {
			break
		}
		offset += limit
	}
	return nil
}
