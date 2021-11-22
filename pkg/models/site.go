package models

import (
	"errors"
	"time"

	"github.com/grafana/grafana/pkg/components/simplejson"
)

var (
	ErrSiteNotFound = errors.New("site not found")
)

type Site struct {
	Id             int64            `json:"id"`
	CreatedAt      time.Time        `json:"created_at"`
	UpdatedAt      time.Time        `json:"updated_at"`
	DeletedAt      *time.Time       `json:"deleted_at"`
	OrgId          int64            `json:"org_id"`
	Name           string           `json:"name"`
	Description    string           `json:"description"`
	Type           string           `json:"type"`
	Serial         string           `json:"serial"`
	SiteAppConfigs *simplejson.Json `json:"site_app_configs"`
	SiteProps      *simplejson.Json `json:"site_props"`
}

type CreateSiteMsg struct {
	OrgId       int64    `json:"org_id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Type        string   `json:"type"`
	Long        float64  `json:"long"`
	Lat         float64  `json:"lat"`
	Serial      string   `json:"serial"`
	Result      *SiteRsp `json:"-"`
}

type SiteRsp struct {
	Id             int64            `json:"id"`
	UpdatedAt      time.Time        `json:"updated_at"`
	OrgId          int64            `json:"org_id"`
	Name           string           `json:"name"`
	Description    string           `json:"description"`
	Type           string           `json:"type"`
	Url            string           `json:"url"`
	Long           float64          `json:"long"`
	Lat            float64          `json:"lat"`
	Serial         string           `json:"serial"`
	SiteAppConfigs *simplejson.Json `json:"site_app_configs"`
	SiteProps      *simplejson.Json `json:"site_props"`
	AlarmCount     int64            `json:"alarm_count"`
	TeamCount      int64            `json:"team_count"`
	AssetCount     int64            `json:"asset_count"`
}

type DeleteSiteByIDMsg struct {
	Id int64 `json:"id"`
}

type UpdateSiteMsg struct {
	Id             int64            `json:"id"`
	Name           string           `json:"name"`
	Description    string           `json:"description"`
	Type           string           `json:"type"`
	Long           float64          `json:"long"`
	Lat            float64          `json:"lat"`
	Serial         string           `json:"serial"`
	SiteAppConfigs *simplejson.Json `json:"site_app_configs"`
	SiteProps      *simplejson.Json `json:"site_props"`
}

type CloneSiteMsg struct {
	Id     int64    `json:"id"`
	Result *SiteRsp `json:"-"`
}

type GetSiteByIDMsg struct {
	Id              int64               `json:"id"`
	PermissionLevel PermissionLevelType `json:"permission_level"`
	Result          *SiteRsp            `json:"-"`
}

type GetSitesBySearchQueryMsg struct {
	Query           string              `json:"query"`
	UserId          int64               `json:"user_id"`
	OrgId           int64               `json:"org_id"`
	PermissionLevel PermissionLevelType `json:"permission_level"`
	Page            int                 `json:"page"`
	PerPage         int                 `json:"perPage"`
	Result          SiteQueryResultRsp  `json:"result"`
}

type GetTeamSitesBySearchQueryMsg struct {
	Query           string              `json:"query"`
	UserId          int64               `json:"user_id"`
	OrgId           int64               `json:"org_id"`
	TeamId          int64               `json:"team_id"`
	PermissionLevel PermissionLevelType `json:"permission_level"`
	Page            int                 `json:"page"`
	PerPage         int                 `json:"perPage"`
	Result          SiteQueryResultRsp  `json:"result"`
}

type SiteQueryResultRsp struct {
	TotalCount int64      `json:"totalCount"`
	Data       []*SiteRsp `json:"data"`
	Page       int        `json:"page"`
	PerPage    int        `json:"perPage"`
}

type QueryCount struct {
	Count int64
}
