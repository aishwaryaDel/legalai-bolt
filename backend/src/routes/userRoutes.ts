import { Router } from 'express';
import { userController } from '../controllers/userController';

const router = Router();

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: List of users
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Users
 *     responses:
 *       201:
 *         description: User created
 */

router.get('/', (req, res) => userController.getAllUsers(req, res));

router.get('/:id', (req, res) => userController.getUserById(req, res));

router.post('/', (req, res) => userController.createUser(req, res));

router.put('/:id', (req, res) => userController.updateUser(req, res));

router.delete('/:id',  (req, res) => userController.deleteUser(req, res));

export default router;

 