namespace AuthGuard.Application.DTOs;

public class SoftwareDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Website { get; set; }
    public string? ApiEndpoint { get; set; }
    public string? Version { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public bool RequiresIntegration { get; set; }
    public string? IntegrationConfig { get; set; }
    public string? WebhookUrl { get; set; }
    public decimal BasePrice { get; set; }
    public decimal PricePerUser { get; set; }
    public int MaxUsersPerTenant { get; set; }
    public string? IconUrl { get; set; }
    public string? LogoUrl { get; set; }
    public string? DocumentationUrl { get; set; }
    public string? SupportEmail { get; set; }
    public string? SupportPhone { get; set; }
    public DateTime? LastSyncAt { get; set; }
    public string? SyncStatus { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateSoftwareDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Website { get; set; }
    public string? ApiEndpoint { get; set; }
    public string? Version { get; set; }
    public string Category { get; set; } = string.Empty;
    public bool IsEnabled { get; set; } = true;
    public bool RequiresIntegration { get; set; } = false;
    public string? IntegrationConfig { get; set; }
    public string? WebhookUrl { get; set; }
    public decimal BasePrice { get; set; } = 0;
    public decimal PricePerUser { get; set; } = 0;
    public int MaxUsersPerTenant { get; set; } = 100;
    public string? IconUrl { get; set; }
    public string? LogoUrl { get; set; }
    public string? DocumentationUrl { get; set; }
    public string? SupportEmail { get; set; }
    public string? SupportPhone { get; set; }
}

public class UpdateSoftwareDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Website { get; set; }
    public string? ApiEndpoint { get; set; }
    public string? Version { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public bool RequiresIntegration { get; set; }
    public string? IntegrationConfig { get; set; }
    public string? WebhookUrl { get; set; }
    public decimal BasePrice { get; set; }
    public decimal PricePerUser { get; set; }
    public int MaxUsersPerTenant { get; set; }
    public string? IconUrl { get; set; }
    public string? LogoUrl { get; set; }
    public string? DocumentationUrl { get; set; }
    public string? SupportEmail { get; set; }
    public string? SupportPhone { get; set; }
} 