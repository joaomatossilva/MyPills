# Copilot Instructions (Backend)

## Process
- Always show the implementation plan before making code changes, and wait for approval before proceeding with the implementation.
- Don't create any documentation files with the summary or explanation of the execution of the plan;

## Architecture and Design
- Follow SOLID principles; prefer small, focused types and clear responsibilities.
- Follow REPR (Request-Endpoint-Response): each endpoint has its own independent request/response DTOs; do not reuse DTOs across endpoints.
- Keep each type in its own file (one public type per file).
- Use primary constructors for simple services and options holders when it keeps the type concise.
- Place each controller in a feature folder under `MyPills/Controllers/<Feature>/` and match the namespace to the folder (e.g., `MyPills.Controllers.Overview.OverviewController`).

## Data Access
- Use Entity Framework Core directly as the database layer.
- Avoid the Repository pattern; use `DbContext` and `DbSet<T>` directly.

## General Guidance
- Use async EF Core APIs (`ToListAsync`, `FirstOrDefaultAsync`, `SaveChangesAsync`).
- Validate inputs and handle nulls defensively.
