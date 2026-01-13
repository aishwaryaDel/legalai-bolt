import { Request, Response } from 'express';
import { helpdeskQuestionService } from '../services/helpdeskQuestionService';

export const helpdeskQuestionController = {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { question } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!question || !question.trim()) {
        res.status(400).json({ error: 'Question is required' });
        return;
      }

      const newQuestion = await helpdeskQuestionService.createQuestion(userId, question.trim());

      res.status(201).json({
        success: true,
        data: newQuestion,
        message: 'Question submitted successfully',
      });
    } catch (error) {
      console.error('Error creating helpdesk question:', error);
      res.status(500).json({ error: 'Failed to submit question' });
    }
  },

  async getUserQuestions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const questions = await helpdeskQuestionService.getUserQuestions(userId);

      res.status(200).json({
        success: true,
        data: questions,
      });
    } catch (error) {
      console.error('Error fetching user questions:', error);
      res.status(500).json({ error: 'Failed to fetch questions' });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const question = await helpdeskQuestionService.getQuestionById(id);

      if (!question) {
        res.status(404).json({ error: 'Question not found' });
        return;
      }

      if (question.userId !== userId && req.user?.role !== 'admin' && req.user?.role !== 'legal') {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      res.status(200).json({
        success: true,
        data: question,
      });
    } catch (error) {
      console.error('Error fetching question:', error);
      res.status(500).json({ error: 'Failed to fetch question' });
    }
  },

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (userRole !== 'admin' && userRole !== 'legal') {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const questions = await helpdeskQuestionService.getAllQuestions();

      res.status(200).json({
        success: true,
        data: questions,
      });
    } catch (error) {
      console.error('Error fetching all questions:', error);
      res.status(500).json({ error: 'Failed to fetch questions' });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, response } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const question = await helpdeskQuestionService.getQuestionById(id);

      if (!question) {
        res.status(404).json({ error: 'Question not found' });
        return;
      }

      if (question.userId !== userId && userRole !== 'admin' && userRole !== 'legal') {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const updateData: any = {};
      if (status) updateData.status = status;
      if (response && (userRole === 'admin' || userRole === 'legal')) {
        updateData.response = response;
        updateData.respondedBy = userId;
      }

      const updatedQuestion = await helpdeskQuestionService.updateQuestion(id, updateData);

      res.status(200).json({
        success: true,
        data: updatedQuestion,
        message: 'Question updated successfully',
      });
    } catch (error) {
      console.error('Error updating question:', error);
      res.status(500).json({ error: 'Failed to update question' });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const question = await helpdeskQuestionService.getQuestionById(id);

      if (!question) {
        res.status(404).json({ error: 'Question not found' });
        return;
      }

      if (question.userId !== userId && userRole !== 'admin') {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      await helpdeskQuestionService.deleteQuestion(id);

      res.status(200).json({
        success: true,
        message: 'Question deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting question:', error);
      res.status(500).json({ error: 'Failed to delete question' });
    }
  },
};
