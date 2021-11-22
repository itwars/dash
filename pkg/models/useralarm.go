package models

import (
	"time"

	"github.com/grafana/grafana/pkg/components/simplejson"
)

type GetUserAlarmByAlarmIDMsg struct {
	AlarmId    int64               `json:"alarm_id"`
	OrgId      int64               `json:"org_id"`
	SiteId     int64               `json:"site_id"`
	AssetId    int64               `json:"asset_id"`
	Permission PermissionLevelType `json:"permission_level"`
	AlarmLevel AlarmLevelType      `json:"alarm_level"`
	Result     *UserAlarmRsp       `json:"-"`
}

type GetUserAlarmsMsg struct {
	OrgId      int64               `json:"org_id"`
	SiteId     int64               `json:"site_id"`
	AssetId    int64               `json:"asset_id"`
	Permission PermissionLevelType `json:"permission_level"`
	AlarmLevel AlarmLevelType      `json:"alarm_level"`
	Page       int                 `json:"page"`
	PerPage    int                 `json:"perPage"`
	Result     UserAlarmResultRsp  `json:"-"`
}

type UserAlarmRsp struct {
	UpdatedAt  time.Time        `json:"updated_at"`
	Name       string           `json:"name"`
	AlarmId    int64            `json:"alarm_id"`
	AlarmLevel AlarmLevelType   `json:"alarm_level"`
	For        time.Duration    `json:"for_duration"`
	Enabled    bool             `json:"enabled"`
	Context    *simplejson.Json `json:"context"`
}

type UserAlarmResultRsp struct {
	TotalCount int64           `json:"totalCount"`
	Data       []*UserAlarmRsp `json:"data"`
	Page       int             `json:"page"`
	PerPage    int             `json:"perPage"`
}

type UpdateUserAlarmMsg struct {
	OrgId      int64            `json:"org_id"`
	SiteId     int64            `json:"site_id"`
	AssetId    int64            `json:"asset_id"`
	AlarmId    int64            `json:"alarm_id"`
	AlarmLevel AlarmLevelType   `json:"alarm_level"`
	Context    *simplejson.Json `json:"context"`
	For        time.Duration    `json:"for_duration"`
	Enabled    bool             `json:"enabled"`
}

type UpdateUserAlarmJob struct {
	OrgId      int64            `json:"org_id"`
	SiteId     int64            `json:"site_id"`
	AssetId    int64            `json:"asset_id"`
	AlarmId    int64            `json:"alarm_id"`
	AlarmLevel AlarmLevelType   `json:"alarm_level"`
	Context    *simplejson.Json `json:"context"`
	Data       *simplejson.Json `json:"data"`
	For        time.Duration    `json:"for_duration"`
	Enabled    bool             `json:"enabled"`
}
