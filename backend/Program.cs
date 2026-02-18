using backend.ExceptionHandler;
using backend.Extensions;
using DotNetEnv;

Env.Load();

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();

var secretKey = builder.Configuration["JwtSettings:Secret"];

if (string.IsNullOrEmpty(secretKey))
{
    throw new InvalidOperationException("JWT secret key is not configured.");
}
var dbUrl = Environment.GetEnvironmentVariable("DB_URL");

if (!string.IsNullOrWhiteSpace(dbUrl))
{
    builder.Configuration["ConnectionStrings:DefaultConnection"] = dbUrl;
}

builder.Services.AddAppCors();
builder.Services.AddAppControllers();
builder.Services.AddAppDbContext(builder.Configuration);
builder.Services.AddAppServices(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<GlobalExceptionHandler>();
app.UseCors(ServiceConfig.CorsPolicyName);
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();