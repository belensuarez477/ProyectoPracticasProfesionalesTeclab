import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private usersKey = 'beautysystem_users';
  private currentUserKey = 'beautysystem_current_user';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  private loadUserFromStorage(): User | null {
    if (typeof window === 'undefined' || !localStorage) return null;
    const userJson = localStorage.getItem(this.currentUserKey);
    return userJson ? JSON.parse(userJson) : null;
  }

  register(name: string, email: string, phone: string, password: string): boolean {
    if (typeof window === 'undefined' || !localStorage) return false;
    
    const users = this.getStoredUsers();
    
    if (users.some(u => u.email === email)) {
      return false;
    }

    const newUser: User & { password: string } = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      password
    };

    users.push(newUser);
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    return true;
  }

  login(email: string, password: string): boolean {
    if (typeof window === 'undefined' || !localStorage) return false;
    
    const users = this.getStoredUsers();
    const user = users.find(u => u.email === email && (u as any).password === password);

    if (user) {
      const currentUser: User = { id: user.id, name: user.name, email: user.email, phone: user.phone };
      localStorage.setItem(this.currentUserKey, JSON.stringify(currentUser));
      this.currentUserSubject.next(currentUser);
      return true;
    }
    return false;
  }

  logout(): void {
    if (typeof window === 'undefined' || !localStorage) return;
    localStorage.removeItem(this.currentUserKey);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private getStoredUsers(): any[] {
    if (typeof window === 'undefined' || !localStorage) return [];
    const usersJson = localStorage.getItem(this.usersKey);
    return usersJson ? JSON.parse(usersJson) : [];
  }
}
