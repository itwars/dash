package api

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/grafana/grafana/pkg/setting"
	"github.com/grafana/grafana/pkg/util"
	"github.com/pkg/errors"

	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/infra/metrics"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/search"
)

func Search(c *models.ReqContext) response.Response {
	query := c.Query("query")
	tags := c.QueryStrings("tag")
	starred := c.Query("starred")
	limit := c.QueryInt64("limit")
	page := c.QueryInt64("page")
	dashboardType := c.Query("type")
	sort := c.Query("sort")
	permission := models.PERMISSION_VIEW

	if limit > 5000 {
		return response.Error(422, "Limit is above maximum allowed (5000), use page parameter to access hits beyond limit", nil)
	}

	if c.Query("permission") == "Edit" {
		permission = models.PERMISSION_EDIT
	}

	dbIDs := make([]int64, 0)
	for _, id := range c.QueryStrings("dashboardIds") {
		dashboardID, err := strconv.ParseInt(id, 10, 64)
		if err == nil {
			dbIDs = append(dbIDs, dashboardID)
		}
	}

	folderIDs := make([]int64, 0)
	for _, id := range c.QueryStrings("folderIds") {
		folderID, err := strconv.ParseInt(id, 10, 64)
		if err == nil {
			folderIDs = append(folderIDs, folderID)
		}
	}

	searchQuery := search.Query{
		Title:        query,
		Tags:         tags,
		SignedInUser: c.SignedInUser,
		Limit:        limit,
		Page:         page,
		IsStarred:    starred == "true",
		OrgId:        c.OrgId,
		DashboardIds: dbIDs,
		Type:         dashboardType,
		FolderIds:    folderIDs,
		Permission:   permission,
		Sort:         sort,
	}

	err := bus.DispatchCtx(c.Req.Context(), &searchQuery)
	if err != nil {
		return response.Error(500, "Search failed", err)
	}

	c.TimeRequest(metrics.MApiDashboardSearch)
	return response.JSON(200, searchQuery.Result)
}

func SearchSites(c *models.ReqContext) response.Response {
	query := c.Query("query")
	perPage := c.QueryInt64("perpage")
	page := c.QueryInt64("page")
	if page <= 0 {
		page = 1
	}
	if perPage <= 0 {
		perPage = 1000
	}
	if perPage > 1000 {
		return response.Error(422, "Limit is above maximum allowed (1000), use page parameter to access hits beyond limit", nil)
	}

	permission := models.GetPermissionLevel(c.OrgRole)
	if c.IsGrafanaAdmin {
		permission = models.PERMISSIONLEVEL_GRAFANAADMIN
	}

	msg := models.GetSitesBySearchQueryMsg{
		OrgId:           c.OrgId,
		UserId:          c.UserId,
		PermissionLevel: permission,
		Query:           query,
		PerPage:         int(perPage),
		Page:            int(page),
	}
	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "get sites failed", err)
	}
	urls := make(map[string]string)
	for i := range msg.Result.Data {
		url, ok := urls[msg.Result.Data[i].Type]
		if !ok {
			url, _ = getDashboardUrl(c, msg.Result.Data[i].Type)
			urls[msg.Result.Data[i].Type] = url
		}
		msg.Result.Data[i].Url = fmt.Sprintf("%s&siteId=%d", url, msg.Result.Data[i].Id)
	}
	c.TimeRequest(metrics.MApiSiteSearch)
	return response.JSON(200, msg.Result)
}

func SearchTeamSites(c *models.ReqContext) response.Response {
	query := c.Query("query")
	perPage := c.QueryInt64("perpage")
	page := c.QueryInt64("page")
	teamId := c.QueryInt64("teamId")
	if page <= 0 {
		page = 1
	}
	if perPage <= 0 {
		perPage = 1000
	}
	if perPage > 1000 {
		return response.Error(422, "Limit is above maximum allowed (1000), use page parameter to access hits beyond limit", nil)
	}

	permission := models.GetPermissionLevel(c.OrgRole)
	if c.IsGrafanaAdmin {
		permission = models.PERMISSIONLEVEL_GRAFANAADMIN
	}

	msg := models.GetTeamSitesBySearchQueryMsg{
		OrgId:           c.OrgId,
		UserId:          c.UserId,
		TeamId:          teamId,
		PermissionLevel: permission,
		Query:           query,
		PerPage:         int(perPage),
		Page:            int(page),
	}
	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "get sites failed", err)
	}
	urls := make(map[string]string)
	for i := range msg.Result.Data {
		url, ok := urls[msg.Result.Data[i].Type]
		if !ok {
			url, _ = getDashboardUrl(c, msg.Result.Data[i].Type)
			urls[msg.Result.Data[i].Type] = url
		}
		msg.Result.Data[i].Url = fmt.Sprintf("%s&siteId=%d&siteSerial=%s", url, msg.Result.Data[i].Id, msg.Result.Data[i].Serial)
	}
	c.TimeRequest(metrics.MApiSiteSearch)
	return response.JSON(200, msg.Result)
}

func SearchAssets(c *models.ReqContext) response.Response {
	query := c.Query("query")
	perPage := c.QueryInt64("perpage")
	page := c.QueryInt64("page")
	siteId := c.QueryInt64("siteId")
	if page <= 0 {
		page = 1
	}
	if perPage <= 0 {
		perPage = 1000
	}
	if perPage > 1000 {
		return response.Error(422, "Limit is above maximum allowed (1000), use page parameter to access hits beyond limit", nil)
	}

	permission := models.GetPermissionLevel(c.OrgRole)
	if c.IsGrafanaAdmin {
		permission = models.PERMISSIONLEVEL_GRAFANAADMIN
	}

	msg := models.GetAssetsBySearchQueryMsg{
		OrgId:           c.OrgId,
		SiteId:          siteId,
		PermissionLevel: permission,
		Query:           query,
		PerPage:         int(perPage),
		Page:            int(page),
	}
	if err := bus.Dispatch(&msg); err != nil {
		return response.Error(500, "get assets failed", err)
	}
	urls := make(map[string]string)
	for i := range msg.Result.Data {
		url, ok := urls[msg.Result.Data[i].Type]
		if !ok {
			url, _ = getDashboardUrl(c, msg.Result.Data[i].Type)
			urls[msg.Result.Data[i].Type] = url
		}
		msg.Result.Data[i].Url = fmt.Sprintf("%s&siteId=%d&assetId=%d&assetSerial=%s", url, msg.Result.Data[i].SiteId, msg.Result.Data[i].Id, msg.Result.Data[i].Serial)
	}
	c.TimeRequest(metrics.MApiSiteSearch)
	return response.JSON(200, msg.Result)
}

func getDashboardUrl(c *models.ReqContext, folderName string) (url string, err error) {

	query := models.GetDashboardsBySlugQuery{OrgId: c.OrgId, Slug: strings.ToLower(folderName)}
	if err := bus.Dispatch(&query); err != nil {
		return "", errors.Wrapf(err, "failed to fetch folder details for type: %s", folderName)
	}
	if len(query.Result) != 1 {
		return "", errors.Wrapf(err, "no folder is available for type: %s", folderName)
	}
	permission := models.GetPermissionLevel(c.OrgRole)

	folderIDs := make([]int64, 0)
	folderIDs = append(folderIDs, query.Result[0].Id)
	searchQuery := search.Query{
		SignedInUser: c.SignedInUser,
		OrgId:        c.OrgId,
		FolderIds:    folderIDs,
		Permission:   models.PermissionType(permission),
	}

	if err := bus.Dispatch(&searchQuery); err != nil {
		return "", errors.Wrapf(err, "failed to fetch dashboards for folderId: %d", query.Result[0].Id)
	}

	if searchQuery.Result.Len() < 1 {
		return "", errors.Wrapf(err, "no dashboard is available for folderId: %d", query.Result[0].Id)
	}
	var hit *search.Hit
	for i := range searchQuery.Result {
		if i == 0 {
			hit = searchQuery.Result[i]
		} else {
			if hit.Index > searchQuery.Result[i].Index {
				hit = searchQuery.Result[i]
			}
		}
	}
	if hit == nil {
		return "", errors.Wrapf(err, "no dashboard is available for folderId: %d", query.Result[0].Id)
	}
	url = fmt.Sprintf("%s/d/%s/%s?dashtype=%d", setting.AppSubUrl, hit.UID, hit.Slug, hit.FolderID)
	return url, nil
}

func (hs *HTTPServer) ListSortOptions(c *models.ReqContext) response.Response {
	opts := hs.SearchService.SortOptions()

	res := []util.DynMap{}
	for _, o := range opts {
		res = append(res, util.DynMap{
			"name":        o.Name,
			"displayName": o.DisplayName,
			"description": o.Description,
			"meta":        o.MetaName,
		})
	}

	return response.JSON(http.StatusOK, util.DynMap{
		"sortOptions": res,
	})
}
