using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LibraryProject.Server.Migrations
{
    /// <inheritdoc />
    public partial class mig_8 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Count",
                table: "Book");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Count",
                table: "Book",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
