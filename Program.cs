using GamesHub.Filters;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>{
        if (builder.Environment.IsDevelopment())
        {
            policy.AllowAnyHeader().AllowAnyMethod().AllowCredentials().WithOrigins(new string[]{"http://localhost:44479"});
        }
        else
        {
            policy.AllowAnyHeader().AllowAnyMethod().AllowCredentials(); //<--- Productions
        }
    });
});


builder.Services.AddControllersWithViews(option =>{ // adds api controller
    option.SuppressAsyncSuffixInActionNames = false;
});

/*builder.Services.AddSingleton<GameServer>();*/

builder.Services.AddScoped<ValidationFilterAttribute>();
builder.Services.AddScoped(typeof(GenericResourceFilter<>));
builder.Services.AddScoped<HttpResponseExceptionFilter>();

var app = builder.Build();
/*app.Services.GetService<GameServer>();*/

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
    app.UseExceptionHandler("/error");
} else
{
    app.UseExceptionHandler("/error-development");
}

if (Environment.GetEnvironmentVariable("ASPNETCORE_USEHTTPSREDIRECTION") == "1")
    app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseCors();

app.UseWebSockets(new WebSocketOptions()
{
    KeepAliveInterval = TimeSpan.FromSeconds(30),
});

/* ---- DEPRECIATED ---- */
//app.UseCustomAuthorization();

/* ---- NEEDS CHANGES ---- */
//app.UseMiddleware<RedirectWare>();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html");

//AuthHelper.configuration = app.Configuration;

app.Run();
