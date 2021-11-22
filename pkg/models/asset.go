package models

import (
	"errors"
	"time"

	"github.com/grafana/grafana/pkg/components/simplejson"
)

var (
	ErrAssetNotFound = errors.New("asset not found")
)

type Asset struct {
	Id                     int64            `json:"id"`
	CreatedAt              time.Time        `json:"created_at"`
	UpdatedAt              time.Time        `json:"updated_at"`
	DeletedAt              *time.Time       `json:"deleted_at"`
	OrgId                  int64            `json:"org_id"`
	SiteId                 int64            `json:"site_id"`
	Serial                 string           `json:"serial"`
	Name                   string           `json:"name"`
	Description            string           `json:"description"`
	Type                   string           `json:"type"`
	AssetControllerConfigs *simplejson.Json `json:"asset_controller_configs"`
	AssetAppConfigs        *simplejson.Json `json:"asset_app_configs"`
	AssetProps             *simplejson.Json `json:"asset_props"`
}

type CreateAssetMsg struct {
	OrgId                  int64            `json:"org_id"`
	SiteId                 int64            `json:"site_id"`
	Serial                 string           `json:"serial"`
	Name                   string           `json:"name"`
	Description            string           `json:"description"`
	Type                   string           `json:"type"`
	Long                   float64          `json:"long"`
	Lat                    float64          `json:"lat"`
	AssetControllerConfigs *simplejson.Json `json:"asset_controller_configs"`
	AssetAppConfigs        *simplejson.Json `json:"asset_app_configs"`
	AssetProps             *simplejson.Json `json:"asset_props"`
	Result                 *AssetRsp        `json:"-"`
}

type AssetRsp struct {
	Id                     int64            `json:"id"`
	UpdatedAt              time.Time        `json:"updated_at"`
	OrgId                  int64            `json:"org_id"`
	SiteId                 int64            `json:"site_id"`
	Serial                 string           `json:"serial"`
	Name                   string           `json:"name"`
	Description            string           `json:"description"`
	Type                   string           `json:"type"`
	Long                   float64          `json:"long"`
	Lat                    float64          `json:"lat"`
	AssetControllerConfigs *simplejson.Json `json:"asset_controller_configs"`
	AssetAppConfigs        *simplejson.Json `json:"asset_app_configs"`
	AssetProps             *simplejson.Json `json:"asset_props"`
	AlarmCount             int64            `json:"alarm_count"`
	Url                    string           `json:"url"`
}

type DeleteAssetByIDMsg struct {
	Id int64 `json:"id"`
}

type UpdateAssetMsg struct {
	Id                     int64            `json:"id"`
	SiteId                 int64            `json:"site_id"`
	Serial                 string           `json:"serial"`
	Name                   string           `json:"name"`
	Description            string           `json:"description"`
	Type                   string           `json:"type"`
	Long                   float64          `json:"long"`
	Lat                    float64          `json:"lat"`
	AssetControllerConfigs *simplejson.Json `json:"asset_controller_configs"`
	AssetAppConfigs        *simplejson.Json `json:"asset_app_configs"`
	AssetProps             *simplejson.Json `json:"asset_props"`
}

type CloneAssetMsg struct {
	Id     int64     `json:"id"`
	Result *AssetRsp `json:"-"`
}

type GetAssetByIDMsg struct {
	Id              int64               `json:"id"`
	PermissionLevel PermissionLevelType `json:"permission_level"`
	Result          *AssetRsp           `json:"-"`
}

type GetAssetsBySearchQueryMsg struct {
	OrgId           int64               `json:"org_id"`
	SiteId          int64               `json:"site_id"`
	PermissionLevel PermissionLevelType `json:"permission_level"`
	Query           string              `json:"query"`
	PerPage         int                 `json:"perPage"`
	Page            int                 `json:"page"`
	Result          AssetQueryResultRsp `json:"result"`
}

type UpdateAssetTypeByIDMsg struct {
	Id int64 `json:"id"`
}

type AssetQueryResultRsp struct {
	TotalCount int64       `json:"totalCount"`
	Data       []*AssetRsp `json:"data"`
	Page       int         `json:"page"`
	PerPage    int         `json:"perPage"`
}

type DownLinkMsg struct {
	Assettype  string `json:"assettype,omitempty"`
	Serial     string `json:"serial,omitempty"`
	Siteserial string `json:"siteserial,omitempty"`
	Command    string `json:"command,omitempty"`
	Client     string `json:"client,omitempty"`
	Data       []Data `json:"data,omitempty"`
}

type Data struct {
	Key   string `json:"key,omitempty"`
	Value string `json:"value,omitempty"`
}
