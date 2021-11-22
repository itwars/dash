package api

import (
	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/models"
)

func (hs *HTTPServer) CreateOrUpdateNotificationPreference(c *models.ReqContext, msg models.CreateOrUpdateNotificationPreferenceMsg) response.Response {

	if msg.NotifierId == 0 || msg.UserId == 0 || msg.Feature == "" {
		return response.Error(400, "create or update notification preference request is not valid", nil)
	}
	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "create or update notification preference failed", err)
	}
	return response.Success("notification preference updated")
}

func (hs *HTTPServer) GetNotificationPreferences(c *models.ReqContext) response.Response {
	notifierId := c.ParamsInt64(":notifierId")
	if notifierId == 0 {
		return response.Error(400, "ID is missing", nil)
	}
	feature := c.Query("feature")
	if feature == "" {
		return response.Error(400, "feature is missing", nil)
	}

	perPage := c.QueryInt("perpage")
	if perPage <= 0 {
		perPage = 1000
	}
	page := c.QueryInt("page")
	if page < 1 {
		page = 1
	}

	msg := models.GetNotificationPreferencesMsg{
		NotifierId: notifierId,
		UserId:     c.UserId,
		Feature:    feature,
		PerPage:    perPage,
		Page:       page,
	}
	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "get notification preferences failed", err)
	}
	return response.JSON(200, msg.Result)
}
