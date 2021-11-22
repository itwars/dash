package models

import (
	"errors"
	"time"

	"github.com/grafana/grafana/pkg/components/simplejson"
)

type PermissionLevelType int
type SeverityLevelType int
type AlarmLevelType int

var (
	ErrAlarmNotFound = errors.New("alarm not found")
)

const (
	PERMISSIONLEVEL_VIEW PermissionLevelType = 1 << iota
	PERMISSIONLEVEL_EDIT
	PERMISSIONLEVEL_ADMIN
	PERMISSIONLEVEL_GRAFANAADMIN
)

const (
	ALARMLEVEL_ORG AlarmLevelType = 1 << iota
	ALARMLEVEL_SITE
	ALARMLEVEL_ASSET
)

const (
	SEVERITYLEVEL_MINOR SeverityLevelType = 1 << iota
	SEVERITYLEVEL_MAJOR
	SEVERITYLEVEL_CRITICAL
)

func GetPermissionLevel(role RoleType) PermissionLevelType {
	names := map[RoleType]PermissionLevelType{
		ROLE_VIEWER: PERMISSIONLEVEL_VIEW,
		ROLE_EDITOR: PERMISSIONLEVEL_EDIT,
		ROLE_ADMIN:  PERMISSIONLEVEL_ADMIN,
	}
	if _, ok := names[role]; ok == false {
		return PERMISSIONLEVEL_VIEW
	}
	return names[role]
}

type Alarm struct {
	Id              int64               `json:"id"`
	CreatedAt       time.Time           `json:"created_at"`
	UpdatedAt       time.Time           `json:"updated_at"`
	DeletedAt       *time.Time          `json:"deleted_at"`
	Name            string              `json:"name"`
	Description     string              `json:"description"`
	AlertingMsg     string              `json:"alerting_msg"`
	OkMsg           string              `json:"ok_msg"`
	Severity        SeverityLevelType   `json:"severity"`
	PermissionLevel PermissionLevelType `json:"permission_level"`
	AlarmLevel      AlarmLevelType      `json:"alarm_level"`
	For             time.Duration       `json:"for"`
	Context         *simplejson.Json    `json:"context"`
	ManualReset     bool                `json:"manual_reset"`
}

type CreateAlarmMsg struct {
	Name            string              `json:"name"`
	Description     string              `json:"description"`
	AlertingMsg     string              `json:"alerting_msg"`
	OkMsg           string              `json:"ok_msg"`
	Severity        SeverityLevelType   `json:"severity"`
	PermissionLevel PermissionLevelType `json:"permission_level"`
	For             time.Duration       `json:"for_duration"`
	AlarmLevel      AlarmLevelType      `json:"alarm_level"`
	Context         *simplejson.Json    `json:"context"`
	ManualReset     bool                `json:"manual_reset"`
	Result          *AlarmRsp           `json:"-"`
}

type AlarmRsp struct {
	Id              int64               `json:"id"`
	UpdatedAt       time.Time           `json:"updated_at"`
	Name            string              `json:"name"`
	Description     string              `json:"description"`
	AlertingMsg     string              `json:"alerting_msg"`
	OkMsg           string              `json:"ok_msg"`
	Severity        SeverityLevelType   `json:"severity"`
	PermissionLevel PermissionLevelType `json:"permission_level"`
	For             time.Duration       `json:"for_duration"`
	AlarmLevel      AlarmLevelType      `json:"alarm_level"`
	Context         *simplejson.Json    `json:"context"`
	ManualReset     bool                `json:"manual_reset"`
}

type DeleteAlarmByIDMsg struct {
	Id int64 `json:"id"`
}

type UpdateAlarmMsg struct {
	Id              int64               `json:"id"`
	Name            string              `json:"name"`
	Description     string              `json:"description"`
	AlertingMsg     string              `json:"alerting_msg"`
	OkMsg           string              `json:"ok_msg"`
	Severity        SeverityLevelType   `json:"severity"`
	PermissionLevel PermissionLevelType `json:"permission_level"`
	For             time.Duration       `json:"for_duration"`
	AlarmLevel      AlarmLevelType      `json:"alarm_level"`
	Context         *simplejson.Json    `json:"context"`
	ManualReset     bool                `json:"manual_reset"`
	Enabled         bool                `json:"enabled"`
}

type GetAlarmByIDMsg struct {
	Id     int64     `json:"id"`
	Result *AlarmRsp `json:"-"`
}

type GetAlarmsBySearchQueryMsg struct {
	Query   string              `json:"query"`
	PerPage int                 `json:"perPage"`
	Page    int                 `json:"page"`
	Result  AlarmQueryResultRsp `json:"result"`
}

type AlarmQueryResultRsp struct {
	TotalCount int64       `json:"totalCount"`
	Data       []*AlarmRsp `json:"data"`
	Page       int         `json:"page"`
	PerPage    int         `json:"perPage"`
}
