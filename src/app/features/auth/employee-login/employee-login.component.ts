import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-employee-login',
  templateUrl: './employee-login.component.html',
  styleUrls: ['./employee-login.component.scss']
})
export class EmployeeLoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  showCredentials = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          const role = (response.role || '').toLowerCase();
          if (role !== 'employee') {
            this.authService.clearAuthData();
            this.snackBar.open('This login is for employees only.', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            return;
          }
          this.router.navigate(['/dashboard']);
          this.snackBar.open('Login successful!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (err) => {
          this.isLoading = false;
          const errorMessage = err.error?.message || 'Login failed. Please check your credentials.';
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleCredentials(): void {
    this.showCredentials = !this.showCredentials;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
