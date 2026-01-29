# WorkSphere — Backend API
Unified Workforce Management Platform

ASP.NET Core 8 Web API that powers WorkSphere.

## Features

- Employees, Departments, Candidates, Salaries APIs
- Payroll creation via HR portal
- JWT-based auth
- SQLite persistence
- Swagger docs

## Run Locally

```bash
cd backend/HRManagementSystem.API
dotnet restore
dotnet run
```

API:
- `http://localhost:5000`
- Swagger: `http://localhost:5000/swagger`

## Database

SQLite file:
- `backend/HRManagementSystem.API/hr-management.db`

## Notes

- Default admin login: `hr@company.com` / `admin123`
- Employee logins are created by HR when adding employees

## Author

Chirag Rawat
