using AuthGuard.Application.DTOs;
using MediatR;

namespace AuthGuard.Application.Queries.Tenants;

public class GetTenantQuery : IRequest<TenantDto?>
{
    public Guid Id { get; set; }
} 