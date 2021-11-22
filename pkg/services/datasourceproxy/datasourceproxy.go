package datasourceproxy

import (
	"errors"
	"fmt"
	"net/http"
	"regexp"
	"strconv"

	"github.com/grafana/grafana/pkg/api/datasource"
	"github.com/grafana/grafana/pkg/api/pluginproxy"
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/infra/httpclient"
	"github.com/grafana/grafana/pkg/infra/metrics"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/plugins"
	"github.com/grafana/grafana/pkg/services/datasources"
	"github.com/grafana/grafana/pkg/services/oauthtoken"
	"github.com/grafana/grafana/pkg/setting"
)

func ProvideService(dataSourceCache datasources.CacheService, plugReqValidator models.PluginRequestValidator,
	pm plugins.Manager, cfg *setting.Cfg, httpClientProvider httpclient.Provider,
	oauthTokenService *oauthtoken.Service, dsService *datasources.Service) *DataSourceProxyService {
	return &DataSourceProxyService{
		DataSourceCache:        dataSourceCache,
		PluginRequestValidator: plugReqValidator,
		PluginManager:          pm,
		Cfg:                    cfg,
		HTTPClientProvider:     httpClientProvider,
		OAuthTokenService:      oauthTokenService,
		DataSourcesService:     dsService,
	}
}

type DataSourceProxyService struct {
	DataSourceCache        datasources.CacheService
	PluginRequestValidator models.PluginRequestValidator
	PluginManager          plugins.Manager
	Cfg                    *setting.Cfg
	HTTPClientProvider     httpclient.Provider
	OAuthTokenService      *oauthtoken.Service
	DataSourcesService     *datasources.Service
}

func (p *DataSourceProxyService) ProxyDataSourceRequest(c *models.ReqContext) {
	p.ProxyDatasourceRequestWithID(c, c.ParamsInt64(":id"))
}

func (p *DataSourceProxyService) ProxyDatasourceRequestWithID(c *models.ReqContext, dsID int64) {
	c.TimeRequest(metrics.MDataSourceProxyReqTimer)

	ds, err := p.DataSourceCache.GetDatasource(dsID, c.SignedInUser, c.SkipCache)
	if err != nil {
		if errors.Is(err, models.ErrDataSourceAccessDenied) {
			c.JsonApiErr(http.StatusForbidden, "Access denied to datasource", err)
			return
		}
		if errors.Is(err, models.ErrDataSourceNotFound) {
			c.JsonApiErr(http.StatusNotFound, "Unable to find datasource", err)
			return
		}
		c.JsonApiErr(http.StatusInternalServerError, "Unable to load datasource meta data", err)
		return
	}

	err = p.PluginRequestValidator.Validate(ds.Url, c.Req)
	if err != nil {
		c.JsonApiErr(http.StatusForbidden, "Access denied", err)
		return
	}

	siteId := int64(0)
	siteIdHeader := c.Req.Header.Get("Site-Id")
	if siteIdHeader != "" {
		siteId, _ = strconv.ParseInt(siteIdHeader, 10, 64)
	}

	assetId := int64(0)
	assetIdHeader := c.Req.Header.Get("Asset-Id")
	if assetIdHeader != "" {
		assetId, _ = strconv.ParseInt(assetIdHeader, 10, 64)
	}

	if ((siteId != 0 || assetId != 0) && (ds.Type == "dataservice")) ||
		((siteId != 0 || assetId != 0) && (ds.Type == models.DS_INFLUXDB || ds.Type == models.DS_INFLUXDB_08)) {

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
			c.JsonApiErr(500, "site access failed", err)
			return
		}

		if access.Result == false {
			c.JsonApiErr(403, " site access denied", nil)
			return
		}
	}

	// find plugin
	plugin := p.PluginManager.GetDataSource(ds.Type)
	if plugin == nil {
		c.JsonApiErr(http.StatusNotFound, "Unable to find datasource plugin", err)
		return
	}

	proxy, err := pluginproxy.NewDataSourceProxy(
		ds, plugin, c, getProxyPath(c), p.Cfg, p.HTTPClientProvider, p.OAuthTokenService, p.DataSourcesService,
	)

	if err != nil {
		if errors.Is(err, datasource.URLValidationError{}) {
			c.JsonApiErr(http.StatusBadRequest, fmt.Sprintf("Invalid data source URL: %q", ds.Url), err)
		} else {
			c.JsonApiErr(http.StatusInternalServerError, "Failed creating data source proxy", err)
		}
		return
	}
	proxy.HandleRequest()
}

var proxyPathRegexp = regexp.MustCompile(`^\/api\/datasources\/proxy\/[\d]+\/?`)

func extractProxyPath(originalRawPath string) string {
	return proxyPathRegexp.ReplaceAllString(originalRawPath, "")
}

func getProxyPath(c *models.ReqContext) string {
	return extractProxyPath(c.Req.URL.EscapedPath())
}
