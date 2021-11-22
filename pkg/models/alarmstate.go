package models

import (
	"time"

	"github.com/grafana/grafana/pkg/components/simplejson"
)

type AlarmStateType string

const (
	AlarmStateAlerting AlarmStateType = "alerting"
	AlarmStateOK       AlarmStateType = "ok"
	AlarmStatePending  AlarmStateType = "pending"
)

type AlarmState struct {
	Id        int64            `json:"id"`
	CreatedAt time.Time        `json:"created_at"`
	UpdatedAt time.Time        `json:"updated_at"`
	DeletedAt *time.Time       `json:"deleted_at"`
	AlarmId   int64            `json:"alarm_id"`
	OrgId     int64            `json:"org_id"`
	SiteId    int64            `json:"site_id"`
	AssetId   int64            `json:"asset_id"`
	Name      string           `json:"name"`
	Context   *simplejson.Json `json:"context"`
	Data      *simplejson.Json `json:"data"`
	State     AlarmStateType   `json:"state"`
	For       time.Duration    `json:"for"`
	Enabled   bool             `json:"enabled"`
}

type AlarmStateRsp struct {
	UpdatedAt   time.Time        `json:"updated_at"`
	Name        string           `json:"name"`
	Message     string           `json:"message"`
	AlarmId     int64            `json:"alarm_id"`
	AlarmLevel  AlarmLevelType   `json:"alarm_level"`
	State       AlarmStateType   `json:"state"`
	For         time.Duration    `json:"for"`
	Enabled     bool             `json:"enabled"`
	Count       int64            `json:"count"`
	Context     *simplejson.Json `json:"context"`
	Data        *simplejson.Json `json:"data"`
	ManualReset bool             `json:"manual_reset"`
}

type CreateAlarmStateMsg struct {
	AlarmId    int64            `json:"alarm_id"`
	AlarmLevel AlarmLevelType   `json:"alarm_level"`
	Name       string           `json:"name"`
	Context    *simplejson.Json `json:"context"`
	Data       *simplejson.Json `json:"data"`
	For        time.Duration    `json:"for"`
	Enabled    bool             `json:"enabled"`
}

type UpdateAlarmStateMsg struct {
	AlarmId int64            `json:"alarm_id"`
	Name    string           `json:"name"`
	Context *simplejson.Json `json:"context"`
	Data    *simplejson.Json `json:"data"`
	For     time.Duration    `json:"for"`
	Enabled bool             `json:"enabled"`
}

type ResetAlarmMsg struct {
	Id int64 `json:"id"`
}

type GetAlarmStatesMsg struct {
	OrgId      int64                    `json:"org_id"`
	SiteId     int64                    `json:"site_id"`
	AssetId    int64                    `json:"asset_id"`
	Permission PermissionLevelType      `json:"permission_level"`
	AlarmLevel AlarmLevelType           `json:"alarm_level"`
	Page       int                      `json:"page"`
	PerPage    int                      `json:"perPage"`
	Result     AlarmStateQueryResultRsp `json:"-"`
}

type AlarmStateQueryResultRsp struct {
	TotalCount int64            `json:"totalCount"`
	Data       []*AlarmStateRsp `json:"data"`
	Page       int              `json:"page"`
	PerPage    int              `json:"perPage"`
}

type AlarmCount struct {
	AlarmId int64 `json:"alarm_id"`
	Count   int64 `json:"count"`
}

type CreateAlarmStateJob struct {
	AlarmId    int64            `json:"alarm_id"`
	AlarmLevel AlarmLevelType   `json:"alarm_level"`
	Name       string           `json:"name"`
	Context    *simplejson.Json `json:"context"`
	Data       *simplejson.Json `json:"data"`
	For        time.Duration    `json:"for"`
	Enabled    bool             `json:"enabled"`
}

type UpdateAlarmStateJob struct {
	AlarmId int64            `json:"alarm_id"`
	Name    string           `json:"name"`
	Context *simplejson.Json `json:"context"`
	Data    *simplejson.Json `json:"data"`
	For     time.Duration    `json:"for"`
	Enabled bool             `json:"enabled"`
}
