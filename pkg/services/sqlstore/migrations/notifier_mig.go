package migrations

import (
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addNotifierMigrations(mg *Migrator) {
	notifier := Table{
		Name: "notifier",
		Columns: []*Column{
			{Name: "id", Type: DB_BigInt, IsPrimaryKey: true, IsAutoIncrement: true},
			{Name: "created_at", Type: DB_TimeStamp, Nullable: false},
			{Name: "updated_at", Type: DB_TimeStamp, Nullable: false},
			{Name: "deleted_at", Type: DB_TimeStamp, Nullable: true},
			{Name: "org_id", Type: DB_BigInt, Nullable: false},
			{Name: "name", Type: DB_NVarchar, Length: 255, Nullable: false},
			{Name: "type", Type: DB_NVarchar, Length: 255, Nullable: false},
			{Name: "settings", Type: DB_Text, Nullable: false},
		},
		Indices: []*Index{
			{Cols: []string{"name"}, Type: UniqueIndex},
		},
	}

	// create table
	mg.AddMigration("create notifier table", NewAddTableMigration(notifier))
	//indexes
	mg.AddMigration("add index notifier name", NewAddIndexMigration(notifier, notifier.Indices[0]))
}
