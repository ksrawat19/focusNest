const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/project');
const taskRoutes = require('./routes/task');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/user');

const app = express();

// 🔹 Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'focusnest-secret',
  resave: false,
  saveUninitialized: true
}));

// 🔹 View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 🔹 Routes
app.use('/', authRoutes);
app.use('/projects', projectRoutes);
app.use('/tasks', taskRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/users', userRoutes);

// 🔹 Default redirect
app.get('/', (req, res) => {
  res.redirect('/login');
});

// 🔹 404 fallback
app.use((req, res) => {
  res.status(404).render('404', { url: req.originalUrl });
});

// 🔹 Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
