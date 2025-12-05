using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyPills.Data.Migrations
{
    /// <inheritdoc />
    public partial class StockToMedicine : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "StockDate",
                table: "Medicines",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "StockQuantity",
                table: "Medicines",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StockDate",
                table: "Medicines");

            migrationBuilder.DropColumn(
                name: "StockQuantity",
                table: "Medicines");
        }
    }
}
