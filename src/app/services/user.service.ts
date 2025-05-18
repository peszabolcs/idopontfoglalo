import { Injectable } from '@angular/core';
import { IndexedDBService } from './indexed-db.service';
import { User } from '../models';
import { FirebaseService } from './firebase.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> =
    this.currentUserSubject.asObservable();
  private readonly TOKEN_KEY = 'auth_token';
  private readonly TOKEN_EXPIRY_KEY = 'auth_token_expiry';
  private readonly USER_KEY = 'currentUser';
  // Token élettartama 24 óra (milliszekundumban)
  private readonly TOKEN_LIFETIME = 24 * 60 * 60 * 1000;

  constructor(
    private indexedDB: IndexedDBService,
    private firebaseService: FirebaseService,
    private router: Router
  ) {
    // Check localStorage for saved user session
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    // Ellenőrizzük először a token érvényességét
    if (!this.isTokenValid()) {
      this.clearStoredUserData();
      return;
    }

    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        this.clearStoredUserData();
      }
    }
  }

  private saveUserToStorage(user: User | null): void {
    if (user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } else {
      this.clearStoredUserData();
    }
  }

  private setAuthToken(token: string): void {
    // Token mentése
    localStorage.setItem(this.TOKEN_KEY, token);
    // Lejárati idő mentése (24 óra)
    const expiryTime = new Date().getTime() + this.TOKEN_LIFETIME;
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private clearStoredUserData(): void {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    this.currentUserSubject.next(null);
  }

  private isTokenValid(): boolean {
    const token = this.getStoredToken();
    if (!token) return false;

    const expiryTimeStr = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiryTimeStr) return false;

    try {
      const expiryTime = parseInt(expiryTimeStr, 10);
      const now = new Date().getTime();
      return now < expiryTime;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return false;
    }
  }

  async register(
    userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>
  ): Promise<User | null> {
    try {
      // Firebase Authentication and Firestore storage
      const result = await this.firebaseService.registerUser(
        userData.email,
        userData.password,
        userData
      );

      // Get the user from Firestore
      const user = await this.firebaseService.getUserById(result.uid);

      if (user) {
        // Token mentése, ha van
        if (result.token) {
          this.setAuthToken(result.token);
        }

        // Also store in IndexedDB for offline capability
        const indexDbUser = {
          ...user,
          // For IndexedDB, we'll use the string ID directly
        };

        await this.indexedDB.addUser(indexDbUser);

        this.currentUserSubject.next(user);
        this.saveUserToStorage(user);
      }

      return user;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<User | null> {
    try {
      // Firebase Authentication
      const result = await this.firebaseService.loginUser(email, password);

      if (!result.uid) {
        return null;
      }

      // Token mentése, ha van
      if (result.token) {
        this.setAuthToken(result.token);
      }

      // Get user data from Firestore
      const user = await this.firebaseService.getUserById(result.uid);

      if (user) {
        // Update IndexedDB for offline capability
        const indexedDBUser = await this.indexedDB.getUserById(result.uid);
        if (indexedDBUser) {
          await this.indexedDB.updateUser({
            ...indexedDBUser,
            lastLogin: new Date(),
          });
        } else {
          // Create a copy for IndexedDB
          const indexDbUser = {
            ...user,
            // Use string ID directly
          };

          await this.indexedDB.addUser(indexDbUser);
        }

        this.currentUserSubject.next(user);
        this.saveUserToStorage(user);
      }

      return user;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.firebaseService.logoutUser();
      this.clearStoredUserData();
      this.router.navigate(['/bejelentkezes']);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }

  isLoggedIn(): boolean {
    // Ellenőrizzük, hogy van-e érvényes tokenje a felhasználónak
    // és hogy van-e bejelentkezett felhasználónk
    return this.isTokenValid() && !!this.currentUserSubject.value;
  }

  getAuthToken(): string | null {
    // Csak akkor adjuk vissza a tokent, ha érvényes
    return this.isTokenValid() ? this.getStoredToken() : null;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return !!user && user.isAdmin === true && this.isLoggedIn();
  }

  getCurrentUser(): User | null {
    // Csak akkor adjuk vissza a felhasználót, ha be van jelentkezve
    return this.isLoggedIn() ? this.currentUserSubject.value : null;
  }

  // Token élettartamának automatikus frissítése aktív használat esetén
  refreshToken(): void {
    if (this.isLoggedIn()) {
      const token = this.getStoredToken();
      if (token) {
        this.setAuthToken(token); // Ez újraállítja a lejárati időt
      }
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      // First try to get from Firebase
      return await this.firebaseService.getUserById(id);
    } catch (error) {
      console.error('Error getting user from Firebase:', error);
      // Fallback to IndexedDB - use string ID directly
      return await this.indexedDB.getUserById(id);
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      // First try to get from Firebase
      return await this.firebaseService.getAllUsers();
    } catch (error) {
      console.error('Error getting users from Firebase:', error);
      // Fallback to IndexedDB
      return await this.indexedDB.getAllUsers();
    }
  }
}
