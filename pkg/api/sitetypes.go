package api

import (
	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/util"
)

func (hs *HTTPServer) CreateSiteType(c *models.ReqContext, msg models.CreateSiteTypeMsg) response.Response {
	if msg.Type == "" {
		return response.Error(400, "create site type request is not valid", nil)
	}

	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "site type creation failed", err)
	}
	return response.JSON(200, &util.DynMap{
		"siteTypeId": msg.Result.Id,
		"message":    "site type created",
	})
}

func (hs *HTTPServer) UpdateSiteType(c *models.ReqContext, msg models.UpdateSiteTypeMsg) response.Response {
	msg.Id = c.ParamsInt64(":sitetypeId")
	if msg.Type == "" || msg.Id == 0 {
		return response.Error(400, "update  site type request is not valid", nil)
	}

	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "site type updation failed", err)
	}
	return response.Success("site type update")
}

func (hs *HTTPServer) GetSiteTypeByID(c *models.ReqContext) response.Response {
	sitetypeId := c.ParamsInt64(":sitetypeId")
	if sitetypeId == 0 {
		return response.Error(400, "ID is missing", nil)
	}
	msg := models.GetSiteTypeByIDMsg{
		Id: sitetypeId,
	}
	if err := bus.Dispatch(&msg); err != nil {
		if err == models.ErrSiteTypeNotFound {
			return response.Error(404, "site type not found", err)
		}
		return response.Error(500, "get site type failed", err)
	}
	return response.JSON(200, msg.Result)
}

func (hs *HTTPServer) GetSiteTypes(c *models.ReqContext) response.Response {
	query := c.Query("query")
	perPage := c.QueryInt("perpage")
	if perPage <= 0 {
		perPage = 1000
	}
	page := c.QueryInt("page")
	if page == 0 {
		return response.Error(400, "page is missing", nil)
	}
	msg := models.GetSiteTypeBySearchQueryMsg{
		Query:   query,
		PerPage: perPage,
		Page:    page,
	}
	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "get site types failed", err)
	}
	return response.JSON(200, msg.Result)
}

func (hs *HTTPServer) DeleteSiteTypeByID(c *models.ReqContext) response.Response {
	sitetypeId := c.ParamsInt64(":sitetypeId")
	if sitetypeId == 0 {
		return response.Error(400, "ID is missing", nil)
	}
	msg := models.DeleteSiteTypeByIDMsg{
		Id: sitetypeId,
	}
	if err := bus.Dispatch(&msg); err != nil {
		if err == models.ErrSiteTypeNotFound {
			return response.Error(404, "site type not found", err)
		}
		return response.Error(500, "delete site type failed", err)
	}
	return response.Success("deleted site type")
}
