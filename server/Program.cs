using SymptomixAPI.Models;
using SymptomixAPI.Services;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactNative", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Add custom services
builder.Services.AddSingleton<IDiagnosticService, DiagnosticService>();
builder.Services.AddSingleton<IUserService, UserService>();
builder.Services.AddSingleton<IDataService, JsonDataService>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowReactNative");
app.UseAuthorization();
app.MapControllers();

// Health check endpoint
app.MapGet("/api/health", () => new { Status = "Healthy", Timestamp = DateTime.UtcNow });

app.Run();
