import { Injectable } from '@angular/core';
import { IndexedDBService } from './indexed-db.service';
import { User } from '../models';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private indexedDB: IndexedDBService) {}

  async register(
    user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>
  ): Promise<number> {
    const newUser: User = {
      ...user,
      createdAt: new Date(),
    };
    return this.indexedDB.addUser(newUser);
  }

  async login(email: string, password: string): Promise<User | null> {
    const users = await this.indexedDB.getAllUsers();
    const user = users.find(
      (u) => u.email === email && u.password === password
    );
    if (user) {
      user.lastLogin = new Date();
      await this.indexedDB.updateUser(user);
    }
    return user || null;
  }

  async getUserById(id: number): Promise<User | null> {
    return this.indexedDB.getUserById(id);
  }

  async getAllUsers(): Promise<User[]> {
    return this.indexedDB.getAllUsers();
  }
}
