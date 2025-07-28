using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthGuard.Domain.Entities;

public class TenantLicense : BaseEntity
{
    // Foreign Keys
    [Required]
    public Guid TenantId { get; set; }
    
    [Required]
    public Guid SoftwareLicenseId { get; set; }
    
    // Properties
    public new bool IsActive { get; set; } = true;
    
    public DateTime? StartDate { get; set; }
    
    public DateTime? EndDate { get; set; }
    
    public int LicensedUsers { get; set; } = 1;
    
    public int UsedUsers { get; set; } = 0;
    
    public decimal Price { get; set; } = 0;
    
    public string? Currency { get; set; } = "BRL";
    
    public BillingCycle BillingCycle { get; set; } = BillingCycle.Monthly;
    
    public DateTime? NextBillingDate { get; set; }
    
    public DateTime? LastBillingDate { get; set; }
    
    public string? BillingStatus { get; set; }
    
    public string? CustomConfig { get; set; } // JSON configuration
    
    public string? Notes { get; set; }
    
    // Navigation properties
    [ForeignKey(nameof(TenantId))]
    public virtual Tenant Tenant { get; set; } = null!;
    
    [ForeignKey(nameof(SoftwareLicenseId))]
    public virtual SoftwareLicense SoftwareLicense { get; set; } = null!;
} 