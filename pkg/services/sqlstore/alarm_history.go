package sqlstore

import (
	"bytes"
	"fmt"

	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/models"
	"github.com/pkg/errors"
)

func init() {
	bus.AddHandler("sql", GetAlarmHistoryByQuery)
}

func GetAlarmHistoryByQuery(msg *models.GetAlarmHistoryByQueryMsg) error {
	var sql bytes.Buffer
	params := make([]interface{}, 0)

	queryWithWildcards := "%" + msg.Query + "%"
	sql.WriteString(`SELECT
						alarm_history.updated_at AS updated_at,
						alarm.name AS name,
						CASE
							WHEN alarm_history.state = 'ok' THEN alarm.ok_msg ELSE alarm.alerting_msg
						END AS message,
						alarm_history.context AS context,
						alarm_history.state AS state
						FROM alarm AS alarm, alarm_history AS alarm_history
						WHERE alarm_history.alarm_id = alarm.id
						AND alarm.permission_level >= ?
						AND alarm_level = ?`)
	params = append(params, msg.Permission)
	params = append(params, msg.AlarmLevel)

	switch msg.AlarmLevel {
	case models.ALARMLEVEL_ORG:
		{
			sql.WriteString(` AND  alarm_history.org_id = ?`)
			params = append(params, msg.OrgId)

		}
	case models.ALARMLEVEL_SITE:
		{
			sql.WriteString(`AND  alarm_history.org_id = ?
							 AND alarm_history.site_id = ?`)
			params = append(params, msg.OrgId)
			params = append(params, msg.SiteId)
		}
	case models.ALARMLEVEL_ASSET:
		{
			sql.WriteString(`AND  alarm_history.org_id = ?
							 AND alarm_history.site_id = ?
							 AND alarm_history.asset_id = ?`)
			params = append(params, msg.OrgId)
			params = append(params, msg.SiteId)
			params = append(params, msg.AssetId)
		}
	default:
		return fmt.Errorf("unkown alarm level: %d", msg.AlarmLevel)
	}

	sql.WriteString(`AND alarm.name ` + dialect.LikeStr() + ` ?`)

	params = append(params, queryWithWildcards)
	sql.WriteString(` ORDER BY alarm.name ASC `)
	offset := msg.PerPage * (msg.Page - 1)
	sql.WriteString(dialect.LimitOffset(int64(msg.PerPage), int64(offset)))

	msg.Result.Data = make([]*models.AlarmHistoryRsp, 0)
	if err := x.SQL(sql.String(), params...).Find(&msg.Result.Data); err != nil {
		return errors.Wrapf(err, "fetch alarm query: %s failed", msg.Query)
	}

	sql.Reset()
	params = make([]interface{}, 0)

	sql.WriteString(`SELECT
						COUNT (*) AS count
						FROM alarm AS alarm, alarm_history AS alarm_history
						WHERE alarm_history.alarm_id = alarm.id
						AND alarm.permission_level >= ?
						AND alarm_level = ?`)
	params = append(params, msg.Permission)
	params = append(params, msg.AlarmLevel)

	switch msg.AlarmLevel {
	case models.ALARMLEVEL_ORG:
		{
			sql.WriteString(` AND  alarm_history.org_id = ?`)
			params = append(params, msg.OrgId)

		}
	case models.ALARMLEVEL_SITE:
		{
			sql.WriteString(`AND  alarm_history.org_id = ?
												 AND alarm_history.site_id = ?`)
			params = append(params, msg.OrgId)
			params = append(params, msg.SiteId)
		}
	case models.ALARMLEVEL_ASSET:
		{
			sql.WriteString(`AND  alarm_history.org_id = ?
												 AND alarm_history.site_id = ?
												 AND alarm_history.asset_id = ?`)
			params = append(params, msg.OrgId)
			params = append(params, msg.SiteId)
			params = append(params, msg.AssetId)
		}
	default:
		return fmt.Errorf("unkown alarm level: %d", msg.AlarmLevel)
	}

	sql.WriteString(`AND alarm.name ` + dialect.LikeStr() + ` ?`)
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
