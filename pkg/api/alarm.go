package api

import (
	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/util"
)

func (hs *HTTPServer) CreateAlarm(c *models.ReqContext, msg models.CreateAlarmMsg) response.Response {
	if msg.Name == "" || msg.AlertingMsg == "" || msg.Severity == 0 || msg.PermissionLevel == 0 || msg.AlarmLevel == 0 {
		return response.Error(400, "create alarm request is not valid", nil)
	}

	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "alarm creation failed", err)
	}
	//TODO create the alarm_state for all the exsisting or assets
	return response.JSON(200, &util.DynMap{
		"alarmId": msg.Result.Id,
		"message": "alarm created",
	})
}

func (hs *HTTPServer) UpdateAlarm(c *models.ReqContext, msg models.UpdateAlarmMsg) response.Response {
	msg.Id = c.ParamsInt64(":alarmId")
	if msg.Id == 0 || msg.Name == "" || msg.AlertingMsg == "" || msg.Severity == 0 || msg.PermissionLevel == 0 || msg.AlarmLevel == 0 {
		return response.Error(400, "update alarm request is not valid", nil)
	}

	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "alarm updation failed", err)
	}
	return response.Success("alarm update")
}

func (hs *HTTPServer) GetAlarmByID(c *models.ReqContext) response.Response {
	alarmId := c.ParamsInt64(":alarmId")
	if alarmId == 0 {
		return response.Error(400, "ID is missing", nil)
	}
	msg := models.GetAlarmByIDMsg{
		Id: alarmId,
	}
	if err := bus.Dispatch(&msg); err != nil {
		if err == models.ErrAlarmNotFound {
			return response.Error(404, "alarm not found", err)
		}
		return response.Error(500, "get alarm failed", err)
	}
	return response.JSON(200, msg.Result)
}

func (hs *HTTPServer) GetAlarms(c *models.ReqContext) response.Response {
	query := c.Query("query")
	perPage := c.QueryInt("perpage")
	if perPage <= 0 {
		perPage = 1000
	}
	page := c.QueryInt("page")
	if page < 1 {
		page = 1
	}

	msg := models.GetAlarmsBySearchQueryMsg{
		Query:   query,
		PerPage: perPage,
		Page:    page,
	}
	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "get alarms failed", err)
	}
	return response.JSON(200, msg.Result)
}

func (hs *HTTPServer) DeleteAlarmByID(c *models.ReqContext) response.Response {
	alarmId := c.ParamsInt64(":alarmId")
	if alarmId == 0 {
		return response.Error(400, "ID is missing", nil)
	}
	msg := models.DeleteAlarmByIDMsg{
		Id: alarmId,
	}
	if err := bus.Dispatch(&msg); err != nil {
		if err == models.ErrAlarmNotFound {
			return response.Error(404, "alarm not found", err)
		}
		return response.Error(500, "delete alarm failed", err)
	}
	return response.Success("deleted alarm")
}
