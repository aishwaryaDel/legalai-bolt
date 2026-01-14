
import { User } from '../models/User';
import { CreateUserDTO, UpdateUserDTO } from '../types/UserTypes';
import { userRepository } from '../repository/userRepository';
import { hashPassword } from '../utils/password';

export class UserService {
  async getAllUsers(): Promise<User[]> {
    try {
      const users = await userRepository.findAll();
      return users as User[];
    } catch (error) {
      throw error;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const user = await userRepository.findById(id);
      if (!user) {
        return null;
      }
      return user as User;
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await userRepository.findByEmail(email);
      if (!user) {
        return null;
      }
      return user as User;
    } catch (error) {
      throw error;
    }
  }

  async getUserByAzureAdId(azureAdId: string): Promise<User | null> {
    try {
      const user = await userRepository.findByAzureAdId(azureAdId);
      if (!user) {
        return null;
      }
      return user as User;
    } catch (error) {
      throw error;
    }
  }

  async createUser(userData: CreateUserDTO): Promise<User> {
    try {
      const { email, password, name, role, azure_ad_id, department, is_sso_user } = userData;

      let hashedPassword: string | undefined;
      if (password) {
        hashedPassword = await hashPassword(password);
      }

      const user = await userRepository.create({
        email,
        password: hashedPassword,
        name,
        role,
        azure_ad_id,
        department,
        is_sso_user: is_sso_user || false,
      });
      return user as User;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(id: string, updates: UpdateUserDTO): Promise<User | null> {
    try {
      const updateData = { ...updates };
      if (updates.password !== undefined) {
      }
      await userRepository.update(id, updateData);
      const updatedUser = await userRepository.findById(id);
      if (!updatedUser) {
        return null;
      }
      return updatedUser as User;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const deleted = await userRepository.delete(id);
      const success = deleted > 0;
      return success;
    } catch (error) {
      throw error;
    }
  }
}

export const userService = new UserService();
