package migrations

import (
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addSiteMigrations(mg *Migrator) {
	site := Table{
		Name: "site",
		Columns: []*Column{
			{Name: "id", Type: DB_BigInt, IsPrimaryKey: true, IsAutoIncrement: true},
			{Name: "created_at", Type: DB_TimeStamp, Nullable: false},
			{Name: "updated_at", Type: DB_TimeStamp, Nullable: false},
			{Name: "deleted_at", Type: DB_TimeStamp, Nullable: true},
			{Name: "org_id", Type: DB_BigInt, Nullable: false},
			{Name: "name", Type: DB_NVarchar, Length: 255, Nullable: false},
			{Name: "type", Type: DB_NVarchar, Length: 255, Nullable: false},
			{Name: "description", Type: DB_Text, Nullable: true},
			{Name: "site_app_configs", Type: DB_Text, Nullable: true},
			{Name: "site_props", Type: DB_Text, Nullable: true},
		},
		Indices: []*Index{
			{Cols: []string{"org_id"}},
			{Cols: []string{"org_id", "name"}, Type: UniqueIndex},
			{Cols: []string{"type"}},
		},
	}

	// create table
	mg.AddMigration("create site table", NewAddTableMigration(site))

	// create indices
	mg.AddMigration("add index site org_id", NewAddIndexMigration(site, site.Indices[0]))
	mg.AddMigration("add unique_index site org_id name", NewAddIndexMigration(site, site.Indices[1]))
	mg.AddMigration("add index site type", NewAddIndexMigration(site, site.Indices[2]))

	//add siteserial
	mg.AddMigration("Add column serial to site table", NewAddColumnMigration(site, &Column{
		Name: "serial", Type: DB_NVarchar, Length: 255, Nullable: true,
	}))
}
