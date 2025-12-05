using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyPills.Data.Migrations
{
    /// <inheritdoc />
    public partial class UserToEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "StockEntries",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "Medicines",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
            
            /*
            migrationBuilder.Sql("UPDATE StockEntries SET UserId = (SELECT Id FROM AspNetUsers LIMIT 1)");
            migrationBuilder.Sql("UPDATE Medicines SET UserId = (SELECT Id FROM AspNetUsers LIMIT 1)");
            */

            migrationBuilder.CreateIndex(
                name: "IX_StockEntries_UserId",
                table: "StockEntries",
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
                name: "FK_StockEntries_AspNetUsers_UserId",
                table: "StockEntries",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Medicines_AspNetUsers_UserId",
                table: "Medicines");

            migrationBuilder.DropForeignKey(
                name: "FK_StockEntries_AspNetUsers_UserId",
                table: "StockEntries");

            migrationBuilder.DropIndex(
                name: "IX_StockEntries_UserId",
                table: "StockEntries");

            migrationBuilder.DropIndex(
                name: "IX_Medicines_UserId",
                table: "Medicines");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "StockEntries");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Medicines");
        }
    }
}
