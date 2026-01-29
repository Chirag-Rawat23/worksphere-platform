namespace HRManagementSystem.API.Models;

public class Department
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public decimal? Budget { get; set; }
    public int? ManagerId { get; set; }
    public string? Description { get; set; }
    
    // Navigation properties
    public Employee? Manager { get; set; }
    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    public ICollection<Candidate> Candidates { get; set; } = new List<Candidate>();
}
