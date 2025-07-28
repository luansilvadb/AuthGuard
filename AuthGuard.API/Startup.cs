using AuthGuard.API.Extensions;
using Serilog;

namespace AuthGuard.API;

public class Startup
{
    public IConfiguration Configuration { get; }
    public IWebHostEnvironment Environment { get; }

    public Startup(IConfiguration configuration, IWebHostEnvironment environment)
    {
        Configuration = configuration;
        Environment = environment;
    }

    public void ConfigureServices(IServiceCollection services)
    {
        Log.Information("🔧 Configurando serviços...");

        // Add services to the container.
        services.AddControllers();

        // Configurar serviços usando extensões
        services.AddApplicationServices(Configuration);
        services.AddRepositories();
        services.AddBusinessServices();
        services.AddSwaggerConfiguration();
        services.AddCorsConfiguration();

        Log.Information("✅ Serviços configurados com sucesso");
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        Log.Information("🔧 Configurando pipeline de requisições...");

        // Configurar pipeline usando extensões
        app.UseSwaggerConfiguration();
        app.UseCustomMiddleware(env);
        app.UseDatabaseMigration();

        Log.Information("✅ Pipeline configurado com sucesso");
    }
} 