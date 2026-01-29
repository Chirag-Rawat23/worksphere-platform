namespace HRManagementSystem.API.Models;

public class Employee
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
    
    // Personal Information (Optional)
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public DateTime? DateOfBirth { get; set; }
    
    // Employment Information
    public string? Position { get; set; }
    public DateTime? HireDate { get; set; }
    
    // Additional Optional Fields
    public string? EmergencyContact { get; set; }
    public string? EmergencyContactPhone { get; set; }
    public string? EmploymentType { get; set; } // 'Full-Time', 'Part-Time', 'Contract'
    public string? Status { get; set; } // 'Active', 'On-Leave', 'Terminated'
    
    // Navigation properties
    public Department? Department { get; set; }
    public ICollection<Salary> Salaries { get; set; } = new List<Salary>();
}
