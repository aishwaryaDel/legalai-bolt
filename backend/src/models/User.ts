import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../repository/sequelize';
import { CreateUserDTO, UpdateUserDTO, UserAttributes, UserCreationAttributes } from '../types/UserTypes';

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password!: string;
  public name!: string;
  public role!: string;
  public azure_ad_id?: string;
  public department?: string;
  public is_sso_user!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    azure_ad_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_sso_user: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: false,
  }
);
