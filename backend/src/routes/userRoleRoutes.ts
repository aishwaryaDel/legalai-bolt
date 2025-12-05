import { Router } from 'express';
import { userRoleController } from '../controllers/userRoleController';

const router = Router();

/**
* @openapi
* components:
*   schemas:
*     CreateUserRoleDTO:
*       type: object
*       required:
*         - user_id
*         - role_id
*       properties:
*         user_id:
*           type: string
*           format: uuid
*           example: 123e4567-e89b-12d3-a456-426614174000
*         role_id:
*           type: string
*           format: uuid
*           example: 123e4567-e89b-12d3-a456-426614174001
*         assigned_by:
*           type: string
*           format: uuid
*           example: 123e4567-e89b-12d3-a456-426614174002
*         is_active:
*           type: boolean
*           example: true
*     UpdateUserRoleDTO:
*       type: object
*       properties:
*         is_active:
*           type: boolean
*         assigned_by:
*           type: string
*           format: uuid
* @openapi
* /api/user-roles:
*   get:
*     summary: Get all user-role assignments
*     tags: [UserRoles]
*     responses:
*       200:
*         description: List of all user-role assignments
*   post:
*     summary: Assign a role to a user
*     tags: [UserRoles]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/CreateUserRoleDTO'
*     responses:
*       201:
*         description: Role assigned successfully
*       404:
*         description: User or role not found
*       409:
*         description: User already has this role
*
* /api/user-roles/{id}:
*   get:
*     summary: Get user-role assignment by ID
*     tags: [UserRoles]
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: User-role assignment found
*       404:
*         description: Assignment not found
*   put:
*     summary: Update user-role assignment by ID
*     tags: [UserRoles]
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/UpdateUserRoleDTO'
*     responses:
*       200:
*         description: Assignment updated
*       404:
*         description: Assignment not found
*   delete:
*     summary: Remove role assignment by ID
*     tags: [UserRoles]
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: Role removed from user
*       404:
*         description: Assignment not found
*
* /api/user-roles/user/{userId}:
*   get:
*     summary: Get all roles assigned to a user
*     tags: [UserRoles]
*     parameters:
*       - in: path
*         name: userId
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: List of roles for user
*       404:
*         description: User not found
*
* /api/user-roles/user/{userId}/active:
*   get:
*     summary: Get active roles assigned to a user
*     tags: [UserRoles]
*     parameters:
*       - in: path
*         name: userId
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: List of active roles for user
*       404:
*         description: User not found
*
* /api/user-roles/role/{roleId}:
*   get:
*     summary: Get all users assigned to a role
*     tags: [UserRoles]
*     parameters:
*       - in: path
*         name: roleId
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: List of users with this role
*       404:
*         description: Role not found
*
* /api/user-roles/user/{userId}/role/{roleId}:
*   delete:
*     summary: Remove specific role from user
*     tags: [UserRoles]
*     parameters:
*       - in: path
*         name: userId
*         required: true
*         schema:
*           type: string
*       - in: path
*         name: roleId
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: Role removed from user
*       404:
*         description: Assignment not found
**/

router.get('/', (req, res) => userRoleController.getAllUserRoles(req, res));

router.get('/:id', (req, res) => userRoleController.getUserRoleById(req, res));

router.get('/user/:userId', (req, res) => userRoleController.getRolesByUserId(req, res));

router.get('/user/:userId/active', (req, res) => userRoleController.getActiveRolesByUserId(req, res));

router.get('/role/:roleId', (req, res) => userRoleController.getUsersByRoleId(req, res));

router.post('/', (req, res) => userRoleController.assignRoleToUser(req, res));

router.put('/:id', (req, res) => userRoleController.updateUserRole(req, res));

router.delete('/:id', (req, res) => userRoleController.removeRoleFromUser(req, res));

router.delete('/user/:userId/role/:roleId', (req, res) => userRoleController.removeRoleFromUserByIds(req, res));

export default router;
