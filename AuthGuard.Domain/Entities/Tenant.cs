using System.ComponentModel.DataAnnotations;

namespace AuthGuard.Domain.Entities;

public class Tenant : BaseEntity
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Slug { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    [MaxLength(200)]
    public string? Website { get; set; }
    
    [MaxLength(100)]
    public string? Phone { get; set; }
    
    [MaxLength(200)]
    public string? Email { get; set; }
    
    [MaxLength(200)]
    public string? Address { get; set; }
    
    [MaxLength(100)]
    public string? City { get; set; }
    
    [MaxLength(100)]
    public string? State { get; set; }
    
    [MaxLength(20)]
    public string? ZipCode { get; set; }
    
    [MaxLength(100)]
    public string? Country { get; set; }
    
    [MaxLength(50)]
    public string? TaxId { get; set; }
    
    public TenantStatus Status { get; set; } = TenantStatus.Active;
    
    public DateTime? SubscriptionStartDate { get; set; }
    
    public DateTime? SubscriptionEndDate { get; set; }
    
    public int MaxUsers { get; set; } = 10;
    
    public int MaxBranches { get; set; } = 1;
    
    public decimal MonthlyRate { get; set; } = 0;
    
    // Navigation properties
    public virtual ICollection<Branch> Branches { get; set; } = new List<Branch>();
    
    public virtual ICollection<User> Users { get; set; } = new List<User>();
    
    public virtual ICollection<TenantLicense> Licenses { get; set; } = new List<TenantLicense>();
    
    public virtual ICollection<TenantSoftware> SoftwareAccess { get; set; } = new List<TenantSoftware>();
}

public enum TenantStatus
{
    Active,
    Suspended,
    Cancelled,
    Pending
} 