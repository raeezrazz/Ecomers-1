const mongoose = require('mongoose');
const nocache = require('nocache');
const path = require('path');
const dotenv = require('dotenv').config()
const url = process.env.MONGODB_URL
mongoose.connect(url);

const express = require('express');
const app = express();
app.use(nocache());


app.use(express.static('public'));


app.use('/assets/js', (req, res, next) => {
  res.setHeader('Content-Type', 'application/javascript');
  next();
}, express.static(path.join(__dirname, 'path/to')));

app.use('/multerImage', express.static(path.join(__dirname, 'public/multerImage')));
app.use('/js', express.static(path.join(__dirname, 'public/assets admin/')));


const userRoute = require('./routes/userRoute'); 
app.use('/', userRoute); 

const adminRoute = require('./routes/adminRoute');
app.use('/admin', adminRoute);

app.listen(3050, () => {
  console.log('Server running at http://localhost:3050');
});
