using GamesHub.Auth;
using GamesHub.Filters;
using GamesHub.Protocol.Request;
using GamesHub.Protocol.Response;
using Microsoft.AspNetCore.Mvc;

namespace GamesHub.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private static int NextGuestId = 0;
    private static Object GuestIdLock = new Object();
    private ILogger<AuthController> _logger;
    private readonly IConfiguration configuration;

    public AuthController(ILogger<AuthController> logger, IConfiguration configuration)
    {
        this._logger = logger;
        this.configuration = configuration;
        //_logger.LogInformation("AuthController loaded");
    }

    private static int GetNextGuestId()
    {
        lock(GuestIdLock)
        {
            NextGuestId++;
            return NextGuestId;
        }
    }

    [HttpGet("alive")]
    public IActionResult Alive()
    {
        return Ok($"AuthController is alive");
    }

    /*[HttpPost("login")]
    [ServiceFilter(typeof(ValidationFilterAttribute))]
    [ServiceFilter(typeof(GenericResourceFilter<LoginResponse>))]
    [ServiceFilter(typeof(HttpResponseExceptionFilter))]
    public async Task<IActionResult> Login(LoginDto userDto)
    {
        LoginResponse response = (LoginResponse) HttpContext.Items["CustomResponse"];
        User? user = await repository.GetUser(userDto.Username);
        if (user == null || !AuthHelper.VerifyPasswordHash(userDto.Password, new Password{
            PasswordHash = user.PasswordHash,
            PasswordSalt = user.PasswordSalt
        }))
        {
            throw new HttpResponseException(400, "global", "Incorrect username or password", "global_invalid_authentication");
        }
        int token_expires = 90;
        string token = AuthHelper.CreateToken(user.Username, user.UserId, token_expires);
        HttpContext.Response.Cookies.Append("gameshub_token", token, new CookieOptions
        {
            Expires = DateTimeOffset.UtcNow.AddDays(token_expires)
        });
        response.message = "Successfully login in";
        return Ok(response);
    }*/

    [HttpPost("guest-login")]
    [ServiceFilter(typeof(ValidationFilterAttribute))]
    [ServiceFilter(typeof(GenericResourceFilter<GeneralResponse>))]
    [ServiceFilter(typeof(HttpResponseExceptionFilter))]
    public IActionResult GuestLogin(LoginDto dto)
    {
        GeneralResponse response =(GeneralResponse) HttpContext.Items["CustomResponse"];
        int guestId = GetNextGuestId();
        Guid guestGuid = Guid.NewGuid();
        //string guestUsername = $"guest{(guestId < 10 ? 0 : "")}{guestId}";
        int token_expires = 1;
        string token = AuthHelper.CreateToken(dto.Username, guestGuid, token_expires);
        HttpContext.Response.Cookies.Append("gameshub_token", token);
        response.message = "Successfully logged in as guest";
        /*HttpContext.Response.Headers.Add("Location", "/Alive");
        return new StatusCodeResult(303);*/
        return Ok(response);
    }


    /*[HttpPost("register")]
    [ServiceFilter(typeof(ValidationFilterAttribute))]
    [ServiceFilter(typeof(GenericResourceFilter<LoginResponse>))]
    [ServiceFilter(typeof(HttpResponseExceptionFilter))]
    public async Task<IActionResult> Register(LoginDto userDto)
    {
        //_logger.LogDebug("User requested /register");
        LoginResponse response = (LoginResponse) HttpContext.Items["CustomResponse"];
        Password hashedPassword = AuthHelper.CreateHashedPassword(userDto.Password);
        User newUser = new User{
            UserId = Guid.NewGuid(),
            Username = userDto.Username,
            PasswordHash = hashedPassword.PasswordHash,
            PasswordSalt = hashedPassword.PasswordSalt
        };
        if (!(await repository.CreateUser(newUser)))
        {
            throw new HttpResponseException(400, "login_username", "Username already exists", "username_already_exists");
        }
        response.message = "Successfully registered";
        return StatusCode(201, response);
    }*/
}