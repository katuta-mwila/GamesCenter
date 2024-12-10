using System.Text.Json;
using GamesHub.Entities;
using ResultsNet.Data;

namespace GamesHub.Repositories;

public class GameRepository : IDisposable
{
    private bool disposed = false;

    private ILogger<GameRepository> _logger;
    private GamesHubContext dbContext;

    public GameRepository(ILogger<GameRepository> logger, GamesHubContext context)
    {
        this._logger = logger;
        this.dbContext = context;
    }

    public async Task<bool> CreateHistory(GameHistory history)
    {
        //_logger.LogDebug(JsonSerializer.Serialize(history));
        await dbContext.AddAsync(history);
        await dbContext.SaveChangesAsync();
        return true;
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!this.disposed)
        {
            if (disposing)
            {
                dbContext.Dispose();
            }
        }
        this.disposed = true;
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }
}