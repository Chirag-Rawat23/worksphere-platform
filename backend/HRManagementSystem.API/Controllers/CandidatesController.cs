using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HRManagementSystem.API.Data;
using HRManagementSystem.API.Models;
using System.Linq;

namespace HRManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CandidatesController : ControllerBase
{
    private readonly HRDbContext _context;

    public CandidatesController(HRDbContext context)
    {
        _context = context;
    }

    // GET: api/candidates
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Candidate>>> GetCandidates()
    {
        var candidates = await _context.Candidates
            .Include(c => c.AppliedDepartment)
            .Select(c => new Candidate
            {
                Id = c.Id,
                Name = c.Name,
                Email = c.Email,
                Phone = c.Phone,
                AppliedPosition = c.AppliedPosition,
                AppliedDepartmentId = c.AppliedDepartmentId,
                Resume = c.Resume,
                Status = c.Status,
                ApplicationDate = c.ApplicationDate,
                AppliedDepartment = c.AppliedDepartment != null ? new Department
                {
                    Id = c.AppliedDepartment.Id,
                    Name = c.AppliedDepartment.Name,
                    Location = c.AppliedDepartment.Location
                } : null
            })
            .ToListAsync();
        return Ok(candidates);
    }

    // GET: api/candidates/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Candidate>> GetCandidate(int id)
    {
        var candidate = await _context.Candidates
            .Include(c => c.AppliedDepartment)
            .Where(c => c.Id == id)
            .Select(c => new Candidate
            {
                Id = c.Id,
                Name = c.Name,
                Email = c.Email,
                Phone = c.Phone,
                AppliedPosition = c.AppliedPosition,
                AppliedDepartmentId = c.AppliedDepartmentId,
                Resume = c.Resume,
                Status = c.Status,
                ApplicationDate = c.ApplicationDate,
                AppliedDepartment = c.AppliedDepartment != null ? new Department
                {
                    Id = c.AppliedDepartment.Id,
                    Name = c.AppliedDepartment.Name,
                    Location = c.AppliedDepartment.Location
                } : null
            })
            .FirstOrDefaultAsync();

        if (candidate == null)
        {
            return NotFound();
        }

        return Ok(candidate);
    }

    // GET: api/candidates/department/5
    [HttpGet("department/{departmentId}")]
    public async Task<ActionResult<IEnumerable<Candidate>>> GetCandidatesByDepartment(int departmentId)
    {
        return await _context.Candidates
            .Where(c => c.AppliedDepartmentId == departmentId)
            .Include(c => c.AppliedDepartment)
            .ToListAsync();
    }

    // GET: api/candidates/status/Applied
    [HttpGet("status/{status}")]
    public async Task<ActionResult<IEnumerable<Candidate>>> GetCandidatesByStatus(string status)
    {
        return await _context.Candidates
            .Where(c => c.Status == status)
            .Include(c => c.AppliedDepartment)
            .ToListAsync();
    }

    // POST: api/candidates
    [HttpPost]
    public async Task<ActionResult<Candidate>> PostCandidate(Candidate candidate)
    {
        if (candidate.ApplicationDate == null)
        {
            candidate.ApplicationDate = DateTime.UtcNow;
        }

        if (string.IsNullOrEmpty(candidate.Status))
        {
            candidate.Status = "Applied";
        }

        _context.Candidates.Add(candidate);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCandidate), new { id = candidate.Id }, candidate);
    }

    // PUT: api/candidates/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutCandidate(int id, Candidate candidate)
    {
        if (id != candidate.Id)
        {
            return BadRequest();
        }

        _context.Entry(candidate).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!CandidateExists(id))
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

    // PATCH: api/candidates/5/status
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateCandidateStatus(int id, [FromBody] UpdateStatusRequest request)
    {
        var candidate = await _context.Candidates.FindAsync(id);
        if (candidate == null)
        {
            return NotFound();
        }

        candidate.Status = request.Status;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/candidates/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCandidate(int id)
    {
        var candidate = await _context.Candidates.FindAsync(id);
        if (candidate == null)
        {
            return NotFound();
        }

        _context.Candidates.Remove(candidate);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool CandidateExists(int id)
    {
        return _context.Candidates.Any(c => c.Id == id);
    }
}
