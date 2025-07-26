const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true,
    maxlength: [200, 'Título não pode ter mais de 200 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Descrição não pode ter mais de 1000 caracteres']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Tarefa deve pertencer a um projeto']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Tarefa deve ter um criador']
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'review', 'done'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  estimatedHours: {
    type: Number,
    min: [0, 'Horas estimadas não podem ser negativas']
  },
  actualHours: {
    type: Number,
    min: [0, 'Horas reais não podem ser negativas']
  }
}, {
  timestamps: true
});

taskSchema.index({ project: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });

// Middleware para atualizar completedAt quando status vira 'done'
taskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'done') {
    this.completedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);