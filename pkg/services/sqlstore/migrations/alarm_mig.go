package migrations

import (
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addAlarmMigrations(mg *Migrator) {
	alarm := Table{
		Name: "alarm",
		Columns: []*Column{
			{Name: "id", Type: DB_BigInt, IsPrimaryKey: true, IsAutoIncrement: true},
			{Name: "created_at", Type: DB_TimeStamp, Nullable: false},
			{Name: "updated_at", Type: DB_TimeStamp, Nullable: false},
			{Name: "deleted_at", Type: DB_TimeStamp, Nullable: true},
			{Name: "name", Type: DB_NVarchar, Length: 255, Nullable: false},
			{Name: "description", Type: DB_Text, Nullable: true},
			{Name: "alerting_msg", Type: DB_NVarchar, Length: 255, Nullable: false},
			{Name: "ok_msg", Type: DB_NVarchar, Length: 255, Nullable: true},
			{Name: "severity", Type: DB_Int, Nullable: false},
			{Name: "permission_level", Type: DB_Int, Nullable: false},
			{Name: "alarm_level", Type: DB_Int, Nullable: false},
			{Name: "for", Type: DB_Int, Nullable: true},
			{Name: "context", Type: DB_Text, Nullable: true},
			{Name: "manual_reset", Type: DB_Bool, Nullable: true},
		},
		Indices: []*Index{
			{Cols: []string{"name"}, Type: UniqueIndex},
		},
	}

	// create table
	mg.AddMigration("create alarm table", NewAddTableMigration(alarm))

	// create indices
	mg.AddMigration("add index alarm name", NewAddIndexMigration(alarm, alarm.Indices[0]))
}
