export interface CreateUserDTO {
  email: string;
  password?: string;
  name: string;
  role: string;
  azure_ad_id?: string;
  department?: string;
  is_sso_user?: boolean;
}

export interface UpdateUserDTO {
  email?: string;
  password?: string;
  name?: string;
  role?: string;
  azure_ad_id?: string;
  department?: string;
  is_sso_user?: boolean;
}

export interface UserAttributes {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  azure_ad_id?: string;
  department?: string;
  is_sso_user: boolean;
  created_at?: Date;
  updated_at?: Date;
}

import { Optional } from 'sequelize';
export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'created_at' | 'updated_at'> {}
