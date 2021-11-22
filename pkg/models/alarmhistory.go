package models

import (
	"time"

	"github.com/grafana/grafana/pkg/components/simplejson"
)

type AlarmHistory struct {
	Id        int64            `json:"id"`
	CreatedAt time.Time        `json:"created_at"`
	UpdatedAt time.Time        `json:"updated_at"`
	DeletedAt *time.Time       `json:"deleted_at"`
	AlarmId   int64            `json:"alarm_id"`
	OrgId     int64            `json:"org_id"`
	SiteId    int64            `json:"site_id"`
	AssetID   int64            `json:"asset_id"`
	Context   *simplejson.Json `json:"context"`
	State     AlarmStateType   `json:"state"`
}

type AlarmHistoryRsp struct {
	UpdatedAt time.Time        `json:"updated_at"`
	Name      string           `json:"name"`
	Message   string           `json:"message"`
	Context   *simplejson.Json `json:"context"`
	State     AlarmStateType   `json:"state"`
}

type GetAlarmHistoryByQueryMsg struct {
	Query      string                     `json:"query"`
	OrgId      int64                      `json:"org_id"`
	SiteId     int64                      `json:"site_id"`
	AssetId    int64                      `json:"asset_id"`
	Permission PermissionLevelType        `json:"permission_level"`
	AlarmLevel AlarmLevelType             `json:"alarm_level"`
	Result     AlarmHistoryQueryResultRsp `json:"-"`
	Page       int                        `json:"page"`
	PerPage    int                        `json:"perPage"`
}

type AlarmHistoryQueryResultRsp struct {
	TotalCount int64              `json:"totalCount"`
	Data       []*AlarmHistoryRsp `json:"data"`
	Page       int                `json:"page"`
	PerPage    int                `json:"perPage"`
}
