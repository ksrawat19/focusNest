const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const db = require('../db');
const router = express.Router();

// 🔹 Login page
router.get('/login', (req, res) => {
  const error = req.query.error;
  const loggedOut = req.query.loggedOut;
  res.render('login', { error, loggedOut });
});

// 🔹 Login handler
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user) return res.redirect('/login?error=notfound');

    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        req.session.userId = user.id;
        req.session.userName = user.first_name;
        res.redirect('/dashboard');
      } else {
        res.redirect('/login?error=invalid');
      }
    });
  });
});

// 🔹 Register page
router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'register.html'));
});

// 🔹 Register handler
router.post('/register', (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, existingUser) => {
    if (existingUser) return res.redirect('/register?error=exists');

    db.run(
      `INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)`,
      [first_name, last_name, email, hashedPassword],
      err => {
        if (err) return res.redirect('/register?error=failed');
        res.redirect('/login');
      }
    );
  });
});

// 🔹 Logout route
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.redirect('/login?error=logoutfail');
    res.redirect('/login?loggedOut=true');
  });
});

module.exports = router;
