package migrations

import (
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addNotificationPreferenceMigrations(mg *Migrator) {
	notifier := Table{
		Name: "notification_preference",
		Columns: []*Column{
			{Name: "id", Type: DB_BigInt, IsPrimaryKey: true, IsAutoIncrement: true},
			{Name: "created_at", Type: DB_TimeStamp, Nullable: false},
			{Name: "updated_at", Type: DB_TimeStamp, Nullable: false},
			{Name: "deleted_at", Type: DB_TimeStamp, Nullable: true},
			{Name: "user_id", Type: DB_BigInt, Nullable: false},
			{Name: "notifier_id", Type: DB_BigInt, Nullable: false},
			{Name: "feature", Type: DB_NVarchar, Length: 255, Nullable: false},
			{Name: "enabled", Type: DB_Bool, Nullable: false, Default: "0"},
		},
		Indices: []*Index{
			{Cols: []string{"user_id"}},
			{Cols: []string{"user_id", "notifier_id"}},
			{Cols: []string{"user_id", "feature"}},
		},
	}

	// create table
	mg.AddMigration("create notification_preference table", NewAddTableMigration(notifier))
	//indexes
	mg.AddMigration("add index notification_preference user_id", NewAddIndexMigration(notifier, notifier.Indices[0]))
	mg.AddMigration("add index notification_preference user_id notifier_id", NewAddIndexMigration(notifier, notifier.Indices[1]))
	mg.AddMigration("add index notification_preference user_id  feature", NewAddIndexMigration(notifier, notifier.Indices[2]))
}
