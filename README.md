# WorkSphere
Unified Workforce Management Platform

WorkSphere is a full‑stack HR & Employee Management built with Angular and ASP.NET Core.  
It covers HR workflows (employees, departments, candidates, salaries, payroll) plus employee self‑service (leave, attendance, payroll, announcements).

## Features

- HR & employee login
- Employee management (create, update, view)
- Department management
- Candidate pipeline
- Salary records & payroll posting
- Employee portal (leave, attendance, payslips, announcements)
- Responsive UI with Angular Material

## Tech Stack

- Frontend: Angular 18, Angular Material, TypeScript
- Backend: ASP.NET Core 8, Entity Framework Core
- Database: SQLite (persistent local database)

## Getting Started

### 1) Backend (API)

```bash
cd backend/HRManagementSystem.API
dotnet restore
dotnet run
```

API runs at: `http://localhost:5000`  
Swagger: `http://localhost:5000/swagger`

### 2) Frontend (Angular)

```bash
npm install
npm start
```

App runs at: `http://localhost:4200`

## Login Notes

- Admin (HR): `hr@company.com` / `admin123`
- Employees:
  - Use the email created by HR
  - Password is whatever HR set when creating the employee
  - For seeded employees, default password is `employee123`

## Demo

Live demo URL will be added soon.

## Configuration

- Frontend API URL: `src/environments/environment.ts`
- Backend DB: SQLite file at `backend/HRManagementSystem.API/hr-management.db`

## Author

Chirag Rawat
