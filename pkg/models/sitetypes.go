package models

import (
	"errors"
	"time"

	"github.com/grafana/grafana/pkg/components/simplejson"
)

var (
	ErrSiteTypeNotFound = errors.New("site type not found")
)

type SiteType struct {
	Id             int64            `json:"id"`
	CreatedAt      time.Time        `json:"created_at"`
	UpdatedAt      time.Time        `json:"updated_at"`
	DeletedAt      *time.Time       `json:"deleted_at"`
	Type           string           `json:"type"`
	SiteAppConfigs *simplejson.Json `json:"site_app_configs"`
	SiteProps      *simplejson.Json `json:"site_props"`
}

type CreateSiteTypeMsg struct {
	Type           string           `json:"type"`
	SiteAppConfigs *simplejson.Json `json:"site_app_configs"`
	SiteProps      *simplejson.Json `json:"site_props"`
	Result         *SiteTypeRsp     `json:"-"`
}

type SiteTypeRsp struct {
	Id             int64            `json:"id"`
	UpdatedAt      time.Time        `json:"updated_at"`
	Type           string           `json:"type"`
	SiteAppConfigs *simplejson.Json `json:"site_app_configs"`
	SiteProps      *simplejson.Json `json:"site_props"`
}

type DeleteSiteTypeByIDMsg struct {
	Id int64 `json:"id"`
}

type UpdateSiteTypeMsg struct {
	Id             int64            `json:"id"`
	Type           string           `json:"type"`
	SiteAppConfigs *simplejson.Json `json:"site_app_configs"`
	SiteProps      *simplejson.Json `json:"site_props"`
}

type GetSiteTypeByIDMsg struct {
	Id     int64        `json:"id"`
	Result *SiteTypeRsp `json:"-"`
}

type GetSiteTypeBySearchQueryMsg struct {
	Query   string                 `json:"query"`
	Page    int                    `json:"page"`
	PerPage int                    `json:"perPage"`
	Result  SiteTypeQueryResultRsp `json:"result"`
}

type SiteTypeQueryResultRsp struct {
	TotalCount int64          `json:"totalCount"`
	Data       []*SiteTypeRsp `json:"data"`
	Page       int            `json:"page"`
	PerPage    int            `json:"perPage"`
}
