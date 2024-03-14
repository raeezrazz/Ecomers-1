const mongoose = require('mongoose');
const nocache = require('nocache');
const path = require('path');

mongoose.connect('mongodb://127.0.0.1:27017/user_management_system');

const express = require('express');
const app = express();
app.use(nocache());


app.use(express.static('public'));


app.use('/assets/js', (req, res, next) => {
  res.setHeader('Content-Type', 'application/javascript');
  next();
}, express.static(path.join(__dirname, 'path/to')));

app.use('/multerImage', express.static(path.join(__dirname, 'public/multerImage')));

const userRoute = require('./routes/userRoute');
app.use('/', userRoute);

const adminRoute = require('./routes/adminRoute');
app.use('/admin', adminRoute);

app.listen(3050, () => {
  console.log('Server running at http://localhost:3050');
});
