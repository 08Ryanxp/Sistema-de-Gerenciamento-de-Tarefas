const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const projectRoutes = require('./routes/project');
const taskRoutes = require('./routes/task');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.get('health', (req, res) => {
    res.json({status:`OK`, timestamp: new Date()});
});

app.use(`/auth`, authRoutes);
app.use(`/users`, userRoutes);
app.use(`/projects`, projectRoutes);
app.use(`taks`, taskRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error:`Algo deu Errado!`});
});

module.exports = app;