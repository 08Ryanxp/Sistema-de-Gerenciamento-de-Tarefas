const Project = require(`../models/Project`);
const User = require(`../models/User`);

// Criar novo projeto
const createProject = async (req, res) => {
    try {
        const {title, description, priority, deadline} = req.body;
        const userId = req.user._id;

        // Criar projeto com usuário como owner
        const project = new Project({
            title,
            description,
            owner: userId,
            priority,
            deadline
        });

        await project.save();

        // Popular dados do owner para resposta
        await project.populate(`owner`, `name email`);

        res.status(201).json({
            message: `Projeto criado com sucesso`,
            project
        });

    } catch (error) {
        console.error(`Erro ao criar projeto`, error);
        res.status(500).json({error: `Erro interno do servidor`});
    }
};

// Listar projetos do usuário
const  getProjects = async (req, res) => {
    try {
        const userId = req.user._id;
        const {page = 1, limit = 10, status} = req.query;

        // Filtros
        const filter = {
            $or: [
                {owner: userId},
                {collaborators: userId}
            ]
        };

        if (status) {
            filter.status = status;
        }

        // Paginação
        const skip = (page - 1) * limit;

        const projects = await Project.find(filter)
        .populate(`owner`, `name email`)
        .populate(`collaborators`, `name email`)
        .sort({createdAt: -1})
        .skip(skip)
        .limit(parseInt(limit));

        const total = await Project.countDocuments(filter);

        res.json({
            projects,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / limit),
                count: total
            }
        });

    } catch (error) {
        console.error(`Erro ao listar projetos`, error);
        res.status(500).json({error: `Erro interno do servidor`});
    }
};

// Buscar projeto por ID
const getProjectById = async (req, res) => {
    try {
        const {id} = req.params;
        const userId = req.user._id;

        const project = await Project.findById(id)
        .populate(`owner`, `name email`)
        .populate(`collaborators`, `name email`);

        if (!project) {
            return res.staus(404).json({error: `Projeto não encontrado`});
        }

        // Verificar se usuário tem acesso
        const hasAccess = project.owner._id.toString() === userId.toString() || project.collaborators.some(collaborators._id.toString() === userId.toString());

        if (!hasAccess) {
            return res.status(403).json({error: `Acesso negado a este projeto`})
        }

        res.json({project});

    } catch (error) {
        console.error(`Erro ao buscar projeto`, error);
        res.status(500).json({error: `Erro interno do servidor`});
    }
};

// Atualizar projeto
const updateProject = async (req, res) => {
    try {
        const {id} = req.params;
        const {title, description, status, priority, deadline} = req.body;
        const userId = req.user._id;

        const project = await Project.findById(id);

        if(!project) {
            return res.status(404).json({error: `Projeto não encontrado`});
        }

        // Apenas owner pode editar
        if (project.owner.toString() !== userId.toString()) {
            return res.status(403).json({error: `Apenas o proprietário pode editar o projeto`})
        }

        // Atualizar campos
        Object.assign(project, {title, description, status, priority, deadline});
        await project.save();

        await project.populate(`owner`, `name email`);
        await project.populate(`collaborators`, `name email`);

        res.json({
            message: `Projeto atualizado com sucesso`,
            project
        });

    } catch (error) {
        console.error(`Erro ao atualizar projeto`, error);
        res.status(500).json({error: `Erro interno do servidor`});
    }
};

// Deletar projeto
const deleteProject = async (req, res) => {
    try {
        const {id} = req.params;
        const userId = req.user._id;

        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({error: `Projeto não encontrado`});
        }

        // Apenas owner pode deletar
        if (project.owner.toString() !== userId.toString()) {
            return res.status(403).json({error: `Apenas o proprietário pode deletar o projeto`})
        }

        await Project.findByIdAndDelete(id);

        res.json({message: `Projeto deletado com sucesso`})

    } catch (error) {
        console.error(`Erro ao deletar projeto`, error);
        res.status(500).json({error: `Erro interno do servidor`});
    }
};

// Adicionar colaborador
const addCollaborator = async (req, res) => {
    try {
        const {id} = req.params;
        const {email} = req.body;
        const userId = req.user._id;

        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({error: `Projeto não encontrado`});
        }

        // Apenas owner pode adicionar colaboradores
        if (project.owner.toString() !== userId.toString()) {
            return res.status(403).json({error: `Apenas o proprietário pode adicionar colaboradores`})
        }

        // Buscar usuário a ser adicionado
        const collaborator = await User.findOne({email});
        if (!collaborator) {
            return res.status(404).json({error: `Usuário não encontrado`});
        }

        // Verificar se já é colaborador
        if (project.collaborators.includes(collaborator._id)) {
            return res.status(400).json({error: `Usuário já é colaborador desse projeto`});
        }

        // Verificar se não é o próprio owner
        if (project.owner.toString() === collaborator._id.toString()) {
            return res.status(400).json({error: `Proprietário não pode ser adicionado como colaborador`});
        }

        // Adicionar colaborador
        project.collaborators.push(collaborator._id);
        await project.save();

        await project.populate(`collaborators`, `name email`);

        res.json({
            message: `Colaborador adicionado com sucesso`,
            collaborators: project.collaborators
        });

    } catch (error) {
        console.error(`Erro ao adicionar colaborador`, error);
        res.status(500).json({error: `Erro interno do servidor`});
    }
};

// Remover colaborador
const removeCollaborator = async (req, res) => {
    try {
        const {id, collaboratorId} = req.params;
        const userId = req.user._id;

        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({error: `Projeto não encontrado`});
        }

        // Apenas owner pode adicionar colaboradores
        if (project.owner.toString() !== userId.toString()) {
            return res.status(403).json({error: `Apenas o proprietário pode remover colaboradores`})
        }

        // Remover colaborador
        project.collaborators = project.collaborators.filter(
            collab => collab.toString() !== collaboratorId
        );

        await project.save();
        await project.populate(`collaborators`, `name email`);

        res.json({
            message: `Colaborador removido com sucesso`,
            collaborators: project.collaborators
        });

    } catch (error) {
        console.error(`Erro ao remover colaborador`, error);
        res.status(500).json({error: `Erro interno do servidor`});
    }
};

module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    addCollaborator,
    removeCollaborator
};

