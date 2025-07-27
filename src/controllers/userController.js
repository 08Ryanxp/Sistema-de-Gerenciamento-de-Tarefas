const User = require(`../models/User`);
const {generateTokens, addToBlacklist} = require(`../services/authService`);

// Registrar novo usuário
const register = async (req, res) => {
     try {
        const {name, email, password} =  req.body;

        // 1. Verificar se email já existe
        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({
                error: `Email já sendo usado por outro usuário`
            });
        }

        // 2. Criar usuário
        const user = new User({name, email, password});
        await user.save();

        // 3. Gerar tokens
        const {accessToken, refreshToken} = generateTokens(user._id);

        // 4. Responder com sucesso
        res.status(201).json({
            message: `Usuário criado com sucesso`,
            user: user.toJSON(),
            accessToken,
            refreshToken
        });

     } catch (error) {
        console.error(`Erro no registro`, error);
        res.status(500).json({error:`Erro interno do servidor`})
     }
};

// Login do usuário
const login = async (req, res) => {
    try {
        const {email, password} = req.body;

        // 1. Buscar usuário por email
        const user = await User.findOne({email});
        if(!user) {
            return res.status(401).json({
                error: `Email ou senha incorretos`
            });
        }

        // 2. Verificar senha
        const isPasswordValid = await User.comparePassword({password});
        if(!isPasswordValid) {
            return res.status(401).json({
                error: `Email ou senha incorretos`
            });
        }

        // 3. Gerar novos tokens
        const {accessToken, refreshToken} = generateTokens(user._id);

        // 4. Responder com sucesso
        res.json({
            message:`Login realizado com sucesso`,
            user: user.toJSON().
            accessToken,
            refreshToken
        });

    } catch (error) {
        console.error(`Erro no login`, error);
        res.status(500).json({error: `Erro interno do servidor`});
    }
};

// Ver perfil do usuário logado
const getProfile = async (req, res) => {
    try {
        // req.user vem do middleware de auth
        res.json({
            message: `Perfil  recuperado com sucesso`,
            user: req.user.toJSON()
        });
    } catch (error) {
        console.error(`Erro ao buscar perfil`, error);
        res.status(500).json({error: `Erro interno do servidor`});
    }
};

// Atualiar perfil
const updateProfile = async (req, res) => {
    try {
        const {name, email} = req.body;
        const userId = req.user._id;

        // Verificar se novo email já existe (se mudou)
        if (email && email !==  req.user.email) {
            const existingUser = await User.findOne({email});
            if (existingUser) {
                return res.status(400).json({
                    error:`Email já está sendo usado por outro usuário`
                });
            }
        }

        // Atualizar usuário
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {name, email},
            {new: true, runValidators: true}
        );

        res.json({
            message:`Perfil atualizado com sucesso`,
            user: updatedUser.toJSON()
        });

    } catch (error) {
        console.error(`Erro ao atualizar perfil`, error);
        res.status(500).json({error: `Erro interno do servidor`});
    }
};

// Logout
const logout = async (req, res) => {
    try {
        // 1. Pegar o token do header
        const token = req.headers.authorization?.split(``)[1];

        if(!token) {
            return res.status(400).json({error: `Token não recebido`});
        }

        // 2. Adicionar token na blacklist
        await addToBlacklist(token);

        // 3. Responder sucesso
        res.json({ message: `Logout realizado com sucesso`});

    } catch (error) {
        console.error(`Erro no logout`, error);
        res.status(500).json({error: `Erro interno do servidor`});
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    logout
};