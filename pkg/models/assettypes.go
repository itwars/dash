package models

import (
	"errors"
	"time"

	"github.com/grafana/grafana/pkg/components/simplejson"
)

var (
	ErrAssetTypeNotFound = errors.New("asset type not found")
)

type AssetType struct {
	Id                     int64            `json:"id"`
	CreatedAt              time.Time        `json:"created_at"`
	UpdatedAt              time.Time        `json:"updated_at"`
	DeletedAt              *time.Time       `json:"deleted_at"`
	Type                   string           `json:"type"`
	AssetControllerConfigs *simplejson.Json `json:"asset_controller_configs"`
	AssetAppConfigs        *simplejson.Json `json:"asset_app_configs"`
	AssetProps             *simplejson.Json `json:"asset_props"`
}

type CreateAssetTypeMsg struct {
	Type                   string           `json:"type"`
	AssetControllerConfigs *simplejson.Json `json:"asset_controller_configs"`
	AssetAppConfigs        *simplejson.Json `json:"asset_app_configs"`
	AssetProps             *simplejson.Json `json:"asset_props"`
	Result                 *AssetTypeRsp    `json:"-"`
}

type AssetTypeRsp struct {
	Id                     int64            `json:"id"`
	UpdatedAt              time.Time        `json:"updated_at"`
	Type                   string           `json:"type"`
	AssetControllerConfigs *simplejson.Json `json:"asset_controller_configs"`
	AssetAppConfigs        *simplejson.Json `json:"asset_app_configs"`
	AssetProps             *simplejson.Json `json:"asset_props"`
}

type DeleteAssetTypeByIDMsg struct {
	Id int64 `json:"id"`
}

type UpdateAssetTypeMsg struct {
	Id                     int64            `json:"id"`
	Type                   string           `json:"type"`
	AssetControllerConfigs *simplejson.Json `json:"asset_controller_configs"`
	AssetAppConfigs        *simplejson.Json `json:"asset_app_configs"`
	AssetProps             *simplejson.Json `json:"asset_props"`
}

type GetAssetTypeByIDMsg struct {
	Id     int64         `json:"id"`
	Result *AssetTypeRsp `json:"-"`
}

type GetAssetTypeBySearchQueryMsg struct {
	Query   string                  `json:"query"`
	Page    int                     `json:"page"`
	PerPage int                     `json:"perPage"`
	Result  AssetTypeQueryResultRsp `json:"result"`
}

type AssetTypeQueryResultRsp struct {
	TotalCount int64           `json:"totalCount"`
	Data       []*AssetTypeRsp `json:"data"`
	Page       int             `json:"page"`
	PerPage    int             `json:"perPage"`
}
