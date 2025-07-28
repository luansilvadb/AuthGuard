using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthGuard.Domain.Entities;

public class UserPermission : BaseEntity
{
    // Foreign Keys
    [Required]
    public Guid UserId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Permission { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? Resource { get; set; }
    
    [MaxLength(100)]
    public string? Action { get; set; }
    
    public bool IsGranted { get; set; } = true;
    
    public DateTime? ValidFrom { get; set; }
    
    public DateTime? ValidTo { get; set; }
    
    public string? Conditions { get; set; } // JSON conditions
    
    public string? Notes { get; set; }
    
    // Navigation properties
    [ForeignKey(nameof(UserId))]
    public virtual User User { get; set; } = null!;
} 