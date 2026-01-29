using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HRManagementSystem.API.Data;
using HRManagementSystem.API.Models;
using System.Linq;

namespace HRManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalariesController : ControllerBase
{
    private readonly HRDbContext _context;

    public SalariesController(HRDbContext context)
    {
        _context = context;
    }

    // GET: api/salaries
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Salary>>> GetSalaries()
    {
        var salaries = await _context.Salaries
            .Include(s => s.Employee)
            .Select(s => new Salary
            {
                Id = s.Id,
                EmployeeId = s.EmployeeId,
                BaseAmount = s.BaseAmount,
                Bonus = s.Bonus,
                GrossAmount = s.GrossAmount,
                TaxDeductions = s.TaxDeductions,
                NetAmount = s.NetAmount,
                PaymentFrequency = s.PaymentFrequency,
                EffectiveDate = s.EffectiveDate,
                PreviousSalaryId = s.PreviousSalaryId,
                AdjustmentType = s.AdjustmentType,
                Notes = s.Notes,
                Employee = s.Employee != null ? new Employee
                {
                    Id = s.Employee.Id,
                    Name = s.Employee.Name,
                    Email = s.Employee.Email,
                    Position = s.Employee.Position
                } : null
            })
            .ToListAsync();

        // Ensure calculated fields are populated
        foreach (var salary in salaries)
        {
            CalculateSalaryFields(salary);
        }

        return Ok(salaries);
    }

    // GET: api/salaries/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Salary>> GetSalary(int id)
    {
        var salary = await _context.Salaries
            .Include(s => s.Employee)
            .Where(s => s.Id == id)
            .Select(s => new Salary
            {
                Id = s.Id,
                EmployeeId = s.EmployeeId,
                BaseAmount = s.BaseAmount,
                Bonus = s.Bonus,
                GrossAmount = s.GrossAmount,
                TaxDeductions = s.TaxDeductions,
                NetAmount = s.NetAmount,
                PaymentFrequency = s.PaymentFrequency,
                EffectiveDate = s.EffectiveDate,
                PreviousSalaryId = s.PreviousSalaryId,
                AdjustmentType = s.AdjustmentType,
                Notes = s.Notes,
                Employee = s.Employee != null ? new Employee
                {
                    Id = s.Employee.Id,
                    Name = s.Employee.Name,
                    Email = s.Employee.Email,
                    Position = s.Employee.Position
                } : null
            })
            .FirstOrDefaultAsync();

        if (salary == null)
        {
            return NotFound();
        }

        CalculateSalaryFields(salary);
        return Ok(salary);
    }

    // GET: api/salaries/employee/5
    [HttpGet("employee/{employeeId}")]
    public async Task<ActionResult<IEnumerable<Salary>>> GetSalariesByEmployee(int employeeId)
    {
        var salaries = await _context.Salaries
            .Where(s => s.EmployeeId == employeeId)
            .Include(s => s.Employee)
            .OrderByDescending(s => s.EffectiveDate)
            .ToListAsync();

        foreach (var salary in salaries)
        {
            CalculateSalaryFields(salary);
        }

        return salaries;
    }

    // GET: api/salaries/employee/5/current
    [HttpGet("employee/{employeeId}/current")]
    public async Task<ActionResult<Salary>> GetCurrentSalaryForEmployee(int employeeId)
    {
        var salary = await _context.Salaries
            .Where(s => s.EmployeeId == employeeId)
            .OrderByDescending(s => s.EffectiveDate)
            .FirstOrDefaultAsync();

        if (salary == null)
        {
            return NotFound();
        }

        CalculateSalaryFields(salary);
        return salary;
    }

    // POST: api/salaries
    [HttpPost]
    public async Task<ActionResult<Salary>> PostSalary(Salary salary)
    {
        // Calculate derived fields before saving
        CalculateSalaryFields(salary);

        if (salary.EffectiveDate == default)
        {
            salary.EffectiveDate = DateTime.UtcNow;
        }

        _context.Salaries.Add(salary);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSalary), new { id = salary.Id }, salary);
    }

    // PUT: api/salaries/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutSalary(int id, Salary salary)
    {
        if (id != salary.Id)
        {
            return BadRequest();
        }

        // Recalculate derived fields
        CalculateSalaryFields(salary);

        _context.Entry(salary).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!SalaryExists(id))
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

    // DELETE: api/salaries/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSalary(int id)
    {
        var salary = await _context.Salaries.FindAsync(id);
        if (salary == null)
        {
            return NotFound();
        }

        _context.Salaries.Remove(salary);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool SalaryExists(int id)
    {
        return _context.Salaries.Any(s => s.Id == id);
    }

    private void CalculateSalaryFields(Salary salary)
    {
        salary.GrossAmount = salary.BaseAmount + (salary.Bonus ?? 0);
        salary.TaxDeductions = salary.GrossAmount * 0.2m; // 20% tax
        salary.NetAmount = salary.GrossAmount - salary.TaxDeductions;
    }
}
