using GamesHub.Exceptions;
using GamesHub.Protocol.Response;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace GamesHub.Filters;

public class HttpResponseExceptionFilter : IActionFilter, IOrderedFilter
{
    private ILogger<HttpResponseExceptionFilter> _logger;
    public HttpResponseExceptionFilter(ILogger<HttpResponseExceptionFilter> logger)
    {
        this._logger = logger;
    }
    public int Order => int.MaxValue - 10;
    public void OnActionExecuted(ActionExecutedContext context)
    {
        
        if (context.Exception == null) return;
        int code = 500;
        if (context.Exception is HttpResponseException exception)
        {
            code = exception.StatusCode;
            if (exception.errorCollection != null)
            {
                ((GeneralResponse) context.HttpContext.Items["CustomResponse"]).ErrorCollection.AddError(exception.errorCollection, exception.message, exception.code);
            }
        } else
        {
            _logger.LogCritical(context.Exception.StackTrace);
            _logger.LogDebug(context.Exception.Message);
            //throw context.Exception;
            ((GeneralResponse) context.HttpContext.Items["CustomResponse"]).ErrorCollection.AddError("global", "An unexpected error has occured", "global_error_unkown");
        }
        context.Result = new ObjectResult(context.HttpContext.Items["CustomResponse"])
        {
            StatusCode = code,
        };  
        context.ExceptionHandled = true;
    }

    public void OnActionExecuting(ActionExecutingContext context)
    {

    }
}