package api

import (
	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/models"
)

func (hs *HTTPServer) GetOrgAlarms(c *models.ReqContext) response.Response {
	return hs.getAlarms(c, models.ALARMLEVEL_ORG)
}

func (hs *HTTPServer) getAlarms(c *models.ReqContext, alarmLevel models.AlarmLevelType) response.Response {
	perPage := c.QueryInt("perpage")
	if perPage <= 0 {
		perPage = 1000
	}
	page := c.QueryInt("page")
	if page < 1 {
		page = 1
	}

	permission := models.GetPermissionLevel(c.OrgRole)
	if c.IsGrafanaAdmin {
		permission = models.PERMISSIONLEVEL_GRAFANAADMIN
	}

	msg := models.GetAlarmStatesMsg{
		OrgId:      c.OrgId,
		SiteId:     0,
		AssetId:    0,
		Permission: permission,
		AlarmLevel: alarmLevel,
		PerPage:    perPage,
		Page:       page,
	}
	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "get alarms failed", err)
	}
	return response.JSON(200, msg.Result)
}

func (hs *HTTPServer) GetSiteAlarms(c *models.ReqContext) response.Response {
	return hs.getAlarms(c, models.ALARMLEVEL_SITE)
}

func (hs *HTTPServer) GetAssetAlarms(c *models.ReqContext) response.Response {
	return hs.getAlarms(c, models.ALARMLEVEL_ASSET)
}

func (hs *HTTPServer) GetUserAlarmByAlarmID(c *models.ReqContext) response.Response {
	alarmId := c.ParamsInt64(":alarmId")
	if alarmId == 0 {
		return response.Error(400, "ID is missing", nil)
	}
	alarmLevel := c.QueryInt("alarm_level")
	site_id := c.QueryInt("site_id")
	asset_id := c.QueryInt("asset_id")

	var alarm_level models.AlarmLevelType
	switch alarmLevel {
	case int(models.ALARMLEVEL_ORG):
		{
			alarm_level = models.ALARMLEVEL_ORG
		}
	case int(models.ALARMLEVEL_SITE):
		{
			if site_id == 0 {
				return response.Error(400, "siteID is missing", nil)
			}
			site_id = c.QueryInt("site_id")
			alarm_level = models.ALARMLEVEL_SITE
		}
	case int(models.ALARMLEVEL_ASSET):
		{
			if site_id == 0 {
				return response.Error(400, "siteID is missing", nil)
			}
			if asset_id == 0 {
				return response.Error(400, "assetID is missing", nil)
			}
			site_id = c.QueryInt("site_id")
			asset_id = c.QueryInt("asset_id")
			alarm_level = models.ALARMLEVEL_ASSET
		}
	default:
		return response.Error(400, "alarm level is missing", nil)
	}

	permission := models.GetPermissionLevel(c.OrgRole)
	if c.IsGrafanaAdmin {
		permission = models.PERMISSIONLEVEL_GRAFANAADMIN
	}

	msg := models.GetUserAlarmByAlarmIDMsg{
		OrgId:      c.OrgId,
		SiteId:     int64(site_id),
		AssetId:    int64(asset_id),
		AlarmId:    alarmId,
		Permission: permission,
		AlarmLevel: alarm_level,
	}
	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "get alarms failed", err)
	}
	return response.JSON(200, msg.Result)
}

func (hs *HTTPServer) GetUserAlarms(c *models.ReqContext) response.Response {
	perPage := c.QueryInt("perpage")
	if perPage <= 0 {
		perPage = 1000
	}
	page := c.QueryInt("page")
	if page < 1 {
		page = 1
	}
	alarmLevel := c.QueryInt("alarm_level")
	site_id := c.QueryInt("site_id")
	asset_id := c.QueryInt("asset_id")
	var alarm_level models.AlarmLevelType
	switch alarmLevel {
	case int(models.ALARMLEVEL_ORG):
		{
			alarm_level = models.ALARMLEVEL_ORG
		}
	case int(models.ALARMLEVEL_SITE):
		{
			if site_id == 0 {
				return response.Error(400, "siteID is missing", nil)
			}
			site_id = c.QueryInt("site_id")
			alarm_level = models.ALARMLEVEL_SITE
		}
	case int(models.ALARMLEVEL_ASSET):
		{
			if site_id == 0 {
				return response.Error(400, "siteID is missing", nil)
			}
			if asset_id == 0 {
				return response.Error(400, "assetID is missing", nil)
			}
			site_id = c.QueryInt("site_id")
			asset_id = c.QueryInt("asset_id")
			alarm_level = models.ALARMLEVEL_ASSET
		}
	default:
		return response.Error(400, "alarm level is missing", nil)
	}

	permission := models.GetPermissionLevel(c.OrgRole)
	if c.IsGrafanaAdmin {
		permission = models.PERMISSIONLEVEL_GRAFANAADMIN
	}

	msg := models.GetUserAlarmsMsg{
		OrgId:      c.OrgId,
		SiteId:     int64(site_id),
		AssetId:    int64(asset_id),
		Permission: permission,
		AlarmLevel: alarm_level,
		PerPage:    perPage,
		Page:       page,
	}
	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "get alarms failed", err)
	}
	return response.JSON(200, msg.Result)
}

func (hs *HTTPServer) UpdateUserAlarm(c *models.ReqContext, msg models.UpdateUserAlarmMsg) response.Response {
	msg.AlarmId = c.ParamsInt64(":alarmId")
	if msg.AlarmId == 0 {
		return response.Error(400, "alarmID is missing", nil)
	}
	job := models.UpdateUserAlarmJob{
		OrgId:      c.OrgId,
		SiteId:     msg.SiteId,
		AssetId:    msg.AssetId,
		AlarmId:    msg.AlarmId,
		AlarmLevel: msg.AlarmLevel,
		Context:    msg.Context,
		For:        msg.For,
		Enabled:    msg.Enabled,
	}
	if err := bus.Dispatch(&job); err != nil {
		return response.Error(500, "update alarms failed", err)
	}
	return response.Success("alarm updated")
}

func (hs *HTTPServer) ResetAlarm(c *models.ReqContext) response.Response {
	alarmState_id := c.QueryInt("alarm_id")
	if alarmState_id == 0 {
		return response.Error(400, "alarm_id is missing", nil)
	}
	msg := models.ResetAlarmMsg{
		Id: int64(alarmState_id),
	}
	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "reset alarm failed", err)
	}
	return response.Success("alarm updated")
}
