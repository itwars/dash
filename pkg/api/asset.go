package api

import (
	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/util"
)

func (h *HTTPServer) CreateAsset(c *models.ReqContext, msg models.CreateAssetMsg) response.Response {
	msg.OrgId = c.OrgId
	msg.SiteId = c.ParamsInt64(":siteId")
	if msg.OrgId == 0 || msg.Name == "" || msg.Type == "" || msg.SiteId == 0 || msg.Serial == "" {
		return response.Error(400, "create asset request is not valid", nil)
	}

	permission := models.GetPermissionLevel(c.OrgRole)
	if c.IsGrafanaAdmin == true {
		permission = models.PERMISSIONLEVEL_GRAFANAADMIN
	}

	access := models.SiteAccessMsg{
		OrgId:           c.OrgId,
		UserId:          c.UserId,
		SiteId:          msg.SiteId,
		PermissionLevel: permission,
	}
	if err := bus.Dispatch(&access); err != nil {
		return response.Error(500, "site access failed", err)
	}

	if access.Result == false {
		return response.Error(403, " site access denied", nil)
	}

	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "asset creation failed", err)
	}
	return response.JSON(200, &util.DynMap{
		"assetId": msg.Result.Id,
		"message": "asset created",
	})
}

func (h *HTTPServer) CloneAsset(c *models.ReqContext) response.Response {
	assetId := c.ParamsInt64(":assetId")
	if assetId == 0 {
		return response.Error(400, "ID is missing", nil)
	}
	siteId := c.ParamsInt64(":siteId")
	if siteId == 0 {
		return response.Error(400, "siteId is missing", nil)
	}

	permission := models.GetPermissionLevel(c.OrgRole)
	if c.IsGrafanaAdmin == true {
		permission = models.PERMISSIONLEVEL_GRAFANAADMIN
	}

	access := models.SiteAccessMsg{
		OrgId:           c.OrgId,
		UserId:          c.UserId,
		SiteId:          siteId,
		PermissionLevel: permission,
	}
	if err := bus.Dispatch(&access); err != nil {
		return response.Error(500, "site access failed", err)
	}
	if access.Result == false {
		return response.Error(403, " site access denied", nil)
	}

	msg := models.CloneAssetMsg{
		Id: assetId,
	}
	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "asset clone failed", err)
	}
	return response.JSON(200, &util.DynMap{
		"assetId": msg.Result.Id,
		"message": "asset cloned",
	})
}

func (h *HTTPServer) DeleteAssetByID(c *models.ReqContext) response.Response {
	assetId := c.ParamsInt64(":assetId")
	if assetId == 0 {
		return response.Error(400, "ID is missing", nil)
	}
	siteId := c.ParamsInt64(":siteId")
	if siteId == 0 {
		return response.Error(400, "siteId is missing", nil)
	}
	permission := models.GetPermissionLevel(c.OrgRole)
	if c.IsGrafanaAdmin {
		permission = models.PERMISSIONLEVEL_GRAFANAADMIN
	}

	access := models.SiteAccessMsg{
		OrgId:           c.OrgId,
		UserId:          c.UserId,
		SiteId:          int64(siteId),
		PermissionLevel: permission,
	}
	if err := bus.Dispatch(&access); err != nil {
		return response.Error(500, "site access failed", err)
	}
	if access.Result == false {
		return response.Error(403, " site access denied", nil)
	}

	msg := models.DeleteAssetByIDMsg{
		Id: assetId,
	}
	if err := bus.Dispatch(&msg); err != nil {
		if err == models.ErrAssetNotFound {
			return response.Error(404, "asset not found", err)
		}
		return response.Error(500, "delete asset failed", err)
	}
	return response.Success("deleted asset")
}

func (hs *HTTPServer) UpdateAsset(c *models.ReqContext, msg models.UpdateAssetMsg) response.Response {
	msg.SiteId = c.ParamsInt64(":siteId")
	if msg.Name == "" || msg.Type == "" || msg.Serial == "" || msg.SiteId == 0 {
		return response.Error(400, "update asset request is not valid", nil)
	}

	permission := models.GetPermissionLevel(c.OrgRole)
	if c.IsGrafanaAdmin == true {
		permission = models.PERMISSIONLEVEL_GRAFANAADMIN
	}

	access := models.SiteAccessMsg{
		OrgId:           c.OrgId,
		UserId:          c.UserId,
		SiteId:          msg.SiteId,
		PermissionLevel: permission,
	}
	if err := bus.Dispatch(&access); err != nil {
		return response.Error(500, "site access failed", err)
	}
	if access.Result == false {
		return response.Error(403, " site access denied", nil)
	}

	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "asset updation failed", err)
	}

	return response.Success("asset updated")
}

func (hs *HTTPServer) GetAssets(c *models.ReqContext) response.Response {
	siteId := c.ParamsInt64(":siteId")
	if siteId == 0 {
		return response.Error(400, "siteId is missing", nil)
	}
	query := c.Query("query")
	perPage := c.QueryInt("perpage")
	if perPage <= 0 {
		perPage = 1000
	}
	page := c.QueryInt("page")
	if page < 1 {
		page = 1
	}

	permission := models.GetPermissionLevel(c.OrgRole)
	if c.IsGrafanaAdmin == true {
		permission = models.PERMISSIONLEVEL_GRAFANAADMIN
	}

	access := models.SiteAccessMsg{
		OrgId:           c.OrgId,
		UserId:          c.UserId,
		SiteId:          int64(siteId),
		PermissionLevel: permission,
	}
	if err := bus.Dispatch(&access); err != nil {
		return response.Error(500, "site access failed", err)
	}
	if access.Result == false {
		return response.Error(403, " site access denied", nil)
	}

	msg := models.GetAssetsBySearchQueryMsg{
		OrgId:           c.OrgId,
		SiteId:          int64(siteId),
		PermissionLevel: permission,
		Query:           query,
		PerPage:         perPage,
		Page:            page,
	}
	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "get assets failed", err)
	}
	return response.JSON(200, msg.Result)
}

func (hs *HTTPServer) GetAssetByID(c *models.ReqContext) response.Response {
	assetId := c.ParamsInt64(":assetId")
	if assetId == 0 {
		return response.Error(400, "asset id is missing", nil)
	}
	siteId := c.ParamsInt64(":siteId")
	if siteId == 0 {
		return response.Error(400, "siteId is missing", nil)
	}
	permission := models.GetPermissionLevel(c.OrgRole)
	if c.IsGrafanaAdmin {
		permission = models.PERMISSIONLEVEL_GRAFANAADMIN
	}

	access := models.SiteAccessMsg{
		OrgId:           c.OrgId,
		UserId:          c.UserId,
		SiteId:          int64(siteId),
		PermissionLevel: permission,
	}
	if err := bus.Dispatch(&access); err != nil {
		return response.Error(500, "site access failed", err)
	}
	if access.Result == false {
		return response.Error(403, " site access denied", nil)
	}

	msg := models.GetAssetByIDMsg{
		Id:              assetId,
		PermissionLevel: permission,
	}
	if err := bus.Dispatch(&msg); err != nil {
		if err == models.ErrAssetNotFound {
			return response.Error(404, "asset not found", err)
		}
		return response.Error(500, "get asset failed", err)
	}
	return response.JSON(200, msg.Result)
}

func (hs *HTTPServer) AssetDownlink(c *models.ReqContext, cmd models.DownLinkMsg) response.Response {
	assetId := c.ParamsInt64(":assetId")
	if assetId == 0 {
		return response.Error(400, "asset id is missing", nil)
	}
	siteId := c.ParamsInt64(":siteId")
	if siteId == 0 {
		return response.Error(400, "siteId is missing", nil)
	}
	permission := models.GetPermissionLevel(c.OrgRole)
	if c.IsGrafanaAdmin {
		permission = models.PERMISSIONLEVEL_GRAFANAADMIN
	}

	access := models.SiteAccessMsg{
		OrgId:           c.OrgId,
		UserId:          c.UserId,
		SiteId:          int64(siteId),
		PermissionLevel: permission,
	}
	if err := bus.Dispatch(&access); err != nil {
		return response.Error(500, "site access failed", err)
	}
	if access.Result == false {
		return response.Error(403, " site access denied", nil)
	}

	siteMsg := models.GetSiteByIDMsg{
		Id:              siteId,
		PermissionLevel: permission,
	}
	if err := bus.Dispatch(&siteMsg); err != nil {
		if err == models.ErrSiteNotFound {
			return response.Error(404, "site not found", err)
		}
		return response.Error(500, "get site failed", err)
	}

	assetMsg := models.GetAssetByIDMsg{
		Id:              assetId,
		PermissionLevel: permission,
	}
	if err := bus.Dispatch(&assetMsg); err != nil {
		if err == models.ErrAssetNotFound {
			return response.Error(404, "asset not found", err)
		}
		return response.Error(500, "get asset failed", err)
	}

	cmd.Assettype = assetMsg.Result.Type
	cmd.Serial = assetMsg.Result.Serial
	cmd.Siteserial = siteMsg.Result.Serial

	if err := hs.Bus.Dispatch(&cmd); err != nil {
		return response.Error(500, err.Error(), err)
	}
	return response.Success("Downlink initiated")
}
