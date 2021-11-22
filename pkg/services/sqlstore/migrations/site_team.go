package migrations

import (
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addSiteTeamMigrations(mg *Migrator) {
	siteTeam := Table{
		Name: "site_team",
		Columns: []*Column{
			{Name: "id", Type: DB_BigInt, IsPrimaryKey: true, IsAutoIncrement: true},
			{Name: "created_at", Type: DB_TimeStamp, Nullable: false},
			{Name: "updated_at", Type: DB_TimeStamp, Nullable: false},
			{Name: "deleted_at", Type: DB_TimeStamp, Nullable: true},
			{Name: "site_id", Type: DB_BigInt, Nullable: false},
			{Name: "team_id", Type: DB_BigInt, Nullable: false},
		},
		Indices: []*Index{
			{Cols: []string{"team_id"}},
			{Cols: []string{"site_id"}},
			{Cols: []string{"site_id", "team_id"}},
		},
	}

	// create table
	mg.AddMigration("create site_team table", NewAddTableMigration(siteTeam))

	// create indices
	mg.AddMigration("add index site_team team_id", NewAddIndexMigration(siteTeam, siteTeam.Indices[0]))
	mg.AddMigration("add index site_team site_id", NewAddIndexMigration(siteTeam, siteTeam.Indices[1]))
	mg.AddMigration("add index site_team site_id team_id", NewAddIndexMigration(siteTeam, siteTeam.Indices[2]))
}
