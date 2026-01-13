import { helpdeskQuestionRepository } from '../repository/helpdeskQuestionRepository';
import { HelpdeskQuestionCreationAttributes } from '../models/HelpdeskQuestion';

export const helpdeskQuestionService = {
  async createQuestion(userId: string, question: string) {
    const data: HelpdeskQuestionCreationAttributes = {
      userId,
      question,
      status: 'pending',
    };

    return await helpdeskQuestionRepository.create(data);
  },

  async getQuestionById(id: string) {
    return await helpdeskQuestionRepository.findById(id);
  },

  async getUserQuestions(userId: string) {
    return await helpdeskQuestionRepository.findByUserId(userId);
  },

  async getAllQuestions() {
    return await helpdeskQuestionRepository.findAll();
  },

  async updateQuestion(
    id: string,
    data: {
      status?: 'pending' | 'in_progress' | 'resolved' | 'closed';
      response?: string;
      respondedBy?: string;
    }
  ) {
    if (data.response && data.respondedBy) {
      return await helpdeskQuestionRepository.update(id, {
        ...data,
        respondedAt: new Date(),
      });
    }

    return await helpdeskQuestionRepository.update(id, data);
  },

  async deleteQuestion(id: string) {
    return await helpdeskQuestionRepository.delete(id);
  },

  async getQuestionsByStatus(status: string) {
    return await helpdeskQuestionRepository.findByStatus(status);
  },
};
