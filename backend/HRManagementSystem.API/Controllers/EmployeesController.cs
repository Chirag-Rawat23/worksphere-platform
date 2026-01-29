using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HRManagementSystem.API.Data;
using HRManagementSystem.API.Models;
using System.Linq;
using BCrypt.Net;

namespace HRManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly HRDbContext _context;

    public EmployeesController(HRDbContext context)
    {
        _context = context;
    }

    // GET: api/employees
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees()
    {
        var employees = await _context.Employees
            .Include(e => e.Department)
            .Select(e => new Employee
            {
                Id = e.Id,
                Name = e.Name,
                Email = e.Email,
                DepartmentId = e.DepartmentId,
                PhoneNumber = e.PhoneNumber,
                Address = e.Address,
                DateOfBirth = e.DateOfBirth,
                Position = e.Position,
                HireDate = e.HireDate,
                EmergencyContact = e.EmergencyContact,
                EmergencyContactPhone = e.EmergencyContactPhone,
                EmploymentType = e.EmploymentType,
                Status = e.Status,
                Department = e.Department != null ? new Department
                {
                    Id = e.Department.Id,
                    Name = e.Department.Name,
                    Location = e.Department.Location,
                    Budget = e.Department.Budget,
                    ManagerId = e.Department.ManagerId,
                    Description = e.Department.Description
                } : null
            })
            .ToListAsync();
        return Ok(employees);
    }

    // GET: api/employees/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Employee>> GetEmployee(int id)
    {
        var employee = await _context.Employees
            .Include(e => e.Department)
            .Where(e => e.Id == id)
            .Select(e => new Employee
            {
                Id = e.Id,
                Name = e.Name,
                Email = e.Email,
                DepartmentId = e.DepartmentId,
                PhoneNumber = e.PhoneNumber,
                Address = e.Address,
                DateOfBirth = e.DateOfBirth,
                Position = e.Position,
                HireDate = e.HireDate,
                EmergencyContact = e.EmergencyContact,
                EmergencyContactPhone = e.EmergencyContactPhone,
                EmploymentType = e.EmploymentType,
                Status = e.Status,
                Department = e.Department != null ? new Department
                {
                    Id = e.Department.Id,
                    Name = e.Department.Name,
                    Location = e.Department.Location,
                    Budget = e.Department.Budget,
                    ManagerId = e.Department.ManagerId,
                    Description = e.Department.Description
                } : null
            })
            .FirstOrDefaultAsync();

        if (employee == null)
        {
            return NotFound();
        }

        return Ok(employee);
    }

    public class EmployeeUpsertDto
    {
        public int? Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int DepartmentId { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Position { get; set; }
        public DateTime? HireDate { get; set; }
        public string? EmergencyContact { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public string? EmploymentType { get; set; }
        public string? Status { get; set; }
        public string? Password { get; set; }
    }

    // POST: api/employees
    [HttpPost]
    public async Task<ActionResult<Employee>> PostEmployee(EmployeeUpsertDto employeeDto)
    {
        // Basic validation to avoid opaque DB errors
        if (string.IsNullOrWhiteSpace(employeeDto.Name) || string.IsNullOrWhiteSpace(employeeDto.Email))
        {
            return BadRequest(new { message = "Name and email are required." });
        }

        if (string.IsNullOrWhiteSpace(employeeDto.Password))
        {
            return BadRequest(new { message = "Password is required for new employees." });
        }

        var normalizedEmail = employeeDto.Email.Trim().ToLowerInvariant();
        var emailExists = await _context.Employees.AnyAsync(e => e.Email.ToLower() == normalizedEmail);
        if (emailExists)
        {
            return Conflict(new { message = "An employee with this email already exists." });
        }

        var departmentExists = await _context.Departments.AnyAsync(d => d.Id == employeeDto.DepartmentId);
        if (!departmentExists)
        {
            return BadRequest(new { message = "Selected department does not exist." });
        }

        var employee = new Employee
        {
            Name = employeeDto.Name,
            Email = employeeDto.Email.Trim(),
            DepartmentId = employeeDto.DepartmentId,
            PhoneNumber = employeeDto.PhoneNumber,
            Address = employeeDto.Address,
            DateOfBirth = employeeDto.DateOfBirth,
            Position = employeeDto.Position,
            HireDate = employeeDto.HireDate,
            EmergencyContact = employeeDto.EmergencyContact,
            EmergencyContactPhone = employeeDto.EmergencyContactPhone,
            EmploymentType = employeeDto.EmploymentType,
            Status = employeeDto.Status
        };

        if (employee.HireDate == null)
        {
            employee.HireDate = DateTime.UtcNow;
        }

        if (string.IsNullOrEmpty(employee.Status))
        {
            employee.Status = "Active";
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(employeeDto.Password);
        var user = new User
        {
            Email = employee.Email,
            PasswordHash = passwordHash,
            Name = employee.Name,
            Role = "Employee"
        };

        try
        {
            _context.Employees.Add(employee);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return StatusCode(500, new { message = "Failed to add employee due to a database error." });
        }

        return CreatedAtAction(nameof(GetEmployee), new { id = employee.Id }, employee);
    }

    // PUT: api/employees/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutEmployee(int id, EmployeeUpsertDto employeeDto)
    {
        if (employeeDto.Id.HasValue && id != employeeDto.Id.Value)
        {
            return BadRequest();
        }

        var employee = await _context.Employees.FindAsync(id);
        if (employee == null)
        {
            return NotFound();
        }

        var oldEmail = employee.Email;
        employee.Name = employeeDto.Name;
        employee.Email = employeeDto.Email.Trim();
        employee.DepartmentId = employeeDto.DepartmentId;
        employee.PhoneNumber = employeeDto.PhoneNumber;
        employee.Address = employeeDto.Address;
        employee.DateOfBirth = employeeDto.DateOfBirth;
        employee.Position = employeeDto.Position;
        employee.HireDate = employeeDto.HireDate;
        employee.EmergencyContact = employeeDto.EmergencyContact;
        employee.EmergencyContactPhone = employeeDto.EmergencyContactPhone;
        employee.EmploymentType = employeeDto.EmploymentType;
        employee.Status = employeeDto.Status;

        try
        {
            if (!string.IsNullOrWhiteSpace(employeeDto.Password))
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == oldEmail);
                if (user == null)
                {
                    user = new User
                    {
                        Email = employee.Email,
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword(employeeDto.Password),
                        Name = employee.Name,
                        Role = "Employee"
                    };
                    _context.Users.Add(user);
                }
                else
                {
                    user.Email = employee.Email;
                    user.Name = employee.Name;
                    user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(employeeDto.Password);
                }
            }
            else if (!string.Equals(oldEmail, employee.Email, StringComparison.OrdinalIgnoreCase))
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == oldEmail);
                if (user != null)
                {
                    user.Email = employee.Email;
                    user.Name = employee.Name;
                }
            }

            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!EmployeeExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // DELETE: api/employees/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null)
        {
            return NotFound();
        }

        _context.Employees.Remove(employee);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool EmployeeExists(int id)
    {
        return _context.Employees.Any(e => e.Id == id);
    }
}
