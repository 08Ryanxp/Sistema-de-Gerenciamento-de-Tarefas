const joi = require(`joi`);

// Schema para atualizar perfil
const updateProfileSchema = joi.object({
    name: joi.string()
    .min(2)
    .max(50)
    .trim()
    .messages({
        'string.min': 'Nome deve ter pelo menos 2 caracteres',
        'string.max': 'Nome não pode ter mais de 50 caracteres'
    }),
    email: joi.string()
    .email()
    .lowercase()
    .trim()
    .messages({
        'string.email': 'Email deve ter formato válido',
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
    validateUpdateProfile: validate(updateProfileSchema)
};