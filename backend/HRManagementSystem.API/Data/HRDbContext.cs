using Microsoft.EntityFrameworkCore;
using HRManagementSystem.API.Models;

namespace HRManagementSystem.API.Data;

public class HRDbContext : DbContext
{
    public HRDbContext(DbContextOptions<HRDbContext> options) : base(options)
    {
    }

    public DbSet<Employee> Employees { get; set; }
    public DbSet<Department> Departments { get; set; }
    public DbSet<Candidate> Candidates { get; set; }
    public DbSet<Salary> Salaries { get; set; }
    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Employee configuration
        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
            entity.HasIndex(e => e.Email).IsUnique();
            
            entity.HasOne(e => e.Department)
                .WithMany(d => d.Employees)
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Department configuration
        modelBuilder.Entity<Department>(entity =>
        {
            entity.HasKey(d => d.Id);
            entity.Property(d => d.Name).IsRequired().HasMaxLength(200);
            entity.Property(d => d.Location).IsRequired().HasMaxLength(200);
            
            entity.HasOne(d => d.Manager)
                .WithMany()
                .HasForeignKey(d => d.ManagerId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Candidate configuration
        modelBuilder.Entity<Candidate>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Name).IsRequired().HasMaxLength(200);
            entity.Property(c => c.Email).IsRequired().HasMaxLength(200);
            entity.Property(c => c.Phone).IsRequired().HasMaxLength(50);
            entity.Property(c => c.AppliedPosition).IsRequired().HasMaxLength(200);
            
            entity.HasOne(c => c.AppliedDepartment)
                .WithMany(d => d.Candidates)
                .HasForeignKey(c => c.AppliedDepartmentId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Salary configuration
        modelBuilder.Entity<Salary>(entity =>
        {
            entity.HasKey(s => s.Id);
            entity.Property(s => s.BaseAmount).HasColumnType("decimal(18,2)");
            entity.Property(s => s.Bonus).HasColumnType("decimal(18,2)");
            entity.Property(s => s.GrossAmount).HasColumnType("decimal(18,2)");
            entity.Property(s => s.TaxDeductions).HasColumnType("decimal(18,2)");
            entity.Property(s => s.NetAmount).HasColumnType("decimal(18,2)");
            
            entity.HasOne(s => s.Employee)
                .WithMany(e => e.Salaries)
                .HasForeignKey(s => s.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(s => s.PreviousSalary)
                .WithMany()
                .HasForeignKey(s => s.PreviousSalaryId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(200);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Name).IsRequired().HasMaxLength(200);
            entity.Property(u => u.Role).IsRequired().HasMaxLength(50);
        });
    }
}
