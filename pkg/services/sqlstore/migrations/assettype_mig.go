package migrations

import (
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addAssetTypeMigrations(mg *Migrator) {
	assetType := Table{
		Name: "asset_type",
		Columns: []*Column{
			{Name: "id", Type: DB_BigInt, IsPrimaryKey: true, IsAutoIncrement: true},
			{Name: "created_at", Type: DB_TimeStamp, Nullable: false},
			{Name: "updated_at", Type: DB_TimeStamp, Nullable: false},
			{Name: "deleted_at", Type: DB_TimeStamp, Nullable: true},
			{Name: "type", Type: DB_NVarchar, Length: 255, Nullable: false},
			{Name: "asset_app_configs", Type: DB_Text, Nullable: true},
			{Name: "asset_props", Type: DB_Text, Nullable: true},
			{Name: "asset_controller_configs", Type: DB_Text, Nullable: true},
		},
		Indices: []*Index{
			{Cols: []string{"type"}, Type: UniqueIndex},
		},
	}

	// create table
	mg.AddMigration("create asset_type table", NewAddTableMigration(assetType))

	// create indices
	mg.AddMigration("add index asset_type type", NewAddIndexMigration(assetType, assetType.Indices[0]))
}
