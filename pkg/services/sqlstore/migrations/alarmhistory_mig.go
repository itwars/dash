package migrations

import (
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addAlarmHistoryMigrations(mg *Migrator) {
	alarmHistory := Table{
		Name: "alarm_history",
		Columns: []*Column{
			{Name: "id", Type: DB_BigInt, IsPrimaryKey: true, IsAutoIncrement: true},
			{Name: "created_at", Type: DB_TimeStamp, Nullable: false},
			{Name: "updated_at", Type: DB_TimeStamp, Nullable: false},
			{Name: "deleted_at", Type: DB_TimeStamp, Nullable: true},
			{Name: "alarm_id", Type: DB_BigInt, Nullable: false},
			{Name: "org_id", Type: DB_BigInt, Nullable: false},
			{Name: "site_id", Type: DB_BigInt, Nullable: true},
			{Name: "asset_id", Type: DB_BigInt, Nullable: true},
			{Name: "context", Type: DB_Text, Nullable: true},
			{Name: "state", Type: DB_NVarchar, Length: 255, Nullable: false},
		},
		Indices: []*Index{},
	}

	// create table
	mg.AddMigration("create alarm_history table", NewAddTableMigration(alarmHistory))

}
