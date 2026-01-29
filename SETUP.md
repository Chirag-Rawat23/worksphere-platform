# WorkSphere — Setup Guide
Unified Workforce Management Platform

This guide helps you run both the Angular frontend and the ASP.NET Core backend locally.

## Project Structure

```
hr-management-system/
├─ src/                      # Angular frontend
├─ backend/HRManagementSystem.API/  # ASP.NET Core API
├─ README.md
└─ SETUP.md
```

## Backend (API)

```bash
cd backend/HRManagementSystem.API
dotnet restore
dotnet run
```

API endpoints:
- `http://localhost:5000`
- Swagger: `http://localhost:5000/swagger`

## Frontend (Angular)

```bash
npm install
npm start
```

App:
- `http://localhost:4200`

## Login Notes

- Admin (HR): `hr@company.com` / `admin123`
- Employees:
  - Use the email created by HR
  - Password is whatever HR set when creating the employee
  - For seeded employees, default password is `employee123`

## Database

This project uses a persistent SQLite database:
- File: `backend/HRManagementSystem.API/hr-management.db`

## Common Issues

### API won’t start
- Check port 5000 isn’t already in use
- Ensure .NET 8 SDK is installed (`dotnet --version`)

### Frontend can’t reach backend
- Ensure backend is running on `http://localhost:5000`
- Check `src/environments/environment.ts`

## Demo

Live demo URL will be added soon.
