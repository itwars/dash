package sqlstore

import (
	"bytes"
	"time"

	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/models"
	"github.com/pkg/errors"
)

func init() {
	bus.AddHandler("sql", CreateAssetType)
	bus.AddHandler("sql", UpdateAssetType)
	bus.AddHandler("sql", GetAssetTypeByID)
	bus.AddHandler("sql", GetAssetTypeBySearchQuery)
	bus.AddHandler("sql", DeleteAssetTypeByID)
}

func CreateAssetType(msg *models.CreateAssetTypeMsg) error {

	return inTransaction(func(sess *DBSession) (err error) {
		assetType := models.AssetType{
			CreatedAt:              time.Now(),
			UpdatedAt:              time.Now(),
			Type:                   msg.Type,
			AssetAppConfigs:        msg.AssetAppConfigs,
			AssetProps:             msg.AssetProps,
			AssetControllerConfigs: msg.AssetControllerConfigs,
		}
		if _, err = sess.Insert(&assetType); err != nil {
			return errors.Wrapf(err, "asset type: %s creation failed", msg.Type)
		}
		msg.Result = &models.AssetTypeRsp{
			Id:                     assetType.Id,
			UpdatedAt:              assetType.UpdatedAt,
			Type:                   assetType.Type,
			AssetAppConfigs:        assetType.AssetAppConfigs,
			AssetProps:             assetType.AssetProps,
			AssetControllerConfigs: assetType.AssetControllerConfigs,
		}
		return err
	})
}

func UpdateAssetType(msg *models.UpdateAssetTypeMsg) error {

	return inTransaction(func(sess *DBSession) (err error) {
		assetType := models.AssetType{
			UpdatedAt:              time.Now(),
			Type:                   msg.Type,
			AssetAppConfigs:        msg.AssetAppConfigs,
			AssetProps:             msg.AssetProps,
			AssetControllerConfigs: msg.AssetControllerConfigs,
		}
		if _, err = sess.ID(msg.Id).Update(&assetType); err != nil {
			return errors.Wrapf(err, "asset type: %s updation failed", msg.Type)
		}
		return err
	})
}

func GetAssetTypeByID(msg *models.GetAssetTypeByIDMsg) error {
	assetType := models.AssetType{}
	exists, err := x.Where("id = ?", msg.Id).Get(&assetType)
	if err != nil {
		return errors.Wrapf(err, "asset type ID: %d get failed", msg.Id)
	}
	if !exists {
		return models.ErrAssetTypeNotFound
	}
	msg.Result = &models.AssetTypeRsp{
		Id:                     assetType.Id,
		UpdatedAt:              assetType.UpdatedAt,
		Type:                   assetType.Type,
		AssetAppConfigs:        assetType.AssetAppConfigs,
		AssetProps:             assetType.AssetProps,
		AssetControllerConfigs: assetType.AssetControllerConfigs,
	}
	return nil
}

func GetAssetTypeBySearchQuery(msg *models.GetAssetTypeBySearchQueryMsg) error {
	var sql bytes.Buffer
	params := make([]interface{}, 0)

	queryWithWildcards := "%" + msg.Query + "%"
	sql.WriteString(`SELECT * FROM asset_type AS asset_type WHERE asset_type.type ` + dialect.LikeStr() + ` ?`)

	params = append(params, queryWithWildcards)
	sql.WriteString(` ORDER BY asset_type.type ASC `)
	offset := msg.PerPage * (msg.Page - 1)
	sql.WriteString(dialect.LimitOffset(int64(msg.PerPage), int64(offset)))

	msg.Result.Data = make([]*models.AssetTypeRsp, 0)
	if err := x.SQL(sql.String(), params...).Find(&msg.Result.Data); err != nil {
		return errors.Wrapf(err, "fetch asset type: %s failed", msg.Query)
	}

	assetType := models.AssetType{}
	countSess := x.Table("asset_type")
	if msg.Query != "" {
		countSess.Where(`type `+dialect.LikeStr()+` ?`, queryWithWildcards)
	}

	count, err := countSess.Count(&assetType)
	if err != nil {
		return errors.Wrapf(err, "count asset type : %s failed", msg.Query)
	}
	msg.Result.PerPage = msg.PerPage
	msg.Result.Page = msg.Page
	msg.Result.TotalCount = count
	return nil
}

func DeleteAssetTypeByID(msg *models.DeleteAssetTypeByIDMsg) error {
	return inTransaction(func(sess *DBSession) (err error) {
		assetType := models.AssetType{}

		exists, err := sess.Where("id = ?", msg.Id).Get(&assetType)
		if err != nil {
			return errors.Wrapf(err, "asset type ID: %d get failed", msg.Id)
		}
		if !exists {
			return models.ErrAssetTypeNotFound
		}

		asset := models.Asset{}
		count, err := sess.Table("asset").Where("type = ?", assetType.Type).Count(&asset)
		if err != nil {
			return errors.Wrapf(err, "count site for type: %s failed", assetType.Type)
		}
		if count > 0 {
			return errors.Wrapf(err, "%d Assets with type: %s  are not empty", count, assetType.Type)
		}

		deletes := []struct {
			query string
			args  interface{}
		}{
			{
				query: "DELETE FROM asset WHERE type = ?",
				args:  assetType.Type,
			},
			{
				query: "DELETE FROM asset_type WHERE id = ?",
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
