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

  constructor(
    private indexedDB: IndexedDBService,
    private firebaseService: FirebaseService,
    private router: Router
  ) {
    // Check localStorage for saved user session
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }

  private saveUserToStorage(user: User | null): void {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }

  async register(
    userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>
  ): Promise<User | null> {
    try {
      // Firebase Authentication and Firestore storage
      const uid = await this.firebaseService.registerUser(
        userData.email,
        userData.password,
        userData
      );

      // Get the user from Firestore
      const user = await this.firebaseService.getUserById(uid);

      if (user) {
        // Also store in IndexedDB for offline capability
        // We need to create a copy to avoid type issues
        const indexDbUser = {
          ...user,
          // For IndexedDB, we'll use the string ID directly
          // The IndexedDB service will need to be updated to handle string IDs
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
      const uid = await this.firebaseService.loginUser(email, password);

      if (!uid) {
        return null;
      }

      // Get user data from Firestore
      const user = await this.firebaseService.getUserById(uid);

      if (user) {
        // Update IndexedDB for offline capability
        const indexedDBUser = await this.indexedDB.getUserById(uid);
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
      this.currentUserSubject.next(null);
      this.saveUserToStorage(null);
      this.router.navigate(['/bejelentkezes']);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return !!user && user.isAdmin === true;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
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
