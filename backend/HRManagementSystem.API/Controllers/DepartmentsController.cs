using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HRManagementSystem.API.Data;
using HRManagementSystem.API.Models;
using System.Linq;

namespace HRManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DepartmentsController : ControllerBase
{
    private readonly HRDbContext _context;

    public DepartmentsController(HRDbContext context)
    {
        _context = context;
    }

    // GET: api/departments
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Department>>> GetDepartments()
    {
        var departments = await _context.Departments
            .Include(d => d.Manager)
            .Select(d => new Department
            {
                Id = d.Id,
                Name = d.Name,
                Location = d.Location,
                Budget = d.Budget,
                ManagerId = d.ManagerId,
                Description = d.Description,
                Manager = d.Manager != null ? new Employee
                {
                    Id = d.Manager.Id,
                    Name = d.Manager.Name,
                    Email = d.Manager.Email
                } : null
            })
            .ToListAsync();
        return Ok(departments);
    }

    // GET: api/departments/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Department>> GetDepartment(int id)
    {
        var department = await _context.Departments
            .Include(d => d.Manager)
            .Where(d => d.Id == id)
            .Select(d => new Department
            {
                Id = d.Id,
                Name = d.Name,
                Location = d.Location,
                Budget = d.Budget,
                ManagerId = d.ManagerId,
                Description = d.Description,
                Manager = d.Manager != null ? new Employee
                {
                    Id = d.Manager.Id,
                    Name = d.Manager.Name,
                    Email = d.Manager.Email
                } : null
            })
            .FirstOrDefaultAsync();

        if (department == null)
        {
            return NotFound();
        }

        return Ok(department);
    }

    // POST: api/departments
    [HttpPost]
    public async Task<ActionResult<Department>> PostDepartment(Department department)
    {
        _context.Departments.Add(department);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetDepartment), new { id = department.Id }, department);
    }

    // PUT: api/departments/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutDepartment(int id, Department department)
    {
        if (id != department.Id)
        {
            return BadRequest();
        }

        _context.Entry(department).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!DepartmentExists(id))
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

    // DELETE: api/departments/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDepartment(int id)
    {
        var department = await _context.Departments.FindAsync(id);
        if (department == null)
        {
            return NotFound();
        }

        _context.Departments.Remove(department);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool DepartmentExists(int id)
    {
        return _context.Departments.Any(d => d.Id == id);
    }
}
