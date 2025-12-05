import { Router } from 'express';
import { roleController } from '../controllers/roleController';

const router = Router();

/**
* @openapi
* components:
*   schemas:
*     CreateRoleDTO:
*       type: object
*       required:
*         - name
*       properties:
*         name:
*           type: string
*           example: Legal Admin
*         description:
*           type: string
*           example: Legal department administrator with full access
*         permissions:
*           type: object
*           example: {"documents": {"create": true, "read": true}}
*         is_active:
*           type: boolean
*           example: true
*     UpdateRoleDTO:
*       type: object
*       properties:
*         name:
*           type: string
*         description:
*           type: string
*         permissions:
*           type: object
*         is_active:
*           type: boolean
* @openapi
* /api/roles:
*   get:
*     summary: Get all roles
*     tags: [Roles]
*     responses:
*       200:
*         description: List of all roles
*   post:
*     summary: Create a new role
*     tags: [Roles]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/CreateRoleDTO'
*     responses:
*       201:
*         description: Role created successfully
*       409:
*         description: Role already exists
*
* /api/roles/active:
*   get:
*     summary: Get all active roles
*     tags: [Roles]
*     responses:
*       200:
*         description: List of active roles
*
* /api/roles/{id}:
*   get:
*     summary: Get role by ID
*     tags: [Roles]
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: Role found
*       404:
*         description: Role not found
*   put:
*     summary: Update role by ID
*     tags: [Roles]
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
*             $ref: '#/components/schemas/UpdateRoleDTO'
*     responses:
*       200:
*         description: Role updated
*       404:
*         description: Role not found
*   delete:
*     summary: Delete role by ID
*     tags: [Roles]
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: Role deleted
*       404:
*         description: Role not found
*
* /api/roles/name/{name}:
*   get:
*     summary: Get role by name
*     tags: [Roles]
*     parameters:
*       - in: path
*         name: name
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: Role found
*       404:
*         description: Role not found
**/

router.get('/', (req, res) => roleController.getAllRoles(req, res));

router.get('/active', (req, res) => roleController.getActiveRoles(req, res));

router.get('/:id', (req, res) => roleController.getRoleById(req, res));

router.get('/name/:name', (req, res) => roleController.getRoleByName(req, res));

router.post('/', (req, res) => roleController.createRole(req, res));

router.put('/:id', (req, res) => roleController.updateRole(req, res));

router.delete('/:id', (req, res) => roleController.deleteRole(req, res));

export default router;
