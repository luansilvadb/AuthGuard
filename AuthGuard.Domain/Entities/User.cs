using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace AuthGuard.Domain.Entities;

public class User : IdentityUser<Guid>
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? MiddleName { get; set; }
    
    [MaxLength(200)]
    public string? JobTitle { get; set; }
    
    [MaxLength(100)]
    public string? Department { get; set; }
    
    public UserRole Role { get; set; } = UserRole.User;
    
    public UserStatus Status { get; set; } = UserStatus.Active;
    
    public DateTime? LastLoginAt { get; set; }
    
    public DateTime? LastActiveAt { get; set; }
    
    public string? ProfilePictureUrl { get; set; }
    
    public string? TimeZone { get; set; } = "UTC";
    
    public string? Language { get; set; } = "pt-BR";
    
    public bool IsEmailVerified { get; set; } = false;
    
    public bool IsPhoneVerified { get; set; } = false;
    
    public bool RequirePasswordChange { get; set; } = false;
    
    public DateTime? PasswordChangedAt { get; set; }
    
    public int LoginAttempts { get; set; } = 0;
    
    public new DateTime? LockoutEnd { get; set; }
    
    // Foreign Keys
    [Required]
    public Guid TenantId { get; set; }
    
    public Guid? BranchId { get; set; }
    
    public Guid? ManagerId { get; set; }
    
    // Navigation properties
    [ForeignKey(nameof(TenantId))]
    public virtual Tenant Tenant { get; set; } = null!;
    
    [ForeignKey(nameof(BranchId))]
    public virtual Branch? Branch { get; set; }
    
    [ForeignKey(nameof(ManagerId))]
    public virtual User? Manager { get; set; }
    
    public virtual ICollection<User> Subordinates { get; set; } = new List<User>();
    
    public virtual ICollection<UserPermission> Permissions { get; set; } = new List<UserPermission>();
    
    public virtual ICollection<UserSoftware> SoftwareAccess { get; set; } = new List<UserSoftware>();
    
    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    
    // Computed properties
    public string FullName => $"{FirstName} {LastName}".Trim();
    
    public string DisplayName => string.IsNullOrEmpty(MiddleName) 
        ? FullName 
        : $"{FirstName} {MiddleName} {LastName}".Trim();
}

public enum UserRole
{
    SuperAdmin,    // Administrador da plataforma
    TenantOwner,   // Proprietário da empresa
    BranchManager, // Gerente de filial
    Supervisor,    // Supervisor
    User           // Usuário final
}

public enum UserStatus
{
    Active,
    Inactive,
    Suspended,
    Pending,
    Locked
} 