using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyPills.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveProfileSharing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProfileShares");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_ShareCode",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ShareCode",
                table: "AspNetUsers");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ShareCode",
                table: "AspNetUsers",
                type: "varchar(6)",
                unicode: false,
                maxLength: 6,
                nullable: false,
                defaultValue: "",
                collation: "Latin1_General_100_BIN2");

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

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_ShareCode",
                table: "AspNetUsers",
                column: "ShareCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProfileShares_ProfileId_SharedWithUserId",
                table: "ProfileShares",
                columns: new[] { "ProfileId", "SharedWithUserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProfileShares_SharedWithUserId",
                table: "ProfileShares",
                column: "SharedWithUserId");
        }
    }
}
