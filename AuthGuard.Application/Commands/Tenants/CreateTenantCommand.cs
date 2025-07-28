using AuthGuard.Application.DTOs;
using MediatR;

namespace AuthGuard.Application.Commands.Tenants;

public class CreateTenantCommand : IRequest<TenantDto>
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Website { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string? Country { get; set; }
    public string? TaxId { get; set; }
    public int MaxUsers { get; set; } = 10;
    public int MaxBranches { get; set; } = 1;
    public decimal MonthlyRate { get; set; } = 0;
} 