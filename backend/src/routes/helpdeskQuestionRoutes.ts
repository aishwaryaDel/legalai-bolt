import express from 'express';
import { helpdeskQuestionController } from '../controllers/helpdeskQuestionController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, helpdeskQuestionController.create);

router.get('/my-questions', authMiddleware, helpdeskQuestionController.getUserQuestions);

router.get('/all', authMiddleware, helpdeskQuestionController.getAll);

router.get('/:id', authMiddleware, helpdeskQuestionController.getById);

router.put('/:id', authMiddleware, helpdeskQuestionController.update);

router.delete('/:id', authMiddleware, helpdeskQuestionController.delete);

export default router;
