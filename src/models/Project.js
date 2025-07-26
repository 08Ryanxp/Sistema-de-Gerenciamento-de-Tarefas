const mongoose = require(`mongoose`);

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, `Título é obrigatório`],
        trim: true,
        maxlength: [100, `Título não pode ter mais de 100 caracteres`],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, `Descrição não pode ter mais de 500 caracteres.`]
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `User`,
        required: [true, `Projeto deve ter um proprietário`]
    },
    collaborators: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `User`
    },
    status: {
        type: String,
        enum: [`active`, `completed`, `archived`],
        default: `active`
    },
    prioruty: {
        type: String,
        enum: [`low`, `medium`, `high`],
        default: `medium`
    },
    deadline: {
        type: Date
    },
}, {
    timestamps: true
});

projectSchema.index({ owner: 1});
projectSchema.index({ collaborators: 1});

module.exports = mongoose.model(`Project`, projectSchema);