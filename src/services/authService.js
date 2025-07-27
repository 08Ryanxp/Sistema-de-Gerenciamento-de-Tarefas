const jwt = require(`jsonwebtoken`);
const bcrypt = require(`bcryptjs`);
const BlacklistedToken = require('../models/BlacklistedToken');
const { Error } = require("mongoose");

// Gerar token JWT
const generateTokens = (userId) => {
    // Token principaç (expira em 1 dia)
    const accessToken = jwt.sign(
        {userId},
        process.env.JWT_SECRET,
        {expiresIn: `1d`}
    );

    // Token de refresh (expira em 7 dias)
    const refreshToken = jwt.sign(
        {userId},
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        {expiresIn: `7d`}
    );

    return {accessToken, refreshToken};
};

// Verificar Token
const verifyToken = (token, secret = process.env.JWT_SECRET) => {
    try{
        return jwt.verify(token, secret);
    }catch (error) {
        throw new Error(`Token inválido`);
    }
};

// Criptografar senha
const hashPassword = async (password) => {
    return await bcrypt.hash(password, 12);
};

// Comparar senha
const comparePassword = async (comparePassword, hashedPassword) => {
    return await bcrypt.compare(comparePassword, hashedPassword);
};

// Adicionar token à blacklist
const addToBlacklist = async (token) => {
    await BlacklistedToken.create({ token });
};

// Verificar se token está na blacklist
const isTokenBlacklisted = async (token) => {
    const blacklistedToken = await BlacklistedToken.findOne({ token });
    return !!blacklistedToken; // Retorna true se encontrou, false se não
};

module.exports = {
    generateTokens,
    verifyToken,
    hashPassword,
    comparePassword,
    addToBlacklist,
    isTokenBlacklisted
};