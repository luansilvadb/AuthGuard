using AuthGuard.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AuthGuard.Infrastructure.Data;

public class AuthGuardDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
{
    public AuthGuardDbContext(DbContextOptions<AuthGuardDbContext> options) : base(options)
    {
    }

    // DbSets
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<Branch> Branches { get; set; }
    public DbSet<Software> Software { get; set; }
    public DbSet<TenantSoftware> TenantSoftware { get; set; }
    public DbSet<BranchSoftware> BranchSoftware { get; set; }
    public DbSet<UserSoftware> UserSoftware { get; set; }
    public DbSet<SoftwareLicense> SoftwareLicenses { get; set; }
    public DbSet<TenantLicense> TenantLicenses { get; set; }
    public DbSet<UserPermission> UserPermissions { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configurações do Identity
        builder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.UserName).IsUnique();
            entity.HasIndex(e => e.TenantId);
            entity.HasIndex(e => e.BranchId);
            entity.HasIndex(e => e.ManagerId);
        });

        // Configurações do Tenant
        builder.Entity<Tenant>(entity =>
        {
            entity.ToTable("Tenants");
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.HasIndex(e => e.Email);
            entity.HasIndex(e => e.Status);
            entity.Property(e => e.MonthlyRate).HasColumnType("decimal(18,2)");
        });

        // Configurações do Branch
        builder.Entity<Branch>(entity =>
        {
            entity.ToTable("Branches");
            entity.HasIndex(e => e.TenantId);
            entity.HasIndex(e => e.ParentBranchId);
            entity.HasIndex(e => e.Status);
            entity.HasOne(e => e.Tenant)
                .WithMany(t => t.Branches)
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.ParentBranch)
                .WithMany(b => b.SubBranches)
                .HasForeignKey(e => e.ParentBranchId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configurações do Software
        builder.Entity<Software>(entity =>
        {
            entity.ToTable("Software");
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.HasIndex(e => e.Category);
            entity.HasIndex(e => e.Status);
            entity.Property(e => e.BasePrice).HasColumnType("decimal(18,2)");
            entity.Property(e => e.PricePerUser).HasColumnType("decimal(18,2)");
        });

        // Configurações do TenantSoftware
        builder.Entity<TenantSoftware>(entity =>
        {
            entity.ToTable("TenantSoftware");
            entity.HasIndex(e => new { e.TenantId, e.SoftwareId }).IsUnique();
            entity.HasIndex(e => e.TenantId);
            entity.HasIndex(e => e.SoftwareId);
            entity.Property(e => e.CustomPrice).HasColumnType("decimal(18,2)");
            entity.HasOne(e => e.Tenant)
                .WithMany(t => t.SoftwareAccess)
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Software)
                .WithMany(s => s.TenantAccess)
                .HasForeignKey(e => e.SoftwareId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configurações do BranchSoftware
        builder.Entity<BranchSoftware>(entity =>
        {
            entity.ToTable("BranchSoftware");
            entity.HasIndex(e => new { e.BranchId, e.SoftwareId }).IsUnique();
            entity.HasIndex(e => e.BranchId);
            entity.HasIndex(e => e.SoftwareId);
            entity.HasOne(e => e.Branch)
                .WithMany(b => b.SoftwareAccess)
                .HasForeignKey(e => e.BranchId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Software)
                .WithMany(s => s.BranchAccess)
                .HasForeignKey(e => e.SoftwareId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configurações do UserSoftware
        builder.Entity<UserSoftware>(entity =>
        {
            entity.ToTable("UserSoftware");
            entity.HasIndex(e => new { e.UserId, e.SoftwareId }).IsUnique();
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.SoftwareId);
            entity.HasOne(e => e.User)
                .WithMany(u => u.SoftwareAccess)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Software)
                .WithMany(s => s.UserAccess)
                .HasForeignKey(e => e.SoftwareId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configurações do SoftwareLicense
        builder.Entity<SoftwareLicense>(entity =>
        {
            entity.ToTable("SoftwareLicenses");
            entity.HasIndex(e => e.SoftwareId);
            entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
            entity.HasOne(e => e.Software)
                .WithMany(s => s.Licenses)
                .HasForeignKey(e => e.SoftwareId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configurações do TenantLicense
        builder.Entity<TenantLicense>(entity =>
        {
            entity.ToTable("TenantLicenses");
            entity.HasIndex(e => e.TenantId);
            entity.HasIndex(e => e.SoftwareLicenseId);
            entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
            entity.HasOne(e => e.Tenant)
                .WithMany(t => t.Licenses)
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.SoftwareLicense)
                .WithMany(sl => sl.TenantLicenses)
                .HasForeignKey(e => e.SoftwareLicenseId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configurações do UserPermission
        builder.Entity<UserPermission>(entity =>
        {
            entity.ToTable("UserPermissions");
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.Permission);
            entity.HasOne(e => e.User)
                .WithMany(u => u.Permissions)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configurações do AuditLog
        builder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("AuditLogs");
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.TenantId);
            entity.HasIndex(e => e.BranchId);
            entity.HasIndex(e => e.EntityType);
            entity.HasIndex(e => e.EntityId);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.Level);
            entity.HasOne(e => e.User)
                .WithMany(u => u.AuditLogs)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
} 