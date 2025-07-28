namespace AuthGuard.Application.DTOs;

public class TenantDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
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
    public string Status { get; set; } = string.Empty;
    public DateTime? SubscriptionStartDate { get; set; }
    public DateTime? SubscriptionEndDate { get; set; }
    public int MaxUsers { get; set; }
    public int MaxBranches { get; set; }
    public decimal MonthlyRate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int BranchesCount { get; set; }
    public int UsersCount { get; set; }
    public int SoftwareCount { get; set; }
}

public class CreateTenantDto
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

public class UpdateTenantDto
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
    public int MaxUsers { get; set; }
    public int MaxBranches { get; set; }
    public decimal MonthlyRate { get; set; }
}

public class TenantSummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int BranchesCount { get; set; }
    public int UsersCount { get; set; }
    public decimal MonthlyRate { get; set; }
    public DateTime CreatedAt { get; set; }
} 