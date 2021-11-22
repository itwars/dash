package api

import (
	"github.com/grafana/grafana/pkg/api/dtos"
	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/models"
)

func (h *HTTPServer) AddSiteTeam(c *models.ReqContext, msg models.AddSiteTeamMsg) response.Response {
	msg.SiteId = c.ParamsInt64(":siteId")
	if msg.TeamId == 0 || msg.SiteId == 0 {
		return response.Error(400, "add site  to team request is not valid", nil)
	}

	permission := models.GetPermissionLevel(c.OrgRole)
	if c.IsGrafanaAdmin == true {
		permission = models.PERMISSIONLEVEL_GRAFANAADMIN
	}
	access := models.TeamAccessMsg{
		OrgId:           c.OrgId,
		UserId:          c.UserId,
		TeamId:          msg.TeamId,
		PermissionLevel: permission,
	}
	if err := bus.Dispatch(&access); err != nil {
		return response.Error(500, "team access failed", err)
	}

	if access.Result == false {
		return response.Error(403, " team access denied", nil)
	}

	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "add site  to team failed", err)
	}
	return response.Success("site added to team")
}

func (h *HTTPServer) DeleteSiteTeam(c *models.ReqContext) response.Response {
	siteId := c.ParamsInt64(":siteId")
	if siteId == 0 {
		return response.Error(400, "id is missing", nil)
	}
	siteteamId := c.ParamsInt64(":siteteamId")
	if siteteamId == 0 {
		return response.Error(400, "id is missing", nil)
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

	msg := models.DeleteSiteTeamMsg{
		Id: siteteamId,
	}
	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "delete site from team failed", err)
	}
	return response.Success("site delete from team")
}

func (hs *HTTPServer) GetSiteTeams(c *models.ReqContext) response.Response {
	siteId := c.ParamsInt64(":siteId")
	if siteId == 0 {
		return response.Error(400, "id is missing", nil)
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
		SiteId:          siteId,
		PermissionLevel: permission,
	}
	if err := bus.Dispatch(&access); err != nil {
		return response.Error(500, "site access failed", err)
	}

	if access.Result == false {
		return response.Error(403, " site access denied", nil)
	}

	msg := models.GetSiteTeamsBySearchQueryMsg{
		UserId:          c.UserId,
		SiteId:          siteId,
		PermissionLevel: permission,
		Query:           query,
		PerPage:         perPage,
		Page:            page,
	}
	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "get sites failed", err)
	}
	for _, member := range msg.Result.Data {
		member.AvatarUrl = dtos.GetGravatarUrlWithDefault(member.Email, member.TeamName)
	}
	return response.JSON(200, msg.Result)
}
