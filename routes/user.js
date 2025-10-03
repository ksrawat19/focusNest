const express = require('express');
const router = express.Router();
const db = require('../db');

// Protect route
function authMiddleware(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

// Show all users
router.get('/', authMiddleware, (req, res) => {
  db.all(`SELECT id, first_name, last_name, email FROM users`, (err, users) => {
    if (err) return res.send('Error loading users');
    res.render('users', { users });
  });
});

module.exports = router;
