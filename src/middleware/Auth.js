const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authService = require('../services/authService');

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

    // 2. Extrair token
    const token = authHeader.substring(7);

    // 3. Verificar se token está na blacklist
    const isBlacklisted = await authService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({ 
        error: 'Token foi invalidado. Faça login novamente.' 
      });
    }

    // 4. Verificar se token é válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Buscar usuário no banco
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        error: 'Token inválido. Usuário não encontrado.' 
      });
    }

    // 6. Adicionar usuário na requisição
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