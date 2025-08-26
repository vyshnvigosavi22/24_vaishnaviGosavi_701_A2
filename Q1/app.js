const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.png', '.jpg', '.jpeg', '.gif'].includes(ext)) {
      return cb(new Error('Only images are allowed'));
    }
    cb(null, true);
  }
});

const cpUpload = upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'otherPics', maxCount: 5 }
]);

app.get('/', (req, res) => {
  res.render('form', { errors: {}, old: {} });
});

app.post('/submit', cpUpload, (req, res) => {
  const { username, password, confirmPassword, email, gender, hobbies } = req.body;
  const errors = {};
  const old = { ...req.body };

  // Validations
  if (!username) errors.username = 'Username is required';
  if (!password || password.length < 6) errors.password = 'Password must be at least 6 characters';
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  if (!email || !email.includes('@')) errors.email = 'Valid email is required';
  if (!gender) errors.gender = 'Gender is required';
  if (!hobbies) errors.hobbies = 'Select at least one hobby';
  if (!req.files['profilePic']) errors.profilePic = 'Profile picture is required';

  if (Object.keys(errors).length > 0) {
    return res.render('form', { errors, old });
  }

  const profilePic = req.files['profilePic'][0];
  const otherPics = req.files['otherPics'] || [];

  res.render('result', {
    data: {
      username,
      email,
      gender,
      hobbies: Array.isArray(hobbies) ? hobbies : [hobbies]
    },
    images: {
      profilePic,
      otherPics
    }
  });
});

app.listen(3000);
