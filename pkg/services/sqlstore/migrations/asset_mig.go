package migrations

import (
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addAssetMigrations(mg *Migrator) {
	asset := Table{
		Name: "asset",
		Columns: []*Column{
			{Name: "id", Type: DB_BigInt, IsPrimaryKey: true, IsAutoIncrement: true},
			{Name: "created_at", Type: DB_TimeStamp, Nullable: false},
			{Name: "updated_at", Type: DB_TimeStamp, Nullable: false},
			{Name: "deleted_at", Type: DB_TimeStamp, Nullable: true},
			{Name: "org_id", Type: DB_BigInt, Nullable: false},
			{Name: "site_id", Type: DB_BigInt, Nullable: false},
			{Name: "serial", Type: DB_NVarchar, Length: 255, Nullable: false},
			{Name: "name", Type: DB_NVarchar, Length: 255, Nullable: false},
			{Name: "type", Type: DB_NVarchar, Length: 255, Nullable: false},
			{Name: "description", Type: DB_Text, Nullable: true},
			{Name: "asset_controller_configs", Type: DB_Text, Nullable: true},
			{Name: "asset_app_configs", Type: DB_Text, Nullable: true},
			{Name: "asset_props", Type: DB_Text, Nullable: true},
		},
		Indices: []*Index{
			{Cols: []string{"org_id"}},
			{Cols: []string{"serial"}, Type: UniqueIndex},
			{Cols: []string{"site_id", "name"}, Type: UniqueIndex},
			{Cols: []string{"type"}},
		},
	}

	// create table
	mg.AddMigration("create asset table", NewAddTableMigration(asset))

	// create indices
	mg.AddMigration("add index asset org_id", NewAddIndexMigration(asset, asset.Indices[0]))
	mg.AddMigration("add index asset serial", NewAddIndexMigration(asset, asset.Indices[1]))
	mg.AddMigration("add index asset site_id  name", NewAddIndexMigration(asset, asset.Indices[2]))
	mg.AddMigration("add index asset type", NewAddIndexMigration(asset, asset.Indices[3]))
}
