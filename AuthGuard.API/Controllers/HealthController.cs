using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AuthGuard.Infrastructure.Data;
using System.Diagnostics;
using System.ComponentModel;

namespace AuthGuard.API.Controllers;

[ApiController]
[Route("")]
[ApiExplorerSettings(IgnoreApi = true)] // Oculta do Swagger
public class HealthController : ControllerBase
{
    private readonly ILogger<HealthController> _logger;
    private readonly AuthGuardDbContext _context;

    public HealthController(ILogger<HealthController> logger, AuthGuardDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    [HttpGet]
    [ApiExplorerSettings(IgnoreApi = true)] // Oculta do Swagger
    public async Task<IActionResult> Get()
    {
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            // Verificação real do banco - essencial para health check
            var canConnect = await _context.Database.CanConnectAsync();
            
            stopwatch.Stop();
            
            var healthInfo = new
            {
                status = canConnect ? "healthy" : "unhealthy",
                timestamp = DateTime.UtcNow,
                latency = stopwatch.ElapsedMilliseconds,
                database = canConnect ? "connected" : "disconnected"
            };

            _logger.LogInformation("Health check realizado - Status: {Status}, Latência: {Latency}ms", 
                healthInfo.status, healthInfo.latency);
            
            return Ok(healthInfo);
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            _logger.LogError(ex, "Erro durante health check");
            
            return StatusCode(500, new
            {
                status = "unhealthy",
                timestamp = DateTime.UtcNow,
                latency = stopwatch.ElapsedMilliseconds,
                error = ex.Message
            });
        }
    }

    [HttpGet("health")]
    [ApiExplorerSettings(IgnoreApi = true)] // Oculta do Swagger
    public async Task<IActionResult> Health()
    {
        var stopwatch = Stopwatch.StartNew();
        var canConnect = await _context.Database.CanConnectAsync();
        stopwatch.Stop();

        return Ok(new
        {
            status = canConnect ? "healthy" : "unhealthy",
            timestamp = DateTime.UtcNow,
            latency = stopwatch.ElapsedMilliseconds,
            database = canConnect ? "connected" : "disconnected"
        });
    }

    [HttpGet("health/detailed")]
    [ApiExplorerSettings(IgnoreApi = true)] // Oculta do Swagger
    public async Task<IActionResult> HealthDetailed()
    {
        var stopwatch = Stopwatch.StartNew();
        var canConnect = await _context.Database.CanConnectAsync();
        stopwatch.Stop();

        return Ok(new
        {
            status = canConnect ? "healthy" : "unhealthy",
            timestamp = DateTime.UtcNow,
            latency = stopwatch.ElapsedMilliseconds,
            database = canConnect ? "connected" : "disconnected",
            details = canConnect ? "Database connection verified" : "Database connection failed"
        });
    }
} 