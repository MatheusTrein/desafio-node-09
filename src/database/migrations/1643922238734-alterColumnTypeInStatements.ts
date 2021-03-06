import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class alterColumnTypeInStatements1643922238734
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("statements", "type");
    await queryRunner.addColumn(
      "statements",
      new TableColumn({
        name: "type",
        type: "enum",
        enum: ["deposit", "withdraw", "transfer"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
