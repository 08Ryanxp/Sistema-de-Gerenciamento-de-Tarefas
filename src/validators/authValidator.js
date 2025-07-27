const joi = require(`joi`);

// Schema para registro
const registerSchema = joi.object({
    name: joi.string()
    .min(2)
    .max(50)
    .required()
    .trim()
    .messages({
        "string.min": "Nome deve ter pelo menos 2 caracteres",
        "string.max": "Nome não pode ter mais de 50 caracteres",
        "any.required": "Nome é obrigatório"
    }),
    email: joi.string()
    .email()
    .required()
    .lowercase()
    .trim()
    .messages({
        "string.email": "Email deve ter formato válido",
        "any.required": "Email é obrigatório",
    }), 
    password: joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
        "string.min": "Senha deve ter pelo menos 6 caracteres",
        "string.max": "Senha não pode ter mais de 128 caracteres",
        "any.required": "Senha é obrigatória"
    })
});

// Schema para login
const loginSchema = joi.object({
    email: joi.string()
    .email()
    .required()
    .lowercase()
    .trim()
    .messages({
        "string.email": "Email deve ter formato válido",
        "any.required": "Email é obrigatória"
    }),
    password: joi.string()
    .required()
    .messages({
        "any.required": "Senha é obrigatória",
    })
});

// Middleware de validação
const validate = (schema) => {
    return (req, res, next) => {
        const {error} = schema.validate(req.body);

        if (error) {
            const errorMessage = error.details[0].message;
            return res.status(400).json({error: errorMessage});
        }

        next();
    };
};

module.exports = {
    validateRegister: validate(registerSchema),
    validateLogin: validate(loginSchema)
};