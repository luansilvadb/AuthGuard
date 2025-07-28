using AuthGuard.Application.Commands.Tenants;
using AuthGuard.Application.Queries.Tenants;
using AuthGuard.Application.DTOs;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AuthGuard.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TenantsController : ControllerBase
{
    private readonly IMediator _mediator;

    public TenantsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Obtém todos os tenants
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TenantSummaryDto>>> GetTenants(
        [FromQuery] bool onlyActive = true,
        [FromQuery] int? skip = null,
        [FromQuery] int? take = null)
    {
        var query = new GetTenantsQuery
        {
            OnlyActive = onlyActive,
            Skip = skip,
            Take = take
        };

        var tenants = await _mediator.Send(query);
        return Ok(tenants);
    }

    /// <summary>
    /// Obtém um tenant específico por ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TenantDto>> GetTenant(Guid id)
    {
        var query = new GetTenantQuery { Id = id };
        var tenant = await _mediator.Send(query);

        if (tenant == null)
            return NotFound();

        return Ok(tenant);
    }

    /// <summary>
    /// Cria um novo tenant
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<TenantDto>> CreateTenant([FromBody] CreateTenantCommand command)
    {
        var tenant = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetTenant), new { id = tenant.Id }, tenant);
    }

    /// <summary>
    /// Atualiza um tenant existente
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TenantDto>> UpdateTenant(Guid id, [FromBody] UpdateTenantCommand command)
    {
        command.Id = id;
        var tenant = await _mediator.Send(command);
        return Ok(tenant);
    }

    /// <summary>
    /// Remove um tenant (soft delete)
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteTenant(Guid id)
    {
        // TODO: Implementar comando de delete
        return NoContent();
    }
} 