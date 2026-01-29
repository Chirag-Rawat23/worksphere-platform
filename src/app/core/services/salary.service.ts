import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { Salary } from '../../shared/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SalaryService {
  private apiUrl = `${environment.apiUrl}/salaries`;

  constructor(private http: HttpClient) { }

  /**
   * Get all salaries with calculated fields
   */
  getSalaries(): Observable<Salary[]> {
    return this.http.get<Salary[]>(this.apiUrl).pipe(
      map(salaries => salaries.map(s => this.ensureCalculatedFields(s)))
    );
  }

  /**
   * Get a specific salary by ID
   */
  getSalary(id: number): Observable<Salary> {
    return this.http.get<Salary>(`${this.apiUrl}/${id}`).pipe(
      map(salary => this.ensureCalculatedFields(salary))
    );
  }

  /**
   * Get all salaries for a specific employee
   */
  getSalariesByEmployee(employeeId: number): Observable<Salary[]> {
    return this.http.get<Salary[]>(`${this.apiUrl}/employee/${employeeId}`).pipe(
      map(salaries => salaries.map(s => this.ensureCalculatedFields(s)))
    );
  }
  /**
   * Get the current/latest salary for an employee
   */
  getCurrentSalaryForEmployee(employeeId: number): Observable<Salary | null> {
    return this.http.get<Salary | null>(`${this.apiUrl}/employee/${employeeId}/current`).pipe(
      map(salary => salary ? this.ensureCalculatedFields(salary) : null),
      catchError(error => {
        console.error('Error getting current salary:', error);
        return of(null);
      })
    );
  }

  /**
   * Add a new salary record
   */
  addSalary(salaryData: Omit<Salary, 'id' | 'grossAmount' | 'taxDeductions' | 'netAmount'>): Observable<Salary> {
    const salaryWithCalculations = this.ensureCalculatedFields({
      ...salaryData,
      bonus: salaryData.bonus || 0
    } as Salary);

    return this.http.post<Salary>(this.apiUrl, salaryWithCalculations).pipe(
      map(createdSalary => this.ensureCalculatedFields(createdSalary))
    );
  }

  /**
   * Update an existing salary record
   */
  updateSalary(salary: Salary): Observable<Salary> {
    const updatedSalary = this.ensureCalculatedFields({
      ...salary,
      bonus: salary.bonus || 0
    });

    return this.http.put<Salary>(`${this.apiUrl}/${salary.id}`, updatedSalary).pipe(
      map(updatedSalary => this.ensureCalculatedFields(updatedSalary))
    );
  }

  /**
   * Delete a salary record
   */
  deleteSalary(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Search salaries by employee name or other criteria
   * Note: Backend doesn't have search endpoint, so we get all and filter client-side
   */
  searchSalaries(term: string): Observable<Salary[]> {
    return this.getSalaries().pipe(
      map(salaries => salaries.filter(salary => 
        salary.employeeId.toString().includes(term) ||
        salary.baseAmount.toString().includes(term)
      ))
    );
  }

  /**
   * Ensures all calculated fields are populated
   */
  private ensureCalculatedFields(salary: Salary): Salary {
    if (!salary) return salary;
    
    const bonus = salary.bonus || 0;
    const grossAmount = salary.baseAmount + bonus;
    const taxDeductions = this.calculateTax(grossAmount);
    const netAmount = grossAmount - taxDeductions;

    return {
      ...salary,
      grossAmount,
      taxDeductions,
      netAmount,
      bonus: salary.bonus
    };
  }

  /**
   * Calculate tax deductions (20% of gross amount)
   */
  private calculateTax(grossAmount: number): number {
    return grossAmount * 0.2;
  }

  /**
   * Calculate net amount (gross - tax)
   */
  private calculateNetAmount(grossAmount: number, taxDeductions: number): number {
    return grossAmount - taxDeductions;
  }
}