using AuthGuard.Application.Mappings;
using AuthGuard.Domain.Interfaces;
using AuthGuard.Infrastructure.Data;
using AuthGuard.Infrastructure.Repositories;
using AuthGuard.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

namespace AuthGuard.API.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Configuração do Entity Framework
        services.AddDbContext<AuthGuardDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"))
            .LogTo(Console.WriteLine, LogLevel.Warning)
            .EnableSensitiveDataLogging(false)
            .EnableDetailedErrors(false));

        // Configuração do Identity
        services.AddIdentity<AuthGuard.Domain.Entities.User, Microsoft.AspNetCore.Identity.IdentityRole<Guid>>()
            .AddEntityFrameworkStores<AuthGuardDbContext>();

        // Configuração do MediatR
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(AuthGuard.Application.Commands.Tenants.CreateTenantCommand).Assembly));

        // Configuração do AutoMapper
        services.AddAutoMapper(typeof(MappingProfile));

        return services;
    }

    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        // Registro dos repositórios
        services.AddScoped(typeof(IRepository<>), typeof(BaseRepository<>));
        services.AddScoped<ITenantRepository, TenantRepository>();
        services.AddScoped<AuthGuard.Domain.Interfaces.IUserRepository, UserRepository>();
        services.AddScoped<AuthGuard.Domain.Interfaces.ISoftwareRepository, SoftwareRepository>();

        return services;
    }

    public static IServiceCollection AddBusinessServices(this IServiceCollection services)
    {
        // Registro dos serviços
        services.AddScoped<IAuditService, AuditService>();

        return services;
    }

    public static IServiceCollection AddSwaggerConfiguration(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "AuthGuard API",
                Version = "v1",
                Description = "API para gerenciamento de autenticação e autorização",
                Contact = new OpenApiContact
                {
                    Name = "AuthGuard Team",
                    Email = "support@authguard.com"
                }
            });
        });

        return services;
    }

    public static IServiceCollection AddCorsConfiguration(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("AllowAll", policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyMethod()
                      .AllowAnyHeader();
            });
        });

        return services;
    }
} 