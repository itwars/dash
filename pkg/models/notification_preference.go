package models

import (
	"errors"
	"time"
)

var (
	ErrNotificationPreferenceNotFound = errors.New("preference not found")
)

type NotificationPreference struct {
	Id         int64      `json:"id"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
	DeletedAt  *time.Time `json:"deleted_at"`
	NotifierId int64      `json:"notifier_id"`
	UserId     int64      `json:"user_id"`
	Feature    string     `json:"feature"`
	Enabled    bool       `json:"enabled"`
}

type CreateOrUpdateNotificationPreferenceMsg struct {
	NotifierId int64  `json:"notifier_id"`
	UserId     int64  `json:"user_id"`
	Feature    string `json:"feature"`
	Enabled    bool   `json:"enabled"`
}

type NotificationPreferenceRsp struct {
	Id         int64     `json:"id"`
	UpdatedAt  time.Time `json:"updated_at"`
	NotifierId int64     `json:"notifier_id"`
	Name       string    `json:"name"`
	Feature    string    `json:"feature"`
	Enabled    bool      `json:"enabled"`
}

type GetNotificationPreferencesMsg struct {
	NotifierId int64                      `json:"notifier_id"`
	UserId     int64                      `json:"user_id"`
	Feature    string                     `json:"feature"`
	PerPage    int                        `json:"perPage"`
	Page       int                        `json:"page"`
	Result     NotificationPreferencesRsp `json:"result"`
}

type NotificationPreferencesRsp struct {
	TotalCount int64                        `json:"totalCount"`
	Data       []*NotificationPreferenceRsp `json:"data"`
	Page       int                          `json:"page"`
	PerPage    int                          `json:"perPage"`
}
