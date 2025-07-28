using AuthGuard.API.Middleware;
using AuthGuard.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuthGuard.API.Extensions;

public static class ApplicationBuilderExtensions
{
    public static IApplicationBuilder UseSwaggerConfiguration(this IApplicationBuilder app)
    {
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "AuthGuard API v1");
            c.RoutePrefix = "swagger";
            c.DocumentTitle = "AuthGuard API Documentation";
        });

        return app;
    }

    public static IApplicationBuilder UseCustomMiddleware(this IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            // Em desenvolvimento, não forçar HTTPS
        }
        else
        {
            app.UseHttpsRedirection();
        }

        app.UseCors("AllowAll");

        // Middleware de logging de requisições
        app.UseRequestLogging();

        app.UseRouting();

        app.UseAuthorization();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });

        return app;
    }

    public static IApplicationBuilder UseDatabaseMigration(this IApplicationBuilder app)
    {
        using (var scope = app.ApplicationServices.CreateScope())
        {
            try
            {
                var context = scope.ServiceProvider.GetRequiredService<AuthGuardDbContext>();
                context.Database.Migrate();
                Serilog.Log.Information("✅ Migrações do banco de dados aplicadas com sucesso");
            }
            catch (Exception ex)
            {
                Serilog.Log.Error(ex, "❌ Erro ao aplicar migrações do banco de dados");
                // Não falhar a aplicação se a migração falhar
            }
        }

        return app;
    }
} 