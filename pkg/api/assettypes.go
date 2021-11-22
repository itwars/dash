package api

import (
	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/util"
)

func (hs *HTTPServer) CreateAssetType(c *models.ReqContext, msg models.CreateAssetTypeMsg) response.Response {
	if msg.Type == "" {
		return response.Error(400, "create asset type request is not valid", nil)
	}

	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "asset type creation failed", err)
	}

	return response.JSON(200, &util.DynMap{
		"assetTypeId": msg.Result.Id,
		"message":     "asset type created",
	})
}

func (hs *HTTPServer) UpdateAssetType(c *models.ReqContext, msg models.UpdateAssetTypeMsg) response.Response {
	msg.Id = c.ParamsInt64(":assettypeId")
	if msg.Type == "" || msg.Id == 0 {
		return response.Error(400, "update asset  type request is not valid", nil)
	}

	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "asset type updation failed", err)
	}

	return response.Success("asset type update")
}

func (hs *HTTPServer) GetAssetTypeByID(c *models.ReqContext) response.Response {
	assettypeId := c.ParamsInt64(":assettypeId")
	if assettypeId == 0 {
		return response.Error(400, "ID is missing", nil)
	}
	msg := models.GetAssetTypeByIDMsg{
		Id: assettypeId,
	}
	if err := bus.Dispatch(&msg); err != nil {
		if err == models.ErrAssetTypeNotFound {
			return response.Error(404, "asset type not found", err)
		}
		return response.Error(500, "get asset type failed", err)
	}
	return response.JSON(200, msg.Result)
}

func (hs *HTTPServer) GetAssetTypes(c *models.ReqContext) response.Response {
	query := c.Query("query")
	perPage := c.QueryInt("perpage")
	if perPage <= 0 {
		perPage = 1000
	}
	page := c.QueryInt("page")
	if page < 1 {
		page = 1
	}
	msg := models.GetAssetTypeBySearchQueryMsg{
		Query:   query,
		PerPage: perPage,
		Page:    page,
	}
	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "get asset types failed", err)
	}
	return response.JSON(200, msg.Result)
}

func (hs *HTTPServer) DeleteAssetTypeByID(c *models.ReqContext) response.Response {
	assettypeId := c.ParamsInt64(":assettypeId")
	if assettypeId == 0 {
		return response.Error(400, "ID is missing", nil)
	}
	msg := models.DeleteAssetTypeByIDMsg{
		Id: assettypeId,
	}
	if err := bus.Dispatch(&msg); err != nil {
		if err == models.ErrAssetTypeNotFound {
			return response.Error(404, "asset type not found", err)
		}
		return response.Error(500, "delete asset type failed", err)
	}
	return response.Success("deleted asset type")
}
