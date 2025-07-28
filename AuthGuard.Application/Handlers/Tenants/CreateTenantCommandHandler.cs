using AuthGuard.Application.Commands.Tenants;
using AuthGuard.Application.DTOs;
using AuthGuard.Domain.Entities;
using AuthGuard.Domain.Interfaces;
using AutoMapper;
using MediatR;
using System.Text.RegularExpressions;

namespace AuthGuard.Application.Handlers.Tenants;

public class CreateTenantCommandHandler : IRequestHandler<CreateTenantCommand, TenantDto>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IAuditService _auditService;
    private readonly IMapper _mapper;

    public CreateTenantCommandHandler(
        ITenantRepository tenantRepository,
        IAuditService auditService,
        IMapper mapper)
    {
        _tenantRepository = tenantRepository;
        _auditService = auditService;
        _mapper = mapper;
    }

    public async Task<TenantDto> Handle(CreateTenantCommand request, CancellationToken cancellationToken)
    {
        // Gerar slug único baseado no nome
        var slug = GenerateSlug(request.Name);
        var originalSlug = slug;
        var counter = 1;
        
        while (await _tenantRepository.SlugExistsAsync(slug))
        {
            slug = $"{originalSlug}-{counter}";
            counter++;
        }

        var tenant = new Tenant
        {
            Name = request.Name,
            Slug = slug,
            Description = request.Description,
            Website = request.Website,
            Phone = request.Phone,
            Email = request.Email,
            Address = request.Address,
            City = request.City,
            State = request.State,
            ZipCode = request.ZipCode,
            Country = request.Country,
            TaxId = request.TaxId,
            MaxUsers = request.MaxUsers,
            MaxBranches = request.MaxBranches,
            MonthlyRate = request.MonthlyRate,
            Status = TenantStatus.Active,
            SubscriptionStartDate = DateTime.UtcNow
        };

        var createdTenant = await _tenantRepository.AddAsync(tenant);

        // Log de auditoria
        await _auditService.LogAsync(
            "TenantCreated",
            "Tenant",
            createdTenant.Id,
            createdTenant.Name,
            Guid.Empty, // TODO: Get from current user context
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            $"Tenant '{createdTenant.Name}' criado com sucesso"
        );

        return _mapper.Map<TenantDto>(createdTenant);
    }

    private static string GenerateSlug(string name)
    {
        // Remove acentos e converte para minúsculas
        var normalized = name.Normalize(System.Text.NormalizationForm.FormD);
        var chars = normalized.Where(c => System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c) != System.Globalization.UnicodeCategory.NonSpacingMark).ToArray();
        var result = new string(chars).Normalize(System.Text.NormalizationForm.FormC);

        // Remove caracteres especiais e substitui espaços por hífens
        result = Regex.Replace(result.ToLower(), @"[^a-z0-9\s-]", "");
        result = Regex.Replace(result, @"\s+", "-");
        result = Regex.Replace(result, @"-+", "-");
        result = result.Trim('-');

        return result;
    }
} 