FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["AuthGuard.API/AuthGuard.API.csproj", "AuthGuard.API/"]
COPY ["AuthGuard.Application/AuthGuard.Application.csproj", "AuthGuard.Application/"]
COPY ["AuthGuard.Domain/AuthGuard.Domain.csproj", "AuthGuard.Domain/"]
COPY ["AuthGuard.Infrastructure/AuthGuard.Infrastructure.csproj", "AuthGuard.Infrastructure/"]
RUN dotnet restore "AuthGuard.API/AuthGuard.API.csproj"
COPY . .
WORKDIR "/src/AuthGuard.API"
RUN dotnet build "AuthGuard.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "AuthGuard.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "AuthGuard.API.dll"] 