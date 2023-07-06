using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GamesHub.Migrations
{
    /// <inheritdoc />
    public partial class UpdateGameHistory_AddGameId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GameId",
                table: "gameHistory",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GameId",
                table: "gameHistory");
        }
    }
}
