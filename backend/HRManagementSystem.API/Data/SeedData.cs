using HRManagementSystem.API.Models;
using BCrypt.Net;

namespace HRManagementSystem.API.Data;

public static class SeedData
{
    public static void Initialize(HRDbContext context)
    {
        // Ensure database is created
        context.Database.EnsureCreated();

        // Check if data already exists
        bool dataExists = context.Departments.Any();

        if (!dataExists)
        {
            // Seed Departments first without managers to avoid circular FK constraints.
        var departments = new List<Department>
        {
            new Department { Id = 1, Name = "Human Resources", Location = "Floor 1", Budget = 500000, ManagerId = null, Description = "Handles HR operations" },
            new Department { Id = 2, Name = "Information Technology", Location = "Floor 2", Budget = 800000, ManagerId = null, Description = "Tech infrastructure" },
            new Department { Id = 3, Name = "Finance", Location = "Floor 3", Budget = 600000, ManagerId = null, Description = "Manages company finances" },
            new Department { Id = 4, Name = "Marketing", Location = "Floor 4", Budget = 400000, ManagerId = null, Description = "Handles promotions & branding" },
            new Department { Id = 5, Name = "Sales", Location = "Floor 5", Budget = 450000, ManagerId = null, Description = "Drives revenue through sales" },
            new Department { Id = 6, Name = "Operations", Location = "Floor 6", Budget = 700000, ManagerId = null, Description = "Ensures daily operations" },
            new Department { Id = 7, Name = "Customer Support", Location = "Floor 7", Budget = 300000, ManagerId = null, Description = "Handles client support" },
            new Department { Id = 8, Name = "R&D", Location = "Floor 8", Budget = 1000000, ManagerId = null, Description = "Research and development" }
        };

        context.Departments.AddRange(departments);
        context.SaveChanges();

        // Seed Employees
        var employees = new List<Employee>
        {
            new Employee { Id = 1, Name = "John Doe", Email = "john@hr.com", DepartmentId = 1, Position = "HR Manager", HireDate = new DateTime(2025, 11, 18), PhoneNumber = "555-0101", Address = "123 Main St, City, State", DateOfBirth = new DateTime(1985, 5, 15), EmploymentType = "Full-Time", Status = "Active", EmergencyContact = "Jane Doe", EmergencyContactPhone = "555-0102" },
            new Employee { Id = 2, Name = "Jane Smith", Email = "jane@it.com", DepartmentId = 2, Position = "IT Director", HireDate = new DateTime(2025, 12, 2), PhoneNumber = "555-0103", Address = "234 Oak St, City, State", DateOfBirth = new DateTime(1983, 3, 22), EmploymentType = "Full-Time", Status = "Active", EmergencyContact = "John Smith", EmergencyContactPhone = "555-0104" },
            new Employee { Id = 3, Name = "Michael Johnson", Email = "michael@hr.com", DepartmentId = 1, Position = "Recruiter", HireDate = new DateTime(2026, 1, 9), PhoneNumber = "555-0105", Address = "456 Pine St, City, State", DateOfBirth = new DateTime(1990, 7, 12), EmploymentType = "Full-Time", Status = "Active", EmergencyContact = "Sarah Johnson", EmergencyContactPhone = "555-0106" },
            new Employee { Id = 4, Name = "Emily Davis", Email = "emily@it.com", DepartmentId = 2, Position = "Software Engineer", HireDate = new DateTime(2026, 1, 14), PhoneNumber = "555-0107", Address = "789 Maple Ave, City, State", DateOfBirth = new DateTime(1995, 11, 8), EmploymentType = "Full-Time", Status = "Active", EmergencyContact = "James Davis", EmergencyContactPhone = "555-0108" },
            new Employee { Id = 5, Name = "Robert Brown", Email = "robert@finance.com", DepartmentId = 3, Position = "Accountant", HireDate = new DateTime(2025, 10, 7), PhoneNumber = "555-0109", Address = "321 Elm St, City, State", DateOfBirth = new DateTime(1987, 2, 20), EmploymentType = "Full-Time", Status = "Active", EmergencyContact = "Laura Brown", EmergencyContactPhone = "555-0110" }
        };

        context.Employees.AddRange(employees);
        context.SaveChanges();

        // Now that employees exist, assign department managers.
        var departmentManagers = new Dictionary<int, int>
        {
            [1] = 1,
            [2] = 2,
            [3] = 5,
            [4] = 4,
            [5] = 5,
            [6] = 2,
            [7] = 3,
            [8] = 4
        };

        foreach (var dept in departments)
        {
            if (departmentManagers.TryGetValue(dept.Id, out var managerId))
            {
                dept.ManagerId = managerId;
            }
        }
        context.SaveChanges();

        // Seed Candidates
        var candidates = new List<Candidate>
        {
            new Candidate { Id = 1, Name = "Alice Johnson", Email = "alice@test.com", Phone = "555-0111", AppliedPosition = "HR Assistant", AppliedDepartmentId = 1, Status = "Interviewed", ApplicationDate = new DateTime(2026, 1, 8), Resume = "https://example.com/resumes/alice-johnson.pdf" },
            new Candidate { Id = 2, Name = "Mark Lee", Email = "mark@test.com", Phone = "555-0112", AppliedPosition = "Software Engineer", AppliedDepartmentId = 2, Status = "Applied", ApplicationDate = new DateTime(2026, 1, 19) },
            new Candidate { Id = 3, Name = "Rachel Green", Email = "rachel@test.com", Phone = "555-0113", AppliedPosition = "Accountant", AppliedDepartmentId = 3, Status = "Rejected", ApplicationDate = new DateTime(2025, 12, 22) },
            new Candidate { Id = 4, Name = "David Kim", Email = "david@test.com", Phone = "555-0114", AppliedPosition = "Marketing Coordinator", AppliedDepartmentId = 4, Status = "Applied", ApplicationDate = new DateTime(2026, 1, 3) },
            new Candidate { Id = 5, Name = "Laura White", Email = "laura@test.com", Phone = "555-0115", AppliedPosition = "Sales Associate", AppliedDepartmentId = 5, Status = "Hired", ApplicationDate = new DateTime(2025, 12, 5) }
        };

        context.Candidates.AddRange(candidates);
        context.SaveChanges();

        // Seed Salaries
        var salaries = new List<Salary>
        {
            new Salary { Id = 1, EmployeeId = 1, BaseAmount = 75000, Bonus = 0, PaymentFrequency = "Monthly", EffectiveDate = new DateTime(2025, 12, 1), AdjustmentType = "raise", Notes = "Annual raise" },
            new Salary { Id = 2, EmployeeId = 2, BaseAmount = 95000, Bonus = 10000, PaymentFrequency = "Monthly", EffectiveDate = new DateTime(2025, 12, 1) },
            new Salary { Id = 3, EmployeeId = 3, BaseAmount = 85000, PaymentFrequency = "Monthly", EffectiveDate = new DateTime(2026, 1, 5), AdjustmentType = "promotion" },
            new Salary { Id = 4, EmployeeId = 4, BaseAmount = 40000, Bonus = 5000, PaymentFrequency = "Monthly", EffectiveDate = new DateTime(2026, 1, 10) },
            new Salary { Id = 5, EmployeeId = 5, BaseAmount = 88000, PaymentFrequency = "Monthly", EffectiveDate = new DateTime(2025, 11, 1), Notes = "No bonus included" }
        };

        // Calculate derived fields
        foreach (var salary in salaries)
        {
            salary.GrossAmount = salary.BaseAmount + (salary.Bonus ?? 0);
            salary.TaxDeductions = salary.GrossAmount * 0.2m; // 20% tax
            salary.NetAmount = salary.GrossAmount - salary.TaxDeductions;
        }

            context.Salaries.AddRange(salaries);
            context.SaveChanges();
        }

        // Seed default HR user (always check, even if other data exists)
        if (!context.Users.Any(u => u.Email == "hr@company.com"))
        {
            var defaultUser = new User
            {
                Id = 1,
                Email = "hr@company.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"), // Default password
                Name = "HR Manager",
                Role = "HR"
            };

            context.Users.Add(defaultUser);
            context.SaveChanges();
        }

        // Ensure all employees have login accounts (default password for seeded data)
        var existingUserEmails = new HashSet<string>(
            context.Users.Select(u => u.Email).ToList(),
            StringComparer.OrdinalIgnoreCase
        );

        var employeeUsers = context.Employees
            .Where(e => !existingUserEmails.Contains(e.Email))
            .Select(e => new User
            {
                Email = e.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"),
                Name = e.Name,
                Role = "Employee"
            })
            .ToList();

        if (employeeUsers.Count > 0)
        {
            context.Users.AddRange(employeeUsers);
            context.SaveChanges();
        }
    }
}
