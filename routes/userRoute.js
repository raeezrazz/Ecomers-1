const express = require('express');
const user_route = express()
const config=require('../config/config')
const FacebookStrategy= require('passport-facebook').Strategy
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const passport =require('passport')
const User = require('../models/fbModel');
const dotenv = require('dotenv').config()
const productController=require('../controllers/productController')
const cartController = require('../controllers/cartController')
const addressController = require('../controllers/addressController')
const orderController = require('../controllers/OrderController')
const couponController = require('../controllers/couponController')

//session
const session = require('express-session');


user_route.set('view engine','ejs');
user_route.set('views','./views/users');

user_route.use(session({
    secret: config.sessionSecret,
    resave:false,
    saveUninitialized:true,

}))


passport.use(

    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_SECRET_KEY,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      },
      async function (accessToken, refreshToken, profile, cb) {
        console.log("Facebook Profile:", profile); // Log the profile object
  
        try {
          const user = await User.findOne({
            accountId: profile.id,
            provider: 'facebook',
          });
  
          if (!user) {
            console.log(profile.email);
            console.log('Adding new facebook user to DB..');
            console.log(profile.email);
            const newUser = new User({
              accountId: profile.id,
              name: profile.displayName,
              provider: profile.provider,
            });
  
            // Manually set required fields
            newUser.is_admin = 0; // Provide a default value for is_admin
            newUser.password = 'password'; // Provide a default password or generate one
            newUser.mobile = profile.mobile; // Adjust accordingly based on available data
            newUser.email = profile.email ; // Adjust accordingly based on available data
  
            await newUser.save();
            console.log('User has been saved:', newUser);
            return cb(null, profile);
          } else {
            console.log('Facebook User already exists in DB..');
            console.log(profile);
            return cb(null, profile);
          }
        } catch (error) {
          console.error('Error during Facebook authentication:', error);
          return cb(error, null);
        }
      }
    )
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id); // Assuming user.id is a unique identifier for the user
  });
  
  passport.deserializeUser(async function(id, done) {
    try {
      const user = await User.findOne({ accountId: id });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
  
  


const bodyParser = require('body-parser')
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}));

const auth = require('../middleware/auth.js');


const userController = require('../controllers/userController.js')


user_route.get('/fbButton',passport.authenticate('facebook',{scope:'email'}));


user_route.get(
    '/loginFbSuccess',
    passport.authenticate('facebook', {
        
      failureRedirect: '/auth/facebook/error',
    }),
    function (req, res) {
        console.log("hiii1");
      // Successful authentication, redirect to success screen.
      res.redirect('/success');
    }
  );
  
  user_route.get('/success', async (req, res) => {
    console.log("hii   there   i");
    const userInfo = {
        
      fbid: req.session.passport.user.id,
      displayName: req.session.passport.user.displayName,
      provider: req.session.passport.user.provider,
      
    };

    req.session.userId =userInfo.fbid
    if(req.session.userId){
      console.log("success");
    }else{
      console.log("error");
    }
   
    res.render('home', { user: userInfo});
  });
  
  user_route.get('/error', (req, res) => res.send('Error logging in via Facebook..'));
  
  user_route.get('/signout', (req, res) => {
    try {
      req.session.destroy(function (err) {
        console.log('session destroyed.');
      });
      res.render('auth');
    } catch (err) {
      res.status(400).send({ message: 'Failed to sign out fb user' });
    }

  });


// LOG IN WITH GOOGLE
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET_KEY,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    function (accessToken, refreshToken, profile, done) {
      userProfile = profile;
      return done(null, userProfile);
    }
  )
);

// request at /auth/google, when user click sign-up with google button transferring
// the request to google server, to show emails screen
user_route.get(
  '/googleButton',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// URL Must be same as 'Authorized redirect URIs' field of OAuth client, i.e: /auth/google/callback
user_route.get(
  '/successGoogle',
  passport.authenticate('google', { failureRedirect: '/auth/google/error' }),
  (req, res) => {
    res.redirect('/successed'); // Successful authentication, redirect success.
  }
);

user_route.get('/successed', async (req, res) => {
  const { failure, success } = await userController.registerWithGoogle(userProfile);
  if (failure) console.log('Google user already exist in DB..');
  else console.log('Registering new Google user..');
  console.log("going to success");
  console.log("hello outh");
  res.render('home', { user: userProfile,log:"hi" });
});

user_route.get('/error', (req, res) => res.send('Error logging in via Google..'));

user_route.get('/signout', (req, res) => {
  try {
    req.session.destroy(function (err) {
      console.log('session destroyed.');
    });
    res.render('auth');
  } catch (err) {
    res.status(400).send({ message: 'Failed to sign out user' });
  }
});


user_route.post('/verifyRegister',userController.verifyRegister)
user_route.post('/verifyingOtp',userController.userOtpVerify)
user_route.get('/',userController.userHome)
user_route.get('/logining',userController.loadLogin)
user_route.get('/loadHome',userController.loadHome)
user_route.post('/login',userController.verifyLogin)
user_route.get('/logout',auth.isLogin,userController.userLogout)
user_route.post('/resendotp',userController.resentOTPVerification)
user_route.post('/forgotPassword',userController.forgotPassword)

user_route.get('/dashboard',userController.loadDashboard)
user_route.post('/editProfile',userController.editProfile)
user_route.post('/changePassword',userController.changePassword)
// user products
user_route.get('/loadProducts',productController.loadProducts)
user_route.get('/eachproduct/:id',productController.loadeachProducts)
user_route.get('/shopSearch',productController.searchProduct)
user_route.post('/sort',productController.sortProducts)

//cart
user_route.get('/loadCart',cartController.loadCart)
user_route.post('/addCart',cartController.addCart)
user_route.patch('/cartRemove',cartController.removeCart)
user_route.get('/loadCheckout',cartController.loadCheckout)
user_route.post('/updateQuantity',cartController.updateQuantity)

//Coupon
user_route.post('/applyCoupon',orderController.applyCoupon)
user_route.patch('/removeCoupon',orderController.removeCoupon)

//order
user_route.post('/placeOrder',orderController.placeOrder)
user_route.get('/successOrder',orderController.loadSuccess)
user_route.get('/orderdetails/:id',orderController.loadOrderDetails)
user_route.get('/fullOrder/:id',orderController.viewFullOrder)
user_route.post('/cancelOrder',orderController.cancelOrder)
user_route.post('/returnOrder',orderController.returnOrder)
user_route.post('/verifypayment',orderController.verifyPayment)
//address
user_route.post('/addAddress',addressController.addAddress)
user_route.post('/edit-address',addressController.editAddress)
user_route.post('/deleteAddress',addressController.deleteAddress)

//whishlist
user_route.get('/whishlist',userController.loadWhishlist)
user_route.post('/addToWishlist',userController.addToWishlist)
user_route.patch('/removeWishlist',userController.removeWishlist)


//payment

user_route.post('/')

user_route.get('/try',userController.user)


module.exports = user_route;