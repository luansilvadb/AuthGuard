using AuthGuard.Application.DTOs;
using MediatR;

namespace AuthGuard.Application.Queries.Tenants;

public class GetTenantsQuery : IRequest<IEnumerable<TenantSummaryDto>>
{
    public bool OnlyActive { get; set; } = true;
    public int? Skip { get; set; }
    public int? Take { get; set; }
} 