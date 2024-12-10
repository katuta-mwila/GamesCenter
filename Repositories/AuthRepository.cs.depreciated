using System.Text.Json;
using GamesHub.Entities;
using GamesHub.Exceptions;
using GamesHub.Protocol.Response;
using Microsoft.EntityFrameworkCore;
using ResultsNet.Data;

namespace GamesHub.Repositories;

public class AuthRepository : IDisposable
{
    private ILogger<AuthRepository> _logger;
    private GamesHubContext dbContext;
    private bool disposed = false;
    public AuthRepository(ILogger<AuthRepository> logger, GamesHubContext context)
    {
        this._logger = logger;
        this.dbContext = context;
    }
    public async Task<bool> CreateUser(User user)
    {
        bool exists = await dbContext.UserExists(user.Username);
        if (exists)
        {
            return false;
        }
        await dbContext.AddAsync(user);
        await dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<User?> GetUser(string username)
    {
        User? user = await dbContext.users.FirstOrDefaultAsync(u => u.Username == username);
        return user;
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