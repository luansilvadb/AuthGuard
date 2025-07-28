using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthGuard.Domain.Entities;

public class Branch : BaseEntity
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? Code { get; set; }
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
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
    
    [MaxLength(100)]
    public string? Phone { get; set; }
    
    [MaxLength(200)]
    public string? Email { get; set; }
    
    public BranchType Type { get; set; } = BranchType.Branch;
    
    public BranchStatus Status { get; set; } = BranchStatus.Active;
    
    public int MaxUsers { get; set; } = 10;
    
    // Foreign Keys
    [Required]
    public Guid TenantId { get; set; }
    
    public Guid? ParentBranchId { get; set; }
    
    // Navigation properties
    [ForeignKey(nameof(TenantId))]
    public virtual Tenant Tenant { get; set; } = null!;
    
    [ForeignKey(nameof(ParentBranchId))]
    public virtual Branch? ParentBranch { get; set; }
    
    public virtual ICollection<Branch> SubBranches { get; set; } = new List<Branch>();
    
    public virtual ICollection<User> Users { get; set; } = new List<User>();
    
    public virtual ICollection<BranchSoftware> SoftwareAccess { get; set; } = new List<BranchSoftware>();
}

public enum BranchType
{
    Branch,      // Filial
    Subsidiary,  // Subsidiária
    Department,  // Departamento
    Store,       // Loja
    Office       // Escritório
}

public enum BranchStatus
{
    Active,
    Inactive,
    Suspended
} 