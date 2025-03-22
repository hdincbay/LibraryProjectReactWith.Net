using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LibraryProject.Server.Migrations
{
    /// <inheritdoc />
    public partial class mig_16 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Book_AspNetUsers_UserId",
                table: "Book");

            migrationBuilder.DropIndex(
                name: "IX_Book_UserId",
                table: "Book");

            migrationBuilder.AddColumn<int>(
                name: "LenderId",
                table: "Book",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Book_LenderId",
                table: "Book",
                column: "LenderId");

            migrationBuilder.AddForeignKey(
                name: "FK_Book_AspNetUsers_LenderId",
                table: "Book",
                column: "LenderId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Book_AspNetUsers_LenderId",
                table: "Book");

            migrationBuilder.DropIndex(
                name: "IX_Book_LenderId",
                table: "Book");

            migrationBuilder.DropColumn(
                name: "LenderId",
                table: "Book");

            migrationBuilder.CreateIndex(
                name: "IX_Book_UserId",
                table: "Book",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Book_AspNetUsers_UserId",
                table: "Book",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }
    }
}
