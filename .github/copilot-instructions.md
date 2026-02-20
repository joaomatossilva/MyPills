# Copilot Instructions (Backend)

## Process
- Always show a short implementation plan before making code changes.

## Architecture and Design
- Follow SOLID principles; prefer small, focused types and clear responsibilities.
- Follow REPR (Request-Endpoint-Response): each endpoint has its own independent request/response DTOs; do not reuse DTOs across endpoints.
- Keep each type in its own file (one public type per file).
- Use primary constructors for simple services and options holders when it keeps the type concise.

## Data Access
- Use Entity Framework Core directly as the database layer.
- Avoid the Repository pattern; use `DbContext` and `DbSet<T>` directly.

## General Guidance
- Use async EF Core APIs (`ToListAsync`, `FirstOrDefaultAsync`, `SaveChangesAsync`).
- Validate inputs and handle nulls defensively.
