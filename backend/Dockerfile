FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution and project files
COPY DiscretionaryPowers.sln .
COPY src/DiscretionaryPowers.Domain/DiscretionaryPowers.Domain.csproj src/DiscretionaryPowers.Domain/
COPY src/DiscretionaryPowers.Application/DiscretionaryPowers.Application.csproj src/DiscretionaryPowers.Application/
COPY src/DiscretionaryPowers.Infrastructure/DiscretionaryPowers.Infrastructure.csproj src/DiscretionaryPowers.Infrastructure/
COPY src/DiscretionaryPowers.Api/DiscretionaryPowers.Api.csproj src/DiscretionaryPowers.Api/

# Restore
RUN dotnet restore

# Copy everything and build
COPY . .
RUN dotnet publish src/DiscretionaryPowers.Api -c Release -o /app/publish --no-restore

# Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "DiscretionaryPowers.Api.dll"]
