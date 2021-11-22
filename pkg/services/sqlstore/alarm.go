package sqlstore

import (
	"bytes"
	"time"

	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/models"
	"github.com/pkg/errors"
)

func init() {
	bus.AddHandler("sql", CreateAlarm)
	bus.AddHandler("sql", UpdateAlarm)
	bus.AddHandler("sql", GetAlarmByID)
	bus.AddHandler("sql", GetAlarmsBySearchQuery)
	bus.AddHandler("sql", DeleteAlarmByID)
}

func CreateAlarm(msg *models.CreateAlarmMsg) error {

	return inTransaction(func(sess *DBSession) (err error) {
		alarm := models.Alarm{
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
			Name:            msg.Name,
			Description:     msg.Description,
			AlertingMsg:     msg.AlertingMsg,
			OkMsg:           msg.OkMsg,
			Severity:        msg.Severity,
			PermissionLevel: msg.PermissionLevel,
			AlarmLevel:      msg.AlarmLevel,
			For:             msg.For,
			Context:         msg.Context,
			ManualReset:     msg.ManualReset,
		}
		if _, err = sess.Insert(&alarm); err != nil {
			return errors.Wrapf(err, "alarm name: %s creation failed", msg.Name)
		}

		job := models.CreateAlarmStateJob{
			AlarmId:    alarm.Id,
			AlarmLevel: alarm.AlarmLevel,
			Name:       alarm.Name,
			Context:    alarm.Context,
			For:        alarm.For,
			Enabled:    true,
		}
		if err := bus.Dispatch(&job); err != nil {
			return errors.Wrapf(err, "alarm_state creation failed for alarm: %s", msg.Name)
		}

		msg.Result = &models.AlarmRsp{
			Id:              alarm.Id,
			UpdatedAt:       alarm.UpdatedAt,
			Name:            alarm.Name,
			Description:     alarm.Description,
			AlertingMsg:     alarm.AlertingMsg,
			OkMsg:           alarm.OkMsg,
			Severity:        alarm.Severity,
			PermissionLevel: alarm.PermissionLevel,
			AlarmLevel:      alarm.AlarmLevel,
			For:             alarm.For,
			Context:         alarm.Context,
			ManualReset:     alarm.ManualReset,
		}
		return err
	})
}

func UpdateAlarm(msg *models.UpdateAlarmMsg) error {

	return inTransaction(func(sess *DBSession) (err error) {
		alarm := models.Alarm{}
		exists, err := x.Where("id = ?", msg.Id).Get(&alarm)
		if err != nil {
			return errors.Wrapf(err, "alarm  ID: %d get failed", msg.Id)
		}
		if !exists {
			return models.ErrAlarmNotFound
		}
		if alarm.AlarmLevel != msg.AlarmLevel {
			return errors.Wrapf(err, "change of alarm level is forbidden, please delete and recreate")
		}

		alarm.UpdatedAt = time.Now()
		alarm.Name = msg.Name
		alarm.Description = msg.Description
		alarm.AlertingMsg = msg.AlertingMsg
		alarm.OkMsg = msg.OkMsg
		alarm.Severity = msg.Severity
		alarm.PermissionLevel = msg.PermissionLevel
		alarm.For = msg.For
		alarm.Context = msg.Context
		alarm.ManualReset = msg.ManualReset

		if _, err = sess.ID(msg.Id).UseBool(`manual_reset`).Update(&alarm); err != nil {
			return errors.Wrapf(err, "alarm name: %s updation failed", msg.Name)
		}

		job := models.UpdateAlarmStateJob{
			AlarmId: alarm.Id,
			Name:    alarm.Name,
			Context: alarm.Context,
			For:     alarm.For,
			Enabled: msg.Enabled,
		}
		if err := bus.Dispatch(&job); err != nil {
			return errors.Wrapf(err, "alarm_state updation failed for alarm: %s", msg.Name)
		}
		return err
	})
}

func GetAlarmByID(msg *models.GetAlarmByIDMsg) error {
	alarm := models.Alarm{}
	exists, err := x.Where("id = ?", msg.Id).Get(&alarm)
	if err != nil {
		return errors.Wrapf(err, "alarm  ID: %d get failed", msg.Id)
	}
	if !exists {
		return models.ErrAlarmNotFound
	}
	msg.Result = &models.AlarmRsp{
		Id:              alarm.Id,
		UpdatedAt:       alarm.UpdatedAt,
		Name:            alarm.Name,
		Description:     alarm.Description,
		AlertingMsg:     alarm.AlertingMsg,
		OkMsg:           alarm.OkMsg,
		Severity:        alarm.Severity,
		PermissionLevel: alarm.PermissionLevel,
		AlarmLevel:      alarm.AlarmLevel,
		For:             alarm.For,
		Context:         alarm.Context,
		ManualReset:     alarm.ManualReset,
	}
	return nil
}

func GetAlarmsBySearchQuery(msg *models.GetAlarmsBySearchQueryMsg) error {
	var sql bytes.Buffer
	params := make([]interface{}, 0)

	queryWithWildcards := "%" + msg.Query + "%"
	sql.WriteString(`SELECT * FROM alarm AS alarm WHERE alarm.name ` + dialect.LikeStr() + ` ?`)

	params = append(params, queryWithWildcards)
	sql.WriteString(` ORDER BY alarm.name ASC `)
	offset := msg.PerPage * (msg.Page - 1)
	sql.WriteString(dialect.LimitOffset(int64(msg.PerPage), int64(offset)))

	msg.Result.Data = make([]*models.AlarmRsp, 0)
	if err := x.SQL(sql.String(), params...).Find(&msg.Result.Data); err != nil {
		return errors.Wrapf(err, "fetch alarm query: %s failed", msg.Query)
	}

	alarm := models.Alarm{}
	countSess := x.Table("alarm")
	if msg.Query != "" {
		countSess.Where(`name `+dialect.LikeStr()+` ?`, queryWithWildcards)
	}

	count, err := countSess.Count(&alarm)
	if err != nil {
		return errors.Wrapf(err, "count alarm query: %s failed", msg.Query)
	}
	msg.Result.PerPage = msg.PerPage
	msg.Result.Page = msg.Page
	msg.Result.TotalCount = count
	return nil
}

func DeleteAlarmByID(msg *models.DeleteAlarmByIDMsg) error {
	return inTransaction(func(sess *DBSession) (err error) {
		alarm := models.Alarm{}

		exists, err := sess.Where("id = ?", msg.Id).Get(&alarm)
		if err != nil {
			return errors.Wrapf(err, "alarm  ID: %d get failed", msg.Id)
		}
		if !exists {
			return models.ErrAlarmNotFound
		}

		deletes := []struct {
			query string
			args  interface{}
		}{
			{
				query: "DELETE FROM alarm_history WHERE alarm_id = ?",
				args:  msg.Id,
			},
			{
				query: "DELETE FROM alarm_state WHERE alarm_id = ?",
				args:  msg.Id,
			},
			{
				query: "DELETE FROM alarm WHERE id = ?",
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
