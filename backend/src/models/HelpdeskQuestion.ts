import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../repository/sequelize';

interface HelpdeskQuestionAttributes {
  id: string;
  userId: string;
  question: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  response?: string;
  respondedBy?: string;
  respondedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface HelpdeskQuestionCreationAttributes extends Optional<HelpdeskQuestionAttributes, 'id' | 'status' | 'response' | 'respondedBy' | 'respondedAt' | 'createdAt' | 'updatedAt'> {}

class HelpdeskQuestion extends Model<HelpdeskQuestionAttributes, HelpdeskQuestionCreationAttributes> implements HelpdeskQuestionAttributes {
  public id!: string;
  public userId!: string;
  public question!: string;
  public status!: 'pending' | 'in_progress' | 'resolved' | 'closed';
  public response?: string;
  public respondedBy?: string;
  public respondedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

HelpdeskQuestion.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'in_progress', 'resolved', 'closed']],
      },
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    respondedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'responded_by',
    },
    respondedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'responded_at',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'helpdesk_questions',
    timestamps: true,
    underscored: true,
  }
);

export default HelpdeskQuestion;
export { HelpdeskQuestionAttributes, HelpdeskQuestionCreationAttributes };
