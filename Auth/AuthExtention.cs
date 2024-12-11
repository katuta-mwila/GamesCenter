using GamesHub.MiddleWare;

namespace GamesHub.Auth;

/* ---- DEPRECIATED ---- */
public static class AuthExtention
{
    public static IApplicationBuilder UseCustomAuthorization(this IApplicationBuilder builder)
    {
        builder.UseWhen(context => true, appBuilder =>
        {
            appBuilder.UseMiddleware<AuthorizationWare>();
        }); // autha = has account token, authb = has account or guest token
        builder.UseWhen(context => context.Request.Path.StartsWithSegments("/api/game/autha"), appBuilder =>{
            appBuilder.UseMiddleware<AuthorizationShortCircuit>(new object[]{false});
        });
        builder.UseWhen(context => context.Request.Path.StartsWithSegments("/api/game/authb"), appBuilder =>{
            appBuilder.UseMiddleware<AuthorizationShortCircuit>(new object[]{true});
        });
        builder.UseWhen(context => context.Request.Path.StartsWithSegments("/ws"), appBuilder =>{
            appBuilder.UseMiddleware<AuthorizationShortCircuit>(new object[]{true});
        });
        return builder;
    }
}