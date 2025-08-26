const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Session config with file store
app.use(session({
  store: new FileStore({
    path: './sessions',
    logFn: function() {} // disable logging
  }),
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 * 30 } // 30 minutes
}));

// Dummy users (in real app use DB + hashed passwords)
const users = {
  alice: { password: 'password1', name: 'Alice' },
  bob: { password: 'password2', name: 'Bob' }
};

// Middleware to protect routes
function authMiddleware(req, res, next) {
  if (req.session && req.session.user) next();
  else res.redirect('/login');
}

app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (users[username] && users[username].password === password) {
    req.session.user = { username, name: users[username].name };
    res.redirect('/dashboard');
  } else {
    res.render('login', { error: 'Invalid username or password' });
  }
});

app.get('/dashboard', authMiddleware, (req, res) => {
  res.render('dashboard', { user: req.session.user });
});

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.send('Error logging out');
    res.redirect('/login');
  });
});

app.listen(3000);
