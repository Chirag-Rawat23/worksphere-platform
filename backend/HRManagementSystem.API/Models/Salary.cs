namespace HRManagementSystem.API.Models;

public class Salary
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    
    // Core compensation (required)
    public decimal BaseAmount { get; set; }
    
    // Optional fields
    public decimal? Bonus { get; set; }
    
    // Calculated fields
    public decimal GrossAmount { get; set; } // baseAmount + (bonus ?? 0)
    public decimal TaxDeductions { get; set; } // Calculated automatically
    public decimal NetAmount { get; set; } // grossAmount - taxDeductions
    
    // Tracking
    public string PaymentFrequency { get; set; } = "Monthly"; // 'Monthly', 'Bi-Weekly', 'Weekly'
    public DateTime EffectiveDate { get; set; }
    public int? PreviousSalaryId { get; set; }
    
    // Minimal adjustment info
    public string? AdjustmentType { get; set; } // 'raise', 'bonus', 'correction'
    public string? Notes { get; set; }
    
    // Navigation properties
    public Employee? Employee { get; set; }
    public Salary? PreviousSalary { get; set; }
}
