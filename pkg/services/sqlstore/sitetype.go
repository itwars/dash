package sqlstore

import (
	"bytes"
	"time"

	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/models"
	"github.com/pkg/errors"
)

func init() {
	bus.AddHandler("sql", CreateSiteType)
	bus.AddHandler("sql", UpdateSiteType)
	bus.AddHandler("sql", GetSiteTypeByID)
	bus.AddHandler("sql", GetSiteTypeBySearchQuery)
	bus.AddHandler("sql", DeleteSiteTypeByID)
}

func CreateSiteType(msg *models.CreateSiteTypeMsg) error {

	return inTransaction(func(sess *DBSession) (err error) {
		siteType := models.SiteType{
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
			Type:           msg.Type,
			SiteAppConfigs: msg.SiteAppConfigs,
			SiteProps:      msg.SiteProps,
		}
		if _, err = sess.Insert(&siteType); err != nil {
			return errors.Wrapf(err, "site type: %s creation failed", msg.Type)
		}
		msg.Result = &models.SiteTypeRsp{
			Id:             siteType.Id,
			UpdatedAt:      siteType.UpdatedAt,
			Type:           siteType.Type,
			SiteAppConfigs: siteType.SiteAppConfigs,
			SiteProps:      siteType.SiteProps,
		}
		return err
	})
}

func UpdateSiteType(msg *models.UpdateSiteTypeMsg) error {

	return inTransaction(func(sess *DBSession) (err error) {
		siteType := models.SiteType{
			UpdatedAt:      time.Now(),
			Type:           msg.Type,
			SiteAppConfigs: msg.SiteAppConfigs,
			SiteProps:      msg.SiteProps,
		}
		if _, err = sess.ID(msg.Id).Update(&siteType); err != nil {
			return errors.Wrapf(err, "site type: %s updation failed", msg.Type)
		}
		return err
	})
}

func GetSiteTypeByID(msg *models.GetSiteTypeByIDMsg) error {
	siteType := models.SiteType{}
	exists, err := x.Where("id = ?", msg.Id).Get(&siteType)
	if err != nil {
		return errors.Wrapf(err, "site type ID: %d get failed", msg.Id)
	}
	if !exists {
		return models.ErrSiteTypeNotFound
	}
	msg.Result = &models.SiteTypeRsp{
		Id:             siteType.Id,
		UpdatedAt:      siteType.UpdatedAt,
		Type:           siteType.Type,
		SiteAppConfigs: siteType.SiteAppConfigs,
		SiteProps:      siteType.SiteProps,
	}
	return nil
}

func GetSiteTypeBySearchQuery(msg *models.GetSiteTypeBySearchQueryMsg) error {
	var sql bytes.Buffer
	params := make([]interface{}, 0)

	queryWithWildcards := "%" + msg.Query + "%"
	sql.WriteString(`SELECT * FROM site_type AS site_type WHERE site_type.type ` + dialect.LikeStr() + ` ?`)

	params = append(params, queryWithWildcards)
	sql.WriteString(` ORDER BY site_type.type ASC `)
	offset := msg.PerPage * (msg.Page - 1)
	sql.WriteString(dialect.LimitOffset(int64(msg.PerPage), int64(offset)))

	msg.Result.Data = make([]*models.SiteTypeRsp, 0)
	if err := x.SQL(sql.String(), params...).Find(&msg.Result.Data); err != nil {
		return errors.Wrapf(err, "fetch site type: %s failed", msg.Query)
	}

	siteType := models.SiteType{}
	countSess := x.Table("site_type")
	if msg.Query != "" {
		countSess.Where(`type `+dialect.LikeStr()+` ?`, queryWithWildcards)
	}

	count, err := countSess.Count(&siteType)
	if err != nil {
		return errors.Wrapf(err, "count site type : %s failed", msg.Query)
	}
	msg.Result.PerPage = msg.PerPage
	msg.Result.Page = msg.Page + 1
	msg.Result.TotalCount = count
	return nil
}

func DeleteSiteTypeByID(msg *models.DeleteSiteTypeByIDMsg) error {
	return inTransaction(func(sess *DBSession) (err error) {
		siteType := models.SiteType{}

		exists, err := sess.Where("id = ?", msg.Id).Get(&siteType)
		if err != nil {
			return errors.Wrapf(err, "site type ID: %d get failed", msg.Id)
		}
		if !exists {
			return models.ErrSiteTypeNotFound
		}

		site := models.Site{}
		count, err := sess.Table("site").Where("type = ? ", siteType.Type).Count(&site)
		if err != nil {
			return errors.Wrapf(err, "count site for type : %s failed", siteType.Type)
		}
		if count > 0 {
			return errors.Wrapf(err, "%d sites with type: %s  are not empty", count, siteType.Type)
		}
		deletes := []struct {
			query string
			args  interface{}
		}{
			{
				query: "DELETE FROM site WHERE type = ?",
				args:  siteType.Type,
			},
			{
				query: "DELETE FROM site_type WHERE id = ?",
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
