const Project = require('../models/Project');

// Verificar se usuário é owner do projeto
const requireProjectOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    if (project.owner.toString() !== userId.toString()) {
      return res.status(403).json({ 
        error: 'Apenas o proprietário pode realizar esta ação' 
      });
    }

    req.project = project;
    next();

  } catch (error) {
    console.error('Erro no middleware de owner:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Verificar se usuário tem acesso ao projeto (owner OU collaborator)
const requireProjectAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    const hasAccess = project.owner.toString() === userId.toString() ||
                     project.collaborators.includes(userId);

    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Você não tem acesso a este projeto' 
      });
    }

    req.project = project;
    next();

  } catch (error) {
    console.error('Erro no middleware de acesso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  requireProjectOwner,
  requireProjectAccess
};