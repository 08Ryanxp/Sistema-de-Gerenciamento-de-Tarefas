const express = require('express');
const router = express.Router();

const projectController = require('../controllers/projectController');
const { auth } = require('../middleware/auth');
const { requireProjectOwner, requireProjectAccess } = require('../middleware/projectAuth');
const { validateProject, validateCollaborator } = require('../validators/projectValidator');

router.use(auth);

// Rotas públicas do usuário
router.post('/', validateProject, projectController.createProject);
router.get('/', projectController.getProjects);

// Rotas que precisam de acesso ao projeto
router.get('/:id', requireProjectAccess, projectController.getProjectById);

// Rotas que precisam ser owner
router.put('/:id', requireProjectOwner, validateProject, projectController.updateProject);
router.delete('/:id', requireProjectOwner, projectController.deleteProject);
router.post('/:id/collaborators', requireProjectOwner, validateCollaborator, projectController.addCollaborator);
router.delete('/:id/collaborators/:collaboratorId', requireProjectOwner, projectController.removeCollaborator);

module.exports = router;