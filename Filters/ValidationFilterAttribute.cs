using System.Text.Json;
using GamesHub.Protocol;
using GamesHub.Protocol.Request;
using GamesHub.Protocol.Response;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace GamesHub.Filters;

public class ValidationFilterAttribute : IActionFilter
{
    private ILogger<ValidationFilterAttribute> _logger;
    public ValidationFilterAttribute(ILogger<ValidationFilterAttribute> logger)
    {
        this._logger = logger;
    }
    public void OnActionExecuting(ActionExecutingContext context)
    {
        GeneralResponse response = (GeneralResponse) context.HttpContext.Items["CustomResponse"];
        foreach (var kvp in context.ActionArguments)
        {
            if (kvp.Value is GeneralDto dto)
            {
                ErrorCollection collection = dto.GetClientErrors();
                if (collection.hasErrors())
                {
                    response.ErrorCollection.Merge(collection); // slow
                    context.Result = new UnprocessableEntityObjectResult(response);
                }
            }
        }
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
    }
}