package sqlstore

import (
	"bytes"
	"time"

	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/models"
	"github.com/pkg/errors"
)

func init() {
	bus.AddHandler("sql", CreateNotifier)
	bus.AddHandler("sql", UpdateNotifier)
	bus.AddHandler("sql", GetNotifier)
	bus.AddHandler("sql", DeleteNotifier)
	bus.AddHandler("sql", GetNotifiers)
}

func CreateNotifier(msg *models.CreateNotifierMsg) error {

	return inTransaction(func(sess *DBSession) (err error) {
		notifier := models.Notifier{
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			Name:      msg.Name,
			OrgId:     msg.OrgId,
			Type:      msg.Type,
			Settings:  msg.Settings,
		}
		if _, err = sess.Insert(&notifier); err != nil {
			return errors.Wrapf(err, "notifier name: %s creation failed", msg.Name)
		}

		msg.Result = &models.NotifierRsp{
			Id:        notifier.Id,
			UpdatedAt: notifier.UpdatedAt,
			Name:      notifier.Name,
			OrgId:     notifier.OrgId,
			Type:      notifier.Type,
			Settings:  notifier.Settings,
		}
		return err
	})
}

func UpdateNotifier(msg *models.UpdateNotifierMsg) error {

	return inTransaction(func(sess *DBSession) (err error) {
		notifier := models.Notifier{}
		exists, err := x.Where("id = ?", msg.Id).Get(&notifier)
		if err != nil {
			return errors.Wrapf(err, "notifier  ID: %d get failed", msg.Id)
		}
		if !exists {
			return models.ErrNotifierNotFound
		}

		notifier.UpdatedAt = time.Now()
		notifier.Name = msg.Name
		notifier.OrgId = msg.OrgId
		notifier.Type = msg.Type
		notifier.Settings = msg.Settings

		if _, err = sess.ID(msg.Id).Update(&notifier); err != nil {
			return errors.Wrapf(err, "notifier name: %s updation failed", msg.Name)
		}
		return err
	})
}

func GetNotifier(msg *models.GetNotifierMsg) error {
	notifier := models.Notifier{}
	exists, err := x.Where("id = ?", msg.Id).Get(&notifier)
	if err != nil {
		return errors.Wrapf(err, "notifier  ID: %d get failed", msg.Id)
	}
	if !exists {
		return models.ErrNotifierNotFound
	}
	msg.Result = &models.NotifierRsp{
		Id:        notifier.Id,
		UpdatedAt: notifier.UpdatedAt,
		Name:      notifier.Name,
		OrgId:     notifier.OrgId,
		Type:      notifier.Type,
		Settings:  notifier.Settings,
	}
	return nil
}

func DeleteNotifier(msg *models.DeleteNotifierMsg) error {
	return inTransaction(func(sess *DBSession) (err error) {
		notifier := models.Notifier{}

		exists, err := sess.Where("id = ?", msg.Id).Get(&notifier)
		if err != nil {
			return errors.Wrapf(err, "notifier  ID: %d get failed", msg.Id)
		}
		if !exists {
			return models.ErrNotifierNotFound
		}

		deletes := []struct {
			query string
			args  interface{}
		}{
			{
				query: "DELETE FROM notifier WHERE id = ?",
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

func GetNotifiers(msg *models.GetNotifiersMsg) error {
	var sql bytes.Buffer
	params := make([]interface{}, 0)

	queryWithWildcards := "%" + msg.Query + "%"
	sql.WriteString(`SELECT * FROM notifier AS notifier WHERE notifier.name ` + dialect.LikeStr() + ` ?`)

	params = append(params, queryWithWildcards)
	sql.WriteString(` ORDER BY notifier.name ASC `)
	offset := msg.PerPage * (msg.Page - 1)
	sql.WriteString(dialect.LimitOffset(int64(msg.PerPage), int64(offset)))

	msg.Result.Data = make([]*models.NotifierRsp, 0)
	if err := x.SQL(sql.String(), params...).Find(&msg.Result.Data); err != nil {
		return errors.Wrapf(err, "fetch notifier query: %s failed", msg.Query)
	}

	notifier := models.Notifier{}
	countSess := x.Table("notifier")
	if msg.Query != "" {
		countSess.Where(`name `+dialect.LikeStr()+` ?`, queryWithWildcards)
	}

	count, err := countSess.Count(&notifier)
	if err != nil {
		return errors.Wrapf(err, "count notifier query: %s failed", msg.Query)
	}
	msg.Result.PerPage = msg.PerPage
	msg.Result.Page = msg.Page
	msg.Result.TotalCount = count
	return nil
}
