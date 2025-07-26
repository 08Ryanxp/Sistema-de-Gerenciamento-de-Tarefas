const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware principal de autenticação
const auth = async (req, res, next) => {
  try {
    // 1. Pegar token do header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token não fornecido. Acesso negado.' 
      });
    }

    // 2. Extrair token (remove "Bearer " do início)
    const token = authHeader.substring(7);

    // 3. Verificar se token é válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Buscar usuário no banco
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        error: 'Token inválido. Usuário não encontrado.' 
      });
    }

    // 5. Adicionar usuário na requisição para próximos middlewares
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado.' });
    }
    
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// Middleware para verificar se é admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Acesso negado. Apenas administradores.' 
    });
  }
  next();
};

module.exports = { auth, requireAdmin };