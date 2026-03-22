using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyPills.Data.Migrations
{
    /// <inheritdoc />
    public partial class DailyConsumptionToMedicine : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DailyConsumption",
                table: "Medicines",
                type: "int",
                nullable: false,
                defaultValue: 1);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DailyConsumption",
                table: "Medicines");
        }
    }
}
