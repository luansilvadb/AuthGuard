using AuthGuard.Application.Mappings;
using AuthGuard.Domain.Interfaces;
using AuthGuard.Infrastructure.Data;
using AuthGuard.Infrastructure.Repositories;
using AuthGuard.Infrastructure.Services;
using AuthGuard.API.Middleware;
using Microsoft.EntityFrameworkCore;
using Serilog;
using FluentValidation;

var builder = WebApplication.CreateBuilder(args);

// Configuração do Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Host.UseSerilog();

Log.Information("🚀 Iniciando AuthGuard API...");

try
{
    // Add services to the container.
    builder.Services.AddControllers();

    // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    // Configuração do Entity Framework
    builder.Services.AddDbContext<AuthGuardDbContext>(options =>
        options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
        .LogTo(Console.WriteLine, LogLevel.Warning)
        .EnableSensitiveDataLogging(false)
        .EnableDetailedErrors(false)); // Otimizações para performance

    // Configuração do Identity
    builder.Services.AddIdentity<AuthGuard.Domain.Entities.User, Microsoft.AspNetCore.Identity.IdentityRole<Guid>>()
        .AddEntityFrameworkStores<AuthGuardDbContext>();

    // Configuração do MediatR
    builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(AuthGuard.Application.Commands.Tenants.CreateTenantCommand).Assembly));

    // Configuração do AutoMapper
    builder.Services.AddAutoMapper(typeof(MappingProfile));

    // Configuração do FluentValidation
    // builder.Services.AddFluentValidationAutoValidation();

    // Registro dos repositórios
    builder.Services.AddScoped(typeof(IRepository<>), typeof(BaseRepository<>));
    builder.Services.AddScoped<ITenantRepository, TenantRepository>();
    builder.Services.AddScoped<AuthGuard.Domain.Interfaces.IUserRepository, UserRepository>();
    builder.Services.AddScoped<AuthGuard.Domain.Interfaces.ISoftwareRepository, SoftwareRepository>();

    // Registro dos serviços
    builder.Services.AddScoped<IAuditService, AuditService>();

    // Configuração do CORS
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowAll", policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
    });

    var app = builder.Build();

    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
        // Em desenvolvimento, não forçar HTTPS
    }
    else
    {
        app.UseHttpsRedirection();
    }

    app.UseCors("AllowAll");

    // Middleware de logging de requisições
    app.UseRequestLogging();

    app.UseAuthorization();

    app.MapControllers();

    // Migração automática do banco de dados
    using (var scope = app.Services.CreateScope())
    {
        try
        {
            var context = scope.ServiceProvider.GetRequiredService<AuthGuardDbContext>();
            context.Database.Migrate();
            Log.Information("✅ Migrações do banco de dados aplicadas com sucesso");
        }
        catch (Exception ex)
        {
            Log.Error(ex, "❌ Erro ao aplicar migrações do banco de dados");
            // Não falhar a aplicação se a migração falhar
        }
    }

    Log.Information("🌐 AuthGuard API iniciada com sucesso!");
    Log.Information("📍 Ambiente: {Environment}", app.Environment.EnvironmentName);
    Log.Information("📍 API: http://localhost:80");
    Log.Information("📚 Swagger: http://localhost:80/swagger");

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
