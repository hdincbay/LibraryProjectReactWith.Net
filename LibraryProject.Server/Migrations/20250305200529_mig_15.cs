using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LibraryProject.Server.Migrations
{
    /// <inheritdoc />
    public partial class mig_15 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsSlaExceeded",
                table: "Book",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<long>(
                name: "SLAExpiryUnixTime",
                table: "Book",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsSlaExceeded",
                table: "Book");

            migrationBuilder.DropColumn(
                name: "SLAExpiryUnixTime",
                table: "Book");
        }
    }
}
