package migrations

import (
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addSiteTypeMigrations(mg *Migrator) {
	siteType := Table{
		Name: "site_type",
		Columns: []*Column{
			{Name: "id", Type: DB_BigInt, IsPrimaryKey: true, IsAutoIncrement: true},
			{Name: "created_at", Type: DB_TimeStamp, Nullable: false},
			{Name: "updated_at", Type: DB_TimeStamp, Nullable: false},
			{Name: "deleted_at", Type: DB_TimeStamp, Nullable: true},
			{Name: "type", Type: DB_NVarchar, Length: 255, Nullable: true},
			{Name: "site_app_configs", Type: DB_Text, Nullable: true},
			{Name: "site_props", Type: DB_Text, Nullable: true},
		},
		Indices: []*Index{
			{Cols: []string{"type"}, Type: UniqueIndex},
		},
	}

	// create table
	mg.AddMigration("create site_type table", NewAddTableMigration(siteType))

	// create indices
	mg.AddMigration("add index site_type type", NewAddIndexMigration(siteType, siteType.Indices[0]))
}
