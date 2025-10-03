const express = require('express');
const path = require('path');
const { createProject } = require('../models/project');
const router = express.Router();
const db = require('../db');

// Middleware to protect routes
function authMiddleware(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

// 🔹 View all projects owned by the user
router.get('/', authMiddleware, (req, res) => {
  const userId = req.session.userId;

  db.all(`SELECT * FROM projects WHERE owner_id = ?`, [userId], (err, projects) => {
    if (err) return res.send('Error loading projects');
    res.render('projects-overview', { projects });
  });
});

// 🔹 Show project creation form
router.get('/create', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'create-project.html'));
});

// 🔹 Handle project creation
router.post('/create', authMiddleware, (req, res) => {
  const { name, description, start_date, end_date } = req.body;
  const owner_id = req.session.userId;

  createProject({ name, description, owner_id, start_date, end_date }, err => {
    if (err) return res.send('Error creating project');
    res.redirect('/dashboard');
  });
});

// 🔹 Handle project deletion
router.post('/delete/:id', authMiddleware, (req, res) => {
  const projectId = req.params.id;

  db.run(`DELETE FROM projects WHERE id = ?`, [projectId], err => {
    if (err) return res.send('Error deleting project');
    res.redirect('/dashboard');
  });
});

// 🔹 View project by ID with its tasks
router.get('/:id', authMiddleware, (req, res) => {
  const projectId = req.params.id;

  db.get(`SELECT * FROM projects WHERE id = ?`, [projectId], (err, project) => {
    if (err || !project) return res.send('Project not found');

    db.all(`SELECT * FROM tasks WHERE project_id = ?`, [projectId], (err2, tasks) => {
      if (err2) return res.send('Error loading tasks');

      res.render('view-project', {
        project,
        tasks
      });
    });
  });
});

module.exports = router;
