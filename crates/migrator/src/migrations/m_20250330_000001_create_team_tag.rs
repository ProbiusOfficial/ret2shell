use sea_orm_migration::prelude::*;

use super::m_20240104_000003_create_team::Team;

pub struct Migration;

impl MigrationName for Migration {
  fn name(&self) -> &str {
    "m_20250330_000001_create_team_tag"
  }
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .alter_table(
        Table::alter()
          .table(Team::Table)
          .add_column_if_not_exists(ColumnDef::new(Team::Tag).string_len(63))
          .to_owned(),
      )
      .await?;
    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .alter_table(
        Table::alter()
          .table(Team::Table)
          .drop_column(Team::Tag)
          .to_owned(),
      )
      .await?;
    Ok(())
  }
}
