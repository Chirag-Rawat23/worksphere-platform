namespace HRManagementSystem.API.Models;

public class Candidate
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string AppliedPosition { get; set; } = string.Empty;
    public int? AppliedDepartmentId { get; set; }
    public string? Resume { get; set; }
    public string Status { get; set; } = "Applied"; // 'Applied', 'Interviewed', 'Hired', 'Rejected'
    public DateTime? ApplicationDate { get; set; }
    
    // Navigation properties
    public Department? AppliedDepartment { get; set; }
}
