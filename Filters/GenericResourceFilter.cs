using GamesHub.Protocol.Response;
using Microsoft.AspNetCore.Mvc.Filters;

namespace GamesHub.Filters;

public class GenericResourceFilter<T>  : IResourceFilter where T : GeneralResponse
{
    private ILogger<GenericResourceFilter<T>> _logger;
    public GenericResourceFilter(ILogger<GenericResourceFilter<T>> logger)
    {
        this._logger = logger;
    }

    public void OnResourceExecuted(ResourceExecutedContext context)
    {
    }
    public void OnResourceExecuting(ResourceExecutingContext context)
    {
        context.HttpContext.Items["CustomResponse"] = Activator.CreateInstance(typeof(T));
    }
}