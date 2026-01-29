import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'hr-app';
  currentUser$ = this.authService.currentUser$;
  showToolbar = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Hide toolbar on login page
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showToolbar = !event.url.includes('/login');
    });
  }

  ngOnInit(): void {
    // Redirect to login if not authenticated
    if (!this.authService.isAuthenticated() && !this.router.url.includes('/login')) {
      this.router.navigate(['/login']);
    }
    
    // Check initial route
    this.showToolbar = !this.router.url.includes('/login');
  }

  onLogout(): void {
    this.authService.logout();
  }

  isAdminRole(role?: string): boolean {
    const normalized = (role || '').toLowerCase();
    return normalized === 'hr' || normalized === 'admin';
  }

  isEmployeeRole(role?: string): boolean {
    const normalized = (role || '').toLowerCase();
    return normalized === 'employee';
  }
}
