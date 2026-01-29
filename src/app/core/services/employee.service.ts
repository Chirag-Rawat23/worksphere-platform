import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Employee } from '../../shared/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) { }

  // CREATE
  addEmployee(employee: Omit<Employee, 'id'>): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  // READ
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  // UPDATE
  updateEmployee(employee: Employee): Observable<any> {
    return this.http.put(`${this.apiUrl}/${employee.id}`, employee);
  }
  // Search employees by name, email, or position
  // Note: Backend doesn't have search endpoint, so we get all and filter client-side
  searchEmployees(term: string): Observable<Employee[]> {
    if (!term.trim()) {
      return this.getEmployees();
    }
    return this.getEmployees().pipe(
      map(employees => employees.filter(employee => 
        employee.name.toLowerCase().includes(term.toLowerCase()) ||
        employee.email.toLowerCase().includes(term.toLowerCase()) ||
        (employee.position && employee.position.toLowerCase().includes(term.toLowerCase()))
      ))
    );
  }

  // DELETE
  deleteEmployee(id: number): Observable<Employee> {
    return this.http.delete<Employee>(`${this.apiUrl}/${id}`);
  }

  // EXTRA: Get employees by department
  // Note: Backend doesn't have filter endpoint, so we get all and filter client-side
  getEmployeesByDepartment(departmentId: number): Observable<Employee[]> {
    return this.getEmployees().pipe(
      map(employees => employees.filter(employee => employee.departmentId === departmentId))
    );
  }
}