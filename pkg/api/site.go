package api

import (
	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/util"
)

func (h *HTTPServer) CreateSite(c *models.ReqContext, msg models.CreateSiteMsg) response.Response {
	msg.OrgId = c.OrgId
	if msg.OrgId == 0 || msg.Type == "" {
		return response.Error(400, "create site request is not valid", nil)
	}
	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "site creation failed", err)
	}
	return response.JSON(200, &util.DynMap{
		"siteId":  msg.Result.Id,
		"message": "site created",
	})
}

func (h *HTTPServer) CloneSite(c *models.ReqContext) response.Response {
	siteId := c.ParamsInt64(":siteId")
	if siteId == 0 {
		return response.Error(400, "ID is missing", nil)
	}

	permission := models.GetPermissionLevel(c.OrgRole)
	if c.IsGrafanaAdmin {
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

	msg := models.CloneSiteMsg{
		Id: siteId,
	}
	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "site clone failed", err)
	}
	return response.JSON(200, &util.DynMap{
		"siteId":  msg.Result.Id,
		"message": "site cloned",
	})
}

func (h *HTTPServer) DeleteSiteByID(c *models.ReqContext) response.Response {
	siteId := c.ParamsInt64(":siteId")
	if siteId == 0 {
		return response.Error(400, "ID is missing", nil)
	}

	permission := models.GetPermissionLevel(c.OrgRole)
	if c.IsGrafanaAdmin {
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

	msg := models.DeleteSiteByIDMsg{
		Id: siteId,
	}
	if err := bus.Dispatch(&msg); err != nil {
		if err == models.ErrSiteNotFound {
			return response.Error(404, "site not found", err)
		}
		return response.Error(500, "delete site failed", err)
	}
	return response.Success("deleted site")
}

func (hs *HTTPServer) UpdateSite(c *models.ReqContext, msg models.UpdateSiteMsg) response.Response {

	if msg.Name == "" || msg.Type == "" || msg.Id == 0 {
		return response.Error(400, "update site request is not valid", nil)
	}

	permission := models.GetPermissionLevel(c.OrgRole)
	if c.IsGrafanaAdmin == true {
		permission = models.PERMISSIONLEVEL_GRAFANAADMIN
	}

	access := models.SiteAccessMsg{
		OrgId:           c.OrgId,
		UserId:          c.UserId,
		SiteId:          msg.Id,
		PermissionLevel: permission,
	}
	if err := bus.Dispatch(&access); err != nil {
		return response.Error(500, "site access failed", err)
	}

	if access.Result == false {
		return response.Error(403, " site access denied", nil)
	}

	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "site updation failed", err)
	}

	return response.Success("site updated")
}

func (hs *HTTPServer) GetSites(c *models.ReqContext) response.Response {
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

	msg := models.GetSitesBySearchQueryMsg{
		OrgId:           c.OrgId,
		UserId:          c.UserId,
		PermissionLevel: permission,
		Query:           query,
		PerPage:         perPage,
		Page:            page,
	}
	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "get sites failed", err)
	}
	return response.JSON(200, msg.Result)
}

func (hs *HTTPServer) GetSiteByID(c *models.ReqContext) response.Response {
	siteId := c.ParamsInt64(":siteId")
	if siteId == 0 {
		return response.Error(400, "ID is missing", nil)
	}
	permission := models.GetPermissionLevel(c.OrgRole)
	if c.IsGrafanaAdmin {
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

	msg := models.GetSiteByIDMsg{
		Id:              siteId,
		PermissionLevel: permission,
	}
	if err := bus.Dispatch(&msg); err != nil {
		if err == models.ErrSiteNotFound {
			return response.Error(404, "site not found", err)
		}
		return response.Error(500, "get site failed", err)
	}
	return response.JSON(200, msg.Result)
}

func (hs *HTTPServer) SiteDownlink(c *models.ReqContext, cmd models.DownLinkMsg) response.Response {
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

	cmd.Siteserial = siteMsg.Result.Serial
	if err := hs.Bus.Dispatch(&cmd); err != nil {
		return response.Error(500, err.Error(), err)
	}
	return response.Success("Downlink initiated")
}
