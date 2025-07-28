using AuthGuard.Application.DTOs;
using AuthGuard.Domain.Entities;
using AutoMapper;

namespace AuthGuard.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Tenant mappings
        CreateMap<Tenant, TenantDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
        
        CreateMap<Tenant, TenantSummaryDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

        // User mappings
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
            .ForMember(dest => dest.DisplayName, opt => opt.MapFrom(src => src.DisplayName))
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.TenantName, opt => opt.MapFrom(src => src.Tenant.Name))
            .ForMember(dest => dest.BranchName, opt => opt.MapFrom(src => src.Branch != null ? src.Branch.Name : null))
            .ForMember(dest => dest.ManagerName, opt => opt.MapFrom(src => src.Manager != null ? src.Manager.FullName : null))
            .ForMember(dest => dest.SoftwareAccessCount, opt => opt.MapFrom(src => src.SoftwareAccess != null ? src.SoftwareAccess.Count : 0));

        CreateMap<User, UserSummaryDto>()
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.TenantName, opt => opt.MapFrom(src => src.Tenant.Name))
            .ForMember(dest => dest.BranchName, opt => opt.MapFrom(src => src.Branch != null ? src.Branch.Name : null));

        // Branch mappings
        CreateMap<Branch, BranchDto>()
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.TenantName, opt => opt.MapFrom(src => src.Tenant.Name))
            .ForMember(dest => dest.ParentBranchName, opt => opt.MapFrom(src => src.ParentBranch != null ? src.ParentBranch.Name : null));

        // Software mappings
        CreateMap<Software, SoftwareDto>()
            .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category.ToString()))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
    }
} 