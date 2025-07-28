using AuthGuard.Application.DTOs;
using AuthGuard.Application.Queries.Tenants;
using AuthGuard.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace AuthGuard.Application.Handlers.Tenants;

public class GetTenantQueryHandler : IRequestHandler<GetTenantQuery, TenantDto?>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IMapper _mapper;

    public GetTenantQueryHandler(ITenantRepository tenantRepository, IMapper mapper)
    {
        _tenantRepository = tenantRepository;
        _mapper = mapper;
    }

    public async Task<TenantDto?> Handle(GetTenantQuery request, CancellationToken cancellationToken)
    {
        var tenant = await _tenantRepository.GetByIdAsync(request.Id);
        
        if (tenant == null)
            return null;

        var tenantDto = _mapper.Map<TenantDto>(tenant);
        
        // Adicionar contadores
        tenantDto.BranchesCount = tenant.Branches?.Count(b => b.Status == AuthGuard.Domain.Entities.BranchStatus.Active) ?? 0;
        tenantDto.UsersCount = tenant.Users?.Count(u => u.Status == AuthGuard.Domain.Entities.UserStatus.Active) ?? 0;
        tenantDto.SoftwareCount = tenant.SoftwareAccess?.Count(ts => ts.IsEnabled) ?? 0;

        return tenantDto;
    }
} 