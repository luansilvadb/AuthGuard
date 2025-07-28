using Serilog;
using AuthGuard.API;

var builder = WebApplication.CreateBuilder(args);

// Configuração do Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Host.UseSerilog();

Log.Information("🚀 Iniciando AuthGuard API...");

try
{
    // Configurar serviços usando Startup
    var startup = new Startup(builder.Configuration, builder.Environment);
    startup.ConfigureServices(builder.Services);

    var app = builder.Build();

    // Configurar pipeline usando Startup
    startup.Configure(app, app.Environment);

    Log.Information("🌐 AuthGuard API iniciada com sucesso!");
    Log.Information("📍 Ambiente: {Environment}", app.Environment.EnvironmentName);
    Log.Information("📍 API: http://localhost:5000");
    Log.Information("📚 Swagger: http://localhost:5000/swagger");

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "❌ Erro fatal durante a inicialização");
    throw;
}
finally
{
    Log.CloseAndFlush();
}
