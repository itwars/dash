package api

import (
	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/util"
)

func (hs *HTTPServer) CreateNotifier(c *models.ReqContext, msg models.CreateNotifierMsg) response.Response {
	if msg.Name == "" || msg.OrgId == 0 || msg.Type == "" {
		return response.Error(400, "create notifier request is not valid", nil)
	}

	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "notifier creation failed", err)
	}
	return response.JSON(200, &util.DynMap{
		"notifierId": msg.Result.Id,
		"message":    "notifier created",
	})
}

func (hs *HTTPServer) UpdateNotifier(c *models.ReqContext, msg models.UpdateNotifierMsg) response.Response {

	if msg.Name == "" || msg.OrgId == 0 || msg.Id == 0 || msg.Type == "" {
		return response.Error(400, "update notifier request is not valid", nil)
	}
	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "notifier updation failed", err)
	}
	return response.Success("notifier updated")
}

func (hs *HTTPServer) GetNotifier(c *models.ReqContext) response.Response {
	notifierId := c.ParamsInt64(":notifierId")
	if notifierId == 0 {
		return response.Error(400, "ID is missing", nil)
	}
	msg := models.GetNotifierMsg{
		Id: notifierId,
	}
	if err := bus.Dispatch(&msg); err != nil {
		if err == models.ErrNotifierNotFound {
			return response.Error(404, "notifier not found", err)
		}
		return response.Error(500, "get notifier failed", err)
	}
	return response.JSON(200, msg.Result)
}

func (hs *HTTPServer) GetNotifiers(c *models.ReqContext) response.Response {
	query := c.Query("query")
	perPage := c.QueryInt("perpage")
	if perPage <= 0 {
		perPage = 1000
	}
	page := c.QueryInt("page")
	if page < 1 {
		page = 1
	}

	msg := models.GetNotifiersMsg{
		Query:   query,
		PerPage: perPage,
		Page:    page,
	}
	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "get notifier failed", err)
	}
	return response.JSON(200, msg.Result)
}

func (hs *HTTPServer) DeleteNotifier(c *models.ReqContext) response.Response {
	notifierId := c.ParamsInt64(":notifierId")
	if notifierId == 0 {
		return response.Error(400, "ID is missing", nil)
	}
	msg := models.DeleteNotifierMsg{
		Id: notifierId,
	}
	if err := bus.Dispatch(&msg); err != nil {
		if err == models.ErrNotifierNotFound {
			return response.Error(404, "notifier not found", err)
		}
		return response.Error(500, "delete notifier failed", err)
	}
	return response.Success("deleted notifier")
}

func (hs *HTTPServer) GetNotifierTypes(c *models.ReqContext) response.Response {
	msg := models.GetNotifierTypesMsg{}
	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "get notifier types failed", err)
	}
	return response.JSON(200, msg.Result)
}

func (hs *HTTPServer) TestNotifier(c *models.ReqContext, msg models.TestNotifierMsg) response.Response {
	if msg.Name == "" || msg.Type == "" {
		return response.Error(400, "test notifier request is not valid", nil)
	}
	msg.UserId = c.SignedInUser.UserId
	msg.UserEmail = c.SignedInUser.Email
	msg.UserPhone = c.Phone
	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "test notifier failed", err)
	}
	return response.Success("test initiated")
}
