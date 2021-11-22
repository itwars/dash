package models

import (
	"errors"
	"time"
)

var (
	ErrSiteTeamNotFound = errors.New("site team not found")
	ErrAccessForbidden  = errors.New("access is forbidden")
)

type SiteTeam struct {
	Id        int64      `json:"id"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at"`
	SiteId    int64      `json:"site_id"`
	TeamId    int64      `json:"team_id"`
}

type AddSiteTeamMsg struct {
	SiteId int64 `json:"site_id"`
	TeamId int64 `json:"team_id"`
}

type DeleteSiteTeamMsg struct {
	Id              int64               `json:"id"`
	OrgId           int64               `json:"org_id"`
	UserId          int64               `json:"user_id"`
	PermissionLevel PermissionLevelType `json:"permission_level"`
}

type SiteAccessMsg struct {
	OrgId           int64               `json:"org_id"`
	UserId          int64               `json:"user_id"`
	SiteId          int64               `json:"site_id"`
	PermissionLevel PermissionLevelType `json:"permission_level"`
	Result          bool                `json:"result"`
}

type TeamAccessMsg struct {
	OrgId           int64               `json:"org_id"`
	UserId          int64               `json:"user_id"`
	TeamId          int64               `json:"team_id"`
	PermissionLevel PermissionLevelType `json:"permission_level"`
	Result          bool                `json:"result"`
}

type SiteTeamRsp struct {
	Id          int64     `json:"id"`
	UpdatedAt   time.Time `json:"updated_at"`
	SiteId      int64     `json:"site_id"`
	TeamId      int64     `json:"team_id"`
	TeamName    string    `json:"team_name"`
	AvatarUrl   string    `json:"avatarUrl"`
	MemberCount int64     `json:"memberCount"`
	Email       string    `json:"email"`
}

type GetSiteTeamsBySearchQueryMsg struct {
	UserId          int64                   `json:"user_id"`
	SiteId          int64                   `json:"site_id"`
	PermissionLevel PermissionLevelType     `json:"permission_level"`
	Query           string                  `json:"query"`
	Page            int                     `json:"page"`
	PerPage         int                     `json:"perPage"`
	Result          SiteTeamsQueryResultRsp `json:"result"`
}

type SiteTeamsQueryResultRsp struct {
	TotalCount int64          `json:"totalCount"`
	Data       []*SiteTeamRsp `json:"data"`
	Page       int            `json:"page"`
	PerPage    int            `json:"perPage"`
}
