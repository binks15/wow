using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using backend.Config;
using backend.Data;
using backend.DTO.Common;
using backend.Repositories.Common;
using backend.Repositories.Games;
using backend.Repositories.Travels;
using backend.Services.Auth;
using backend.Services.Common;
using backend.Services.Games;
using backend.Services.Travels;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Extensions;

public static class ServiceConfig
{
    public const string CorsPolicyName = "_myAllowSpecificOrigins";

    public static IServiceCollection AddAppCors(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy(name: CorsPolicyName,
                policy =>
                {
                    policy.WithOrigins("http://localhost:5173")
                          .AllowAnyHeader()
                          .AllowAnyMethod().AllowCredentials();
                });
        });

        return services;
    }

    public static IServiceCollection AddAppControllers(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();
        services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
            })
            .ConfigureApiBehaviorOptions(setupAction =>
            {
                setupAction.InvalidModelStateResponseFactory = context =>
                {
                    var errors = context.ModelState
                        .Where(entry => entry.Value?.Errors.Count > 0)
                        .ToDictionary(
                            entry => entry.Key,
                            entry => entry.Value!.Errors.Select(err => err.ErrorMessage).ToArray()
                        );

                    var payload = new ApiResponse<object>
                    {
                        Success = false,
                        Code = StatusCodes.Status400BadRequest,
                        Error = "Validation failed.",
                        Data = errors
                    };

                    return new BadRequestObjectResult(payload);
                };
            });

        return services;
    }

    public static IServiceCollection AddAppDbContext(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        return services;
    }

    public static IServiceCollection AddAppServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtSettings>(configuration.GetSection("JwtSettings"));
        services.Configure<CloudinarySettings>(configuration.GetSection("Cloudinary"));
        services.Configure<EmailSettings>(configuration.GetSection("EmailSettings"));

        services.AddHttpClient();

       services.AddScoped<PasswordHasher>();
        services.AddScoped<TokenService>();
        services.AddScoped<TravelService>();
        services.AddScoped<RoleService>();
        services.AddScoped<AuthService>();
        services.AddScoped<UserService>();
        services.AddScoped<CloudinaryService>();
        services.AddScoped<TravelDocumentService>();
        services.AddScoped<ITravelRepository, TravelRepository>();
        services.AddScoped<ITravelDocumentRepository, TravelDocumentRepository>();
        services.AddScoped<IExpenseRepository, ExpenseRepository>();
        services.AddScoped<IExpenseProofRepository, ExpenseProofRepository>();
        services.AddScoped<ExpenseService>();
        services.AddScoped<IExpenseCategoryRepository, ExpenseCategoryRepository>();
        services.AddScoped<ExpenseCategoryService>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IAuthRepository, AuthRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IManagerRepository, ManagerRepository>();
        services.AddScoped<ManagerService>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<NotificationService>();
        services.AddScoped<EmailService>();
        services.AddScoped<IGameSlotRepository, GameSlotRepository>();
        services.AddScoped<IGameRequestRepository, GameRequestRepository>();
        services.AddScoped<IGameBookingRepository, GameBookingRepository>();
        services.AddScoped<IGameAllocationRepository, GameAllocationRepository>();
        services.AddScoped<GameSlotService>();
        services.AddScoped<GameRequestService>();
        services.AddScoped<GameBookingService>();
        services.AddScoped< GameAllocationService>();
        services.AddHostedService<GameSlotBackgroundService>();
        services.AddScoped<IGameRepository, GameRepository>();
        services.AddScoped<GameService>();

        return services;
    }

    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                var jwtSettings = configuration.GetSection("JwtSettings").Get<JwtSettings>() ?? new JwtSettings();
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateIssuerSigningKey = true,
                    ValidateLifetime = true,
                    ValidIssuer = jwtSettings.Issuer,
                    ValidAudience = jwtSettings.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
                    ClockSkew = TimeSpan.FromMinutes(3)
                };

                options.Events = new JwtBearerEvents
                {
                    OnAuthenticationFailed = context =>
                    {
                        if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                        {
                            context.Response.Headers.Append("Token-Expired", "true");
                        }
                        return Task.CompletedTask;
                    },
                    OnChallenge = async context =>
                    {
                        context.HandleResponse();
                        context.Response.StatusCode = 401;
                        context.Response.ContentType = "application/json";

                        var result = JsonSerializer.Serialize(new ApiResponse<object>
                        {
                            Success = false,
                            Code = StatusCodes.Status401Unauthorized,
                            Error = "You are not authorized to access this resource. Please provide a valid token."
                        });

                        await context.Response.WriteAsync(result);
                    },
                    OnForbidden = async context =>
                    {
                        context.Response.StatusCode = 403;
                        context.Response.ContentType = "application/json";

                        var result = JsonSerializer.Serialize(new ApiResponse<object>
                        {
                            Success = false,
                            Code = StatusCodes.Status403Forbidden,
                            Error = "You do not have permission to perform this action."
                        });

                        await context.Response.WriteAsync(result);
                    }
                };
            });

        services.AddAuthorization();
        return services;
    }
}