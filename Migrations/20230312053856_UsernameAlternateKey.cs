using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GamesHub.Migrations
{
    /// <inheritdoc />
    public partial class UsernameAlternateKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddUniqueConstraint(
                name: "AK_users_Username",
                table: "users",
                column: "Username");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropUniqueConstraint(
                name: "AK_users_Username",
                table: "users");
        }
    }
}
