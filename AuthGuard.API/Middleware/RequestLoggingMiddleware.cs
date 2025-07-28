using System.Diagnostics;
using Microsoft.AspNetCore.Http.Extensions;

namespace AuthGuard.API.Middleware;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var requestPath = context.Request.GetDisplayUrl();
        var method = context.Request.Method;
        var userAgent = context.Request.Headers.UserAgent.ToString();
        var ipAddress = context.Connection.RemoteIpAddress?.ToString() ?? "Unknown";

        _logger.LogInformation("📥 {Method} {Path} iniciado por {IP} | User-Agent: {UserAgent}", 
            method, requestPath, ipAddress, userAgent);

        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Erro durante o processamento de {Method} {Path}", method, requestPath);
            throw;
        }
        finally
        {
            stopwatch.Stop();
            var statusCode = context.Response.StatusCode;
            var duration = stopwatch.ElapsedMilliseconds;

            var logLevel = statusCode >= 500 ? LogLevel.Error : 
                          statusCode >= 400 ? LogLevel.Warning : 
                          LogLevel.Information;

            _logger.Log(logLevel, "📤 {Method} {Path} concluído com status {StatusCode} em {Duration}ms", 
                method, requestPath, statusCode, duration);
        }
    }
}

public static class RequestLoggingMiddlewareExtensions
{
    public static IApplicationBuilder UseRequestLogging(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<RequestLoggingMiddleware>();
    }
} 