using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyPills.Data.Migrations
{
    /// <inheritdoc />
    public partial class ProfilesAndSharing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ProfileId",
                table: "StockEntries",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ProfileId",
                table: "Prescriptions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ProfileId",
                table: "Medicines",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShareCode",
                table: "AspNetUsers",
                type: "varchar(6)",
                unicode: false,
                maxLength: 6,
                nullable: true,
                collation: "Latin1_General_100_BIN2");

            migrationBuilder.CreateTable(
                name: "Profiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    OwnerId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Profiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Profiles_AspNetUsers_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProfileShares",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SharedWithUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Permission = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfileShares", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProfileShares_AspNetUsers_SharedWithUserId",
                        column: x => x.SharedWithUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProfileShares_Profiles_ProfileId",
                        column: x => x.ProfileId,
                        principalTable: "Profiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.Sql("""
                INSERT INTO Profiles (Id, Name, IsDefault, OwnerId)
                SELECT NEWID(), 'Default Profile', CAST(1 AS bit), users.Id
                FROM AspNetUsers users
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM Profiles profiles
                    WHERE profiles.OwnerId = users.Id
                      AND profiles.IsDefault = 1
                );
                """);

            migrationBuilder.Sql("""
                ;WITH NumberedUsers AS (
                    SELECT
                        Id,
                        RIGHT('000000' + CAST(ROW_NUMBER() OVER (ORDER BY Id) AS varchar(6)), 6) AS GeneratedShareCode
                    FROM AspNetUsers
                )
                UPDATE users
                SET ShareCode = numbered.GeneratedShareCode
                FROM AspNetUsers users
                INNER JOIN NumberedUsers numbered ON numbered.Id = users.Id
                WHERE users.ShareCode IS NULL OR users.ShareCode = '';
                """);

            migrationBuilder.Sql("""
                UPDATE medicines
                SET ProfileId = profiles.Id
                FROM Medicines medicines
                INNER JOIN Profiles profiles ON profiles.OwnerId = medicines.UserId AND profiles.IsDefault = 1;
                """);

            migrationBuilder.Sql("""
                UPDATE prescriptions
                SET ProfileId = profiles.Id
                FROM Prescriptions prescriptions
                INNER JOIN Profiles profiles ON profiles.OwnerId = prescriptions.UserId AND profiles.IsDefault = 1;
                """);

            migrationBuilder.Sql("""
                UPDATE stockEntries
                SET ProfileId = profiles.Id
                FROM StockEntries stockEntries
                INNER JOIN Profiles profiles ON profiles.OwnerId = stockEntries.UserId AND profiles.IsDefault = 1;
                """);

            migrationBuilder.AlterColumn<Guid>(
                name: "ProfileId",
                table: "StockEntries",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "ProfileId",
                table: "Prescriptions",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "ProfileId",
                table: "Medicines",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ShareCode",
                table: "AspNetUsers",
                type: "varchar(6)",
                unicode: false,
                maxLength: 6,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(6)",
                oldUnicode: false,
                oldMaxLength: 6,
                oldNullable: true,
                oldCollation: "Latin1_General_100_BIN2",
                collation: "Latin1_General_100_BIN2");

            migrationBuilder.CreateIndex(
                name: "IX_StockEntries_ProfileId",
                table: "StockEntries",
                column: "ProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Prescriptions_ProfileId",
                table: "Prescriptions",
                column: "ProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Medicines_ProfileId",
                table: "Medicines",
                column: "ProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_ShareCode",
                table: "AspNetUsers",
                column: "ShareCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Profiles_OwnerId_IsDefault",
                table: "Profiles",
                columns: new[] { "OwnerId", "IsDefault" },
                unique: true,
                filter: "[IsDefault] = 1");

            migrationBuilder.CreateIndex(
                name: "IX_ProfileShares_ProfileId_SharedWithUserId",
                table: "ProfileShares",
                columns: new[] { "ProfileId", "SharedWithUserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProfileShares_SharedWithUserId",
                table: "ProfileShares",
                column: "SharedWithUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Medicines_Profiles_ProfileId",
                table: "Medicines",
                column: "ProfileId",
                principalTable: "Profiles",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Prescriptions_Profiles_ProfileId",
                table: "Prescriptions",
                column: "ProfileId",
                principalTable: "Profiles",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_StockEntries_Profiles_ProfileId",
                table: "StockEntries",
                column: "ProfileId",
                principalTable: "Profiles",
                principalColumn: "Id");

            migrationBuilder.DropForeignKey(
                name: "FK_Medicines_AspNetUsers_UserId",
                table: "Medicines");

            migrationBuilder.DropForeignKey(
                name: "FK_Prescriptions_AspNetUsers_UserId",
                table: "Prescriptions");

            migrationBuilder.DropForeignKey(
                name: "FK_StockEntries_AspNetUsers_UserId",
                table: "StockEntries");

            migrationBuilder.DropIndex(
                name: "IX_StockEntries_UserId",
                table: "StockEntries");

            migrationBuilder.DropIndex(
                name: "IX_Prescriptions_UserId",
                table: "Prescriptions");

            migrationBuilder.DropIndex(
                name: "IX_Medicines_UserId",
                table: "Medicines");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "StockEntries");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Prescriptions");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Medicines");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "StockEntries",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "Prescriptions",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "Medicines",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE medicines
                SET UserId = profiles.OwnerId
                FROM Medicines medicines
                INNER JOIN Profiles profiles ON profiles.Id = medicines.ProfileId;
                """);

            migrationBuilder.Sql("""
                UPDATE prescriptions
                SET UserId = profiles.OwnerId
                FROM Prescriptions prescriptions
                INNER JOIN Profiles profiles ON profiles.Id = prescriptions.ProfileId;
                """);

            migrationBuilder.Sql("""
                UPDATE stockEntries
                SET UserId = profiles.OwnerId
                FROM StockEntries stockEntries
                INNER JOIN Profiles profiles ON profiles.Id = stockEntries.ProfileId;
                """);

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "StockEntries",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "Prescriptions",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "Medicines",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.DropForeignKey(
                name: "FK_Medicines_Profiles_ProfileId",
                table: "Medicines");

            migrationBuilder.DropForeignKey(
                name: "FK_Prescriptions_Profiles_ProfileId",
                table: "Prescriptions");

            migrationBuilder.DropForeignKey(
                name: "FK_StockEntries_Profiles_ProfileId",
                table: "StockEntries");

            migrationBuilder.DropTable(
                name: "ProfileShares");

            migrationBuilder.DropTable(
                name: "Profiles");

            migrationBuilder.DropIndex(
                name: "IX_StockEntries_ProfileId",
                table: "StockEntries");

            migrationBuilder.DropIndex(
                name: "IX_Prescriptions_ProfileId",
                table: "Prescriptions");

            migrationBuilder.DropIndex(
                name: "IX_Medicines_ProfileId",
                table: "Medicines");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_ShareCode",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ProfileId",
                table: "StockEntries");

            migrationBuilder.DropColumn(
                name: "ProfileId",
                table: "Prescriptions");

            migrationBuilder.DropColumn(
                name: "ProfileId",
                table: "Medicines");

            migrationBuilder.DropColumn(
                name: "ShareCode",
                table: "AspNetUsers");

            migrationBuilder.CreateIndex(
                name: "IX_StockEntries_UserId",
                table: "StockEntries",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Prescriptions_UserId",
                table: "Prescriptions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Medicines_UserId",
                table: "Medicines",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Medicines_AspNetUsers_UserId",
                table: "Medicines",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Prescriptions_AspNetUsers_UserId",
                table: "Prescriptions",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StockEntries_AspNetUsers_UserId",
                table: "StockEntries",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
