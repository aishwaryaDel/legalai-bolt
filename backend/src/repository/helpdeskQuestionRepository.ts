import HelpdeskQuestion, { HelpdeskQuestionCreationAttributes } from '../models/HelpdeskQuestion';
import { User } from '../models/User';

export const helpdeskQuestionRepository = {
  async create(data: HelpdeskQuestionCreationAttributes): Promise<HelpdeskQuestion> {
    return await HelpdeskQuestion.create(data);
  },

  async findById(id: string): Promise<HelpdeskQuestion | null> {
    return await HelpdeskQuestion.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: User,
          as: 'responder',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });
  },

  async findByUserId(userId: string): Promise<HelpdeskQuestion[]> {
    return await HelpdeskQuestion.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'responder',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });
  },

  async findAll(): Promise<HelpdeskQuestion[]> {
    return await HelpdeskQuestion.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: User,
          as: 'responder',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });
  },

  async update(id: string, data: Partial<HelpdeskQuestionCreationAttributes>): Promise<HelpdeskQuestion | null> {
    const question = await HelpdeskQuestion.findByPk(id);
    if (!question) return null;

    await question.update(data);
    return question;
  },

  async delete(id: string): Promise<boolean> {
    const deleted = await HelpdeskQuestion.destroy({ where: { id } });
    return deleted > 0;
  },

  async findByStatus(status: string): Promise<HelpdeskQuestion[]> {
    return await HelpdeskQuestion.findAll({
      where: { status },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: User,
          as: 'responder',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });
  },
};
