package sqlstore

import (
	"bytes"
	"fmt"
	"time"

	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/models"
	"github.com/pkg/errors"
)

func init() {
	bus.AddHandler("sql", CreateAsset)
	bus.AddHandler("sql", UpdateAsset)
	bus.AddHandler("sql", GetAssetByID)
	bus.AddHandler("sql", GetAssetBySearchQuery)
	bus.AddHandler("sql", DeleteAssetByID)
	bus.AddHandler("sql", CloneAsset)
}

func CreateAsset(msg *models.CreateAssetMsg) error {

	return inTransaction(func(sess *DBSession) (err error) {
		assetType := models.AssetType{}
		exists, err := x.Where("type = ?", msg.Type).Get(&assetType)
		if err != nil {
			return errors.Wrapf(err, "asset_type  type: %s get failed", msg.Type)
		}
		if !exists {
			return models.ErrAssetTypeNotFound
		}
		asset := models.Asset{
			CreatedAt:              time.Now(),
			UpdatedAt:              time.Now(),
			OrgId:                  msg.OrgId,
			SiteId:                 msg.SiteId,
			Serial:                 msg.Serial,
			Name:                   msg.Name,
			Description:            msg.Description,
			Type:                   msg.Type,
			AssetControllerConfigs: assetType.AssetControllerConfigs,
			AssetAppConfigs:        assetType.AssetAppConfigs,
			AssetProps:             assetType.AssetProps,
		}
		if _, err = sess.Insert(&asset); err != nil {
			return errors.Wrapf(err, "asset name: %s creation failed", msg.Name)
		}

		alarms := make([]models.Alarm, 0)
		err = sess.Where("alarm_level = ?", models.ALARMLEVEL_ASSET).Limit(5000, 0).Find(&alarms)
		if err != nil {
			return errors.Wrapf(err, "fetch alarms for asset level failed")
		}

		for i := range alarms {
			alarmState := models.AlarmState{
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
				AlarmId:   alarms[i].Id,
				OrgId:     asset.OrgId,
				SiteId:    asset.SiteId,
				AssetId:   asset.Id,
				Name:      alarms[i].Name,
				State:     models.AlarmStateOK,
				Enabled:   true,
				For:       alarms[i].For,
				Context:   alarms[i].Context,
			}
			if _, err := sess.Insert(&alarmState); err != nil {
				return errors.Wrapf(err, "alarm_state org_id: %d, site_id: %d, asset id: %d alarm id: %d creation failed", asset.OrgId, asset.SiteId, asset.Id, alarms[i].Id)
			}
		}

		msg.Result = &models.AssetRsp{
			Id:                     asset.Id,
			UpdatedAt:              asset.UpdatedAt,
			OrgId:                  asset.OrgId,
			SiteId:                 asset.SiteId,
			Name:                   asset.Name,
			Description:            asset.Description,
			Type:                   asset.Type,
			AssetControllerConfigs: asset.AssetControllerConfigs,
			AssetAppConfigs:        asset.AssetAppConfigs,
			AssetProps:             asset.AssetProps,
		}
		return err
	})
}

func CloneAsset(msg *models.CloneAssetMsg) error {

	return inTransaction(func(sess *DBSession) (err error) {
		asset := models.Asset{}
		exists, err := sess.Where("id = ?", msg.Id).Get(&asset)
		if err != nil {
			return errors.Wrapf(err, "asset id: %d get failed", msg.Id)
		}
		if !exists {
			return models.ErrAssetNotFound
		}

		asset.Id = 0
		asset.CreatedAt = timeNow()
		asset.UpdatedAt = timeNow()
		asset.Name = fmt.Sprintf("%s-%d", asset.Name, time.Now().Unix())
		asset.Serial = fmt.Sprintf("%s-%d", asset.Serial, time.Now().Unix())

		if _, err = sess.Insert(&asset); err != nil {
			return errors.Wrapf(err, "asset name: %s creation failed", asset.Name)
		}

		alarms := make([]models.Alarm, 0)
		err = sess.Where("alarm_level = ?", models.ALARMLEVEL_ASSET).Limit(5000, 0).Find(&alarms)
		if err != nil {
			return errors.Wrapf(err, "fetch alarms for asset level failed")
		}

		for i := range alarms {
			alarmState := models.AlarmState{
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
				AlarmId:   alarms[i].Id,
				OrgId:     asset.OrgId,
				SiteId:    asset.SiteId,
				AssetId:   asset.Id,
				Name:      alarms[i].Name,
				State:     models.AlarmStateOK,
				Enabled:   true,
				For:       alarms[i].For,
				Context:   alarms[i].Context,
			}
			if _, err := sess.Insert(&alarmState); err != nil {
				return errors.Wrapf(err, "alarm state org id: %d, site id: %d, asset id:%d alarm id: %d creation failed", asset.OrgId, asset.SiteId, asset.Id, alarms[i].Id)
			}
		}

		msg.Result = &models.AssetRsp{
			Id:                     asset.Id,
			UpdatedAt:              asset.UpdatedAt,
			OrgId:                  asset.OrgId,
			SiteId:                 asset.SiteId,
			Name:                   asset.Name,
			Description:            asset.Description,
			Type:                   asset.Type,
			AssetControllerConfigs: asset.AssetControllerConfigs,
			AssetAppConfigs:        asset.AssetAppConfigs,
			AssetProps:             asset.AssetProps,
		}
		return err
	})
}

func UpdateAsset(msg *models.UpdateAssetMsg) error {

	return inTransaction(func(sess *DBSession) (err error) {
		assetType := models.AssetType{}
		exists, err := x.Where("type = ?", msg.Type).Get(&assetType)
		if err != nil {
			return errors.Wrapf(err, "asset  ID: %d get failed", msg.Id)
		}
		if !exists {
			return models.ErrAssetTypeNotFound
		}
		asset := models.Asset{}
		exists, err = x.Where("id = ?", msg.Id).Get(&asset)
		if err != nil {
			return errors.Wrapf(err, "asset  ID: %d get failed", msg.Id)
		}
		if !exists {
			return models.ErrAssetNotFound
		}
		asset.UpdatedAt = time.Now()
		asset.Description = msg.Description
		asset.Name = msg.Name
		asset.Serial = msg.Serial
		if asset.Type != msg.Type {
			asset.AssetControllerConfigs = assetType.AssetControllerConfigs
			asset.AssetAppConfigs = assetType.AssetAppConfigs
			asset.AssetProps = assetType.AssetProps
			asset.Type = msg.Type
		} else {

			if err := copySimpleJson(msg.AssetControllerConfigs, asset.AssetControllerConfigs); err != nil {
				return errors.Wrapf(err, "asset name: %s copy controller config failed ", msg.Name)
			}
			if err := copySimpleJson(msg.AssetAppConfigs, asset.AssetAppConfigs); err != nil {
				return errors.Wrapf(err, "asset name: %s copy app config failed ", msg.Name)
			}

			if err := copySimpleJson(msg.AssetProps, asset.AssetProps); err != nil {
				return errors.Wrapf(err, "asset name: %s copy asset props failed ", msg.Name)
			}
		}
		if _, err = sess.ID(msg.Id).Update(&asset); err != nil {
			return errors.Wrapf(err, "asset name: %s updation failed", msg.Name)
		}
		return err
	})
}

func GetAssetByID(msg *models.GetAssetByIDMsg) error {
	asset := models.Asset{}
	exists, err := x.Where("id = ?", msg.Id).Get(&asset)
	if err != nil {
		return errors.Wrapf(err, "asset ID: %d get failed", msg.Id)
	}
	if !exists {
		return models.ErrAssetNotFound
	}

	alarmCount, err := x.Table("alarm_state").
		Join("INNER", "alarm", "alarm.id = alarm_state.alarm_id AND alarm.permission_level <= ?", msg.PermissionLevel).
		Where("asset_id = ? AND state = 'alerting' ", asset.Id).Count(&models.AlarmState{})
	if err != nil {
		return errors.Wrapf(err, "alarm count for asset name: %s failed", asset.Name)
	}

	msg.Result = &models.AssetRsp{
		Id:                     asset.Id,
		UpdatedAt:              asset.UpdatedAt,
		OrgId:                  asset.OrgId,
		SiteId:                 asset.SiteId,
		Serial:                 asset.Serial,
		Name:                   asset.Name,
		Description:            asset.Description,
		Type:                   asset.Type,
		AssetControllerConfigs: asset.AssetControllerConfigs,
		AssetAppConfigs:        asset.AssetAppConfigs,
		AssetProps:             asset.AssetProps,
		AlarmCount:             alarmCount,
	}
	return nil
}

func GetAssetBySearchQuery(msg *models.GetAssetsBySearchQueryMsg) error {
	var sql bytes.Buffer
	params := make([]interface{}, 0)

	queryWithWildcards := "%" + msg.Query + "%"
	sql.WriteString(`SELECT
						asset.id AS id,
						asset.updated_at AS updated_at,
						asset.org_id AS org_id,
						asset.site_id AS site_id,
						asset.name AS name,
						asset.serial AS serial,
						asset.description AS description,
						asset.type AS type,
						asset.asset_controller_configs AS asset_controller_configs,
						asset.asset_app_configs AS asset_app_configs,
						asset.asset_props AS asset_props,
						(SELECT COUNT(*) FROM alarm_state
						 INNER JOIN alarm ON alarm.id = alarm_state.alarm_id AND alarm.permission_level <= ?
						 WHERE alarm_state.asset_id = asset.id AND state = 'alerting') AS alarm_count
						FROM asset AS asset`)
	params = append(params, msg.PermissionLevel)

	sql.WriteString(` WHERE asset.org_id = ? AND asset.site_id = ?
					AND (asset.name ` + dialect.LikeStr() + ` ? OR asset.serial ` + dialect.LikeStr() + ` ? )`)
	params = append(params, msg.OrgId)
	params = append(params, msg.SiteId)
	params = append(params, queryWithWildcards)
	params = append(params, queryWithWildcards)

	sql.WriteString(` ORDER BY asset.name ASC `)

	offset := msg.PerPage * (msg.Page - 1)
	sql.WriteString(dialect.LimitOffset(int64(msg.PerPage), int64(offset)))

	msg.Result.Data = make([]*models.AssetRsp, 0)
	if err := x.SQL(sql.String(), params...).Find(&msg.Result.Data); err != nil {
		return errors.Wrapf(err, "fetch asset query: %s failed", msg.Query)
	}

	sql.Reset()
	params = make([]interface{}, 0)
	sql.WriteString(`SELECT COUNT(*) FROM asset AS asset
					WHERE asset.org_id = ? AND asset.site_id = ?
					AND (asset.name ` + dialect.LikeStr() + ` ? OR asset.serial ` + dialect.LikeStr() + ` ? )`)
	params = append(params, msg.OrgId)
	params = append(params, msg.SiteId)
	params = append(params, queryWithWildcards)
	params = append(params, queryWithWildcards)

	resp := make([]*models.QueryCount, 0)
	if err := x.SQL(sql.String(), params...).Find(&resp); err != nil {
		return errors.Wrapf(err, "fetch asset count query: %s failed", msg.Query)
	}
	msg.Result.PerPage = msg.PerPage
	msg.Result.Page = msg.Page
	msg.Result.TotalCount = 0
	if len(resp) > 0 {
		msg.Result.TotalCount = resp[0].Count
	}
	return nil
}

func DeleteAssetByID(msg *models.DeleteAssetByIDMsg) error {
	return inTransaction(func(sess *DBSession) (err error) {
		asset := models.Asset{}

		exists, err := sess.Where("id = ?", msg.Id).Get(&asset)
		if err != nil {
			return errors.Wrapf(err, "asset  ID: %d get failed", msg.Id)
		}
		if !exists {
			return models.ErrAssetNotFound
		}

		deletes := []struct {
			query string
			args  interface{}
		}{
			{
				query: "DELETE FROM alarm_history WHERE asset_id = ?",
				args:  msg.Id,
			},
			{
				query: "DELETE FROM alarm_state WHERE asset_id = ?",
				args:  msg.Id,
			},
			{
				query: "DELETE FROM asset WHERE id = ?",
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
