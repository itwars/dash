package migrations

import (
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addAlarmStateMigrations(mg *Migrator) {
	alarmState := Table{
		Name: "alarm_state",
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
			{Name: "data", Type: DB_Text, Nullable: true},
			{Name: "name", Type: DB_NVarchar, Length: 255, Nullable: false},
			{Name: "state", Type: DB_NVarchar, Length: 255, Nullable: false},
			{Name: "for", Type: DB_Int, Nullable: true},
			{Name: "enabled", Type: DB_Bool, Nullable: false},
		},
		Indices: []*Index{
			{Cols: []string{"alarm_id"}},
			{Cols: []string{"org_id", "name"}},
			{Cols: []string{"site_id", "name"}},
			{Cols: []string{"asset_id", "name"}},
			{Cols: []string{"name"}},
			{Cols: []string{"org_id", "alarm_id"}},
			{Cols: []string{"site_id", "alarm_id"}},
			{Cols: []string{"asset_id", "alarm_id"}},
			{Cols: []string{"org_id", "site_id", "asset_id", "alarm_id"}},
		},
	}

	// create table
	mg.AddMigration("create alarm_state table", NewAddTableMigration(alarmState))

	// create indices
	mg.AddMigration("add index alarm_state alarm_id", NewAddIndexMigration(alarmState, alarmState.Indices[0]))
	mg.AddMigration("add index alarm_state org_id name", NewAddIndexMigration(alarmState, alarmState.Indices[1]))
	mg.AddMigration("add index alarm_state site_id name", NewAddIndexMigration(alarmState, alarmState.Indices[2]))
	mg.AddMigration("add index alarm_state asset_id name", NewAddIndexMigration(alarmState, alarmState.Indices[3]))
	mg.AddMigration("add index alarm_state name", NewAddIndexMigration(alarmState, alarmState.Indices[4]))
	mg.AddMigration("add index alarm_state org_id alarm_id", NewAddIndexMigration(alarmState, alarmState.Indices[5]))
	mg.AddMigration("add index alarm_state site_id alarm_id", NewAddIndexMigration(alarmState, alarmState.Indices[6]))
	mg.AddMigration("add index alarm_state asset_id alarm_id", NewAddIndexMigration(alarmState, alarmState.Indices[7]))
	mg.AddMigration("add index alarm_state org_id site_id asset_id alarm_id", NewAddIndexMigration(alarmState, alarmState.Indices[8]))
}
