import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeService } from '../../../core/services/employee.service';
import { DepartmentService } from '../../../core/services/department.service';
import { SalaryService } from '../../../core/services/salary.service';
import { Employee, Department } from '../../../shared/models';

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss']
})
export class EmployeeFormComponent implements OnInit {
  form: FormGroup;
  salaryForm: FormGroup;
  departments: Department[] = [];
  isEditMode = false;
  isLoading = false;
  showSalarySection = false;

  // Salary frequency options
  paymentFrequencies = ['Monthly', 'Bi-Weekly', 'Weekly'];

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private salaryService: SalaryService,
    private route: ActivatedRoute,
    public router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      departmentId: [null, Validators.required],
      password: [''],
      
      // Personal Information
      phoneNumber: [''],
      address: [''],
      dateOfBirth: ['', [this.ddMmYyyyValidator()]],
      
      // Employment Information
      position: [''],
      hireDate: [new Date(), Validators.required],
      
      // Additional Information
      emergencyContact: [''],
      emergencyContactPhone: [''],
      employmentType: ['Full-Time'],
      status: ['Active']
    });

    this.salaryForm = this.fb.group({
      baseAmount: [null, [Validators.required, Validators.min(0)]],
      paymentFrequency: ['Monthly', Validators.required],
      effectiveDate: [new Date(), Validators.required],
      bonus: [null, [Validators.min(0)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadDepartments();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.form.get('password')?.setValidators([Validators.minLength(6)]);
      this.loadEmployee(+id);
    } else {
      // Show salary section only for new employees
      this.showSalarySection = true;
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  loadDepartments(): void {
    this.departmentService.getDepartments().subscribe({
      next: (departments) => this.departments = departments,
      error: (err) => this.showError('Failed to load departments')
    });
  }

  loadEmployee(id: number): void {
    this.isLoading = true;
    this.employeeService.getEmployee(id).subscribe({
      next: (employee) => {
        const dateOfBirth = this.formatIsoToDdMmYyyy(employee.dateOfBirth);
        this.form.patchValue({
          ...employee,
          dateOfBirth: dateOfBirth ?? employee.dateOfBirth,
          password: ''
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.showError('Failed to load employee');
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid && (!this.showSalarySection || this.salaryForm.valid)) {
      this.isLoading = true;
      const employee = { ...this.form.value } as any;

      // The backend model has a non-nullable int Id, so sending `id: null` on create
      // triggers a 400 validation error. Drop it when creating a new employee.
      if (!this.isEditMode) {
        delete employee.id;
      }

      // Convert DD/MM/YYYY date strings into ISO dates for the backend.
      employee.dateOfBirth = this.parseDdMmYyyy(employee.dateOfBirth) ?? employee.dateOfBirth;

      const employeeOperation = this.isEditMode
        ? this.employeeService.updateEmployee(employee)
        : this.employeeService.addEmployee(employee);

      employeeOperation.subscribe({
        next: (savedEmployee) => {
          if (!this.isEditMode && this.showSalarySection) {
            // Create salary for new employee
            this.createSalaryForEmployee(savedEmployee);
          } else {
            this.showSuccess();
            this.router.navigate(['/employees']);
          }
        },
        error: (err) => {
          // Surface backend errors in a readable way for debugging and UX
          // (e.g., ASP.NET validation errors use `title` + `errors`).
          // eslint-disable-next-line no-console
          console.error('Add/Update employee failed:', err);
          const backendMessage = err?.error?.message;
          const backendTitle = err?.error?.title;
          const validationErrors = err?.error?.errors as Record<string, string[]> | undefined;
          const firstValidationMessage = validationErrors
            ? Object.values(validationErrors).flat()[0]
            : undefined;
          this.showError(
            backendMessage ||
            backendTitle ||
            firstValidationMessage ||
            `Failed to ${this.isEditMode ? 'update' : 'add'} employee (status ${err?.status ?? 'unknown'})`
          );
          this.isLoading = false;
        }
      });
    }
  }

  private createSalaryForEmployee(employee: Employee): void {
    const salaryData = {
      employeeId: employee.id,
      baseAmount: this.salaryForm.value.baseAmount ?? 0,
      paymentFrequency: this.salaryForm.value.paymentFrequency,
      effectiveDate: this.salaryForm.value.effectiveDate,
      bonus: this.salaryForm.value.bonus ?? 0,
      notes: this.salaryForm.value.notes
    };

    this.salaryService.addSalary(salaryData).subscribe({
      next: () => {
        this.showSuccess();
        this.router.navigate(['/employees']);
      },
      error: (err) => {
        console.log("salary not created");
        this.showError('Employee created but failed to create salary record');
        this.router.navigate(['/employees']);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private showSuccess(): void {
    this.snackBar.open(
      `Employee ${this.isEditMode ? 'updated' : 'added'} successfully!`,
      'Close',
      { duration: 3000 }
    );
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  // Helper method to format date for display
  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString();
  }

  onDateInput(controlName: string, event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (!input) {
      return;
    }

    const digits = input.value.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }

    if (formatted !== input.value) {
      input.value = formatted;
    }

    this.form.get(controlName)?.setValue(formatted, { emitEvent: false });
  }

  private parseDdMmYyyy(value: unknown): string | null {
    if (!value || typeof value !== 'string') {
      return null;
    }
    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) {
      return null;
    }
    const day = Number(match[1]);
    const month = Number(match[2]) - 1;
    const year = Number(match[3]);
    const date = new Date(year, month, day);
    // Reject invalid dates such as 32/13/2026.
    const isSameDate =
      date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day;
    if (Number.isNaN(date.getTime()) || !isSameDate) {
      return null;
    }
    return date.toISOString();
  }

  private formatIsoToDdMmYyyy(value: unknown): string | null {
    if (!value) {
      return null;
    }
    const date = new Date(value as string);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    const day = `${date.getDate()}`.padStart(2, '0');
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private ddMmYyyyValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }
      if (typeof value !== 'string') {
        return null;
      }
      const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!match) {
        return { invalidDate: true };
      }
      const day = Number(match[1]);
      const month = Number(match[2]) - 1;
      const year = Number(match[3]);
      const date = new Date(year, month, day);
      const isSameDate =
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day;
      return isSameDate ? null : { invalidDate: true };
    };
  }
}
