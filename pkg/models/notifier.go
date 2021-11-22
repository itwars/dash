package models

import (
	"errors"
	"time"

	"github.com/grafana/grafana/pkg/components/simplejson"
)

var (
	ErrNotifierNotFound = errors.New("notifier not found")
)

type NotifierPlugin struct {
	Type            string `json:"type"`
	Name            string `json:"name"`
	Description     string `json:"description"`
	OptionsTemplate string `json:"optionsTemplate"`
}

type GetNotifierTypesMsg struct {
	Result []*NotifierPlugin `json:"-"`
}

type Notifier struct {
	Id        int64            `json:"id"`
	CreatedAt time.Time        `json:"created_at"`
	UpdatedAt time.Time        `json:"updated_at"`
	DeletedAt *time.Time       `json:"deleted_at"`
	Name      string           `json:"name"`
	OrgId     int64            `json:"org_id"`
	Type      string           `json:"type"`
	Settings  *simplejson.Json `json:"settings"`
}

type CreateNotifierMsg struct {
	Name     string           `json:"name"`
	OrgId    int64            `json:"org_id"`
	Type     string           `json:"type"`
	Settings *simplejson.Json `json:"settings"`
	Result   *NotifierRsp     `json:"-"`
}

type NotifierRsp struct {
	Id        int64            `json:"id"`
	UpdatedAt time.Time        `json:"updated_at"`
	Name      string           `json:"name"`
	OrgId     int64            `json:"org_id"`
	Type      string           `json:"type"`
	Settings  *simplejson.Json `json:"settings"`
}

type TestNotifierMsg struct {
	UserId    int64            `json:"user_id"`
	UserEmail string           `json:"user_email"`
	UserPhone string           `json:"user_phone"`
	Name      string           `json:"name"`
	Type      string           `json:"type"`
	Settings  *simplejson.Json `json:"settings"`
}

type UpdateNotifierMsg struct {
	Id       int64            `json:"id"`
	Name     string           `json:"name"`
	OrgId    int64            `json:"org_id"`
	Type     string           `json:"type"`
	Settings *simplejson.Json `json:"settings"`
}

type GetNotifierMsg struct {
	Id     int64        `json:"id"`
	Result *NotifierRsp `json:"-"`
}

type DeleteNotifierMsg struct {
	Id int64 `json:"id"`
}

type GetNotifiersMsg struct {
	Query   string       `json:"query"`
	PerPage int          `json:"perPage"`
	Page    int          `json:"page"`
	Result  NotifiersRsp `json:"result"`
}

type NotifiersRsp struct {
	TotalCount int64          `json:"totalCount"`
	Data       []*NotifierRsp `json:"data"`
	Page       int            `json:"page"`
	PerPage    int            `json:"perPage"`
}
