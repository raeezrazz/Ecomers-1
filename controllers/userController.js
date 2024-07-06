const userModels = require('../models/userModel');
const User= require('../models/userModel');
const bcrypt =require('bcrypt')
const userOtpVerification = require('../models/userVerification')
const nodemailer = require('nodemailer');
const dotenv = require('dotenv').config()
const pdf = require('pdfkit');
const fs = require('fs');
const FacebookStrategy= require('passport-facebook').Strategy
const passport = require('passport')
const nocache = require('nocache')
const Category = require('../models/categoriesModel');
const Products=require('../models/productModel')
const Cart = require('../models/cartModel')
const Address = require('../models/addressModel')
const Order = require('../models/orderModel')
const googleUser=require('../models/googleModel')
const Wishlist =require('../models/whishlistModal')
const Coupon =require('../models/couponModel');
const whishlistModal = require('../models/whishlistModal');
// const { find,findOne } = require('../models/userVerification');



const securePassword = async(password)=>{
    try{
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
    }catch(error){
        console.log(error.message);
    }
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host:'smpt.gmail.com',
    port:587,
    secure:true,
    auth: {
        user:process.env.AUTH_EMAIL, 
        pass: process.env.AUTH_PASS   
    }
});





const sendOtpVerificationEmail = async(result,res)=>{
    try {
        const otp =`${Math.floor(1000 + Math.random() * 9000)}`
        console.log(otp,"THIS IS THE OTP");
//mail option
const mailOption = {
        from : process.env.AUTH_EMAIL,
        to: result.email,
        subject:"Verify Your Email",
        html: `<p>Enter the <b>${otp}</b> to verify your email address and complete the sign up</p>`
    }
    const saltRounds = 10 ;
    const userOtpVerificationRecord = await userOtpVerification.findOne({ userId: result._id });
    
    if (userOtpVerificationRecord) {
        const hashedOtp =  await bcrypt.hash(otp,saltRounds)
        await userOtpVerification.updateOne({ userId: result._id }, { otp: hashedOtp, createAt: Date.now() });
    } else {
    const newhash = await bcrypt.hash(otp,saltRounds)
    
    const newOTPVerification  = await new userOtpVerification({
        userId: result._id,
        otp: newhash,
        createdAt: Date.now(),
        expiresAt: Date.now()+3600000,
    });
    //save otp record
    await newOTPVerification.save();
}
   
    await transporter.sendMail(mailOption);
    res.render('otp',{message:"Verification otp  sented",
           
            email:result.email,
            userId:result._id     
    })
    
    }catch (error) { 
      console.log(error.message);
    }
}






const  sendResentOtpVerificationEmail = async(result,forgot,res)=>{
    try {
        const otp =`${Math.floor(1000 + Math.random() * 9000)}`
        console.log(otp,"THIS IS THE OTP");
//mail option
const mailOption = {
        from : process.env.AUTH_EMAIL,
        to: result.email,
        subject:"Verify Your Email",
        html: `<p>Enter the <b>${otp}</b> to verify your email address and complete the sign up</p>`
    }
    const saltRounds = 10 ;
    const userOtpVerificationRecord = await userOtpVerification.findOne({ userId: result._id });
    
    if (userOtpVerificationRecord) {
        await userOtpVerification.updateOne({ userId: result._id }, { otp: hashedOtp, createAt: Date.now() });
    } else {
    const newhash = await bcrypt.hash(otp,saltRounds)
    
    const newOTPVerification  = await new userOtpVerification({
        userId: result._id,
        otp: newhash,
        createdAt: Date.now(),
        expiresAt: Date.now()+3600000,
    });
    //save otp record
    await newOTPVerification.save();
    }
    if(forgot){
        await transporter.sendMail(mailOption);
    res.render('otp',{message:"Otp sended Again",
           
            email:result.email,
            userId:result._id,forgot
            
        
        
    })
    }else{
    await transporter.sendMail(mailOption);
    res.render('otp',{message:"Otp sended Again",
           
            email:result.email,
            userId:result._id
            
        
        
    })
}
    } catch (error) {
      console.log(error.message);
    }
}



const verifyRegister = async(req,res)=>{
    try{

    
 const{name,email,password,mobile}= req.body;
 name:name;
 email:email;
 password:password;
 mobile:mobile;
 const exist1 = await User.findOne({email})

        if(name ==""|| email =="" || password == "" || mobile ==""){
            res.render('login1',{message1:"Please fill all the fields"})
        }else if(!/^[a-zA-Z ]*$/.test(name)){
            res.render('login1',{name1:"Invalid name entered"})
        }else if(!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
            res.render('login1',{email1:"Invalid email entered"})
        }else if  (password.length < 8){
            res.render('login1',{password1:"Password is very short"})
        }else if(exist1 ){
            res.render('login1',{alreadyMessage:"User with provided email alreadyexists"});
        }else{
        const exist = await User.findOne({email})
            .then((result)=>{
               
                    const saltRounds = 10;
                    bcrypt.hash(password,saltRounds)
                    .then((hashPassword)=>{
                        const newUser = new User({
                            
                            name,
                            email,
                            mobile,
                            is_admin:false,
                            password:hashPassword,
                            verified: false,
                            referalCode:req.body.referal?req.body.referal:null
                        });
                        
                        newUser.save()
                        .then((result)=>{
                            // req.session.userId=result._id
                          
                            sendOtpVerificationEmail(result,res);

                        }).catch((error)=>{
                            // res.render('login1',{message:"an error occured while hashing the password"})
                            console.log(error.message);
                        })

                    })
                
            })
        }

    }catch(error){
        console.log(error.message);
    }
}






const userOtpVerify = async(req,res)=>{
    try{
        
        const{userId,otp,email,forgot}=req.body;

        if(!otp){
            throw new Error("Empty otp details are not allowed")
        }else if(!user){

        }else{
            const UserOTPVerifivationRecords= await userOtpVerification.findOne({userId
            });
            if(UserOTPVerifivationRecords.length <=0){
                //no records found
                throw new Error(
                    "Account record doesn't exist or has been verified already.Please sign up or log in")
                
                }else{
                    //user otp exist
                    const {expiresAt}=UserOTPVerifivationRecords;
                    const hashedOTP = UserOTPVerifivationRecords.otp;
                    if(expiresAt < Date.now()){
                        
                        //user otp has expires
                        userOtpVerification.deleteMany({userId});
                        throw new Error("Code has expired. Please request again.");
                    }else{
                        const validOTP = await bcrypt.compare(otp,hashedOTP);
                        req.session.userId=userId
                        if(!validOTP){
                            //supplied otp is wrong
                            throw new Error("Invalid code passed.Check your OTP again");
                        }else{
                            //succes
                            if(forgot){

                                
    
                                await userOtpVerification.deleteMany({userId});
                                res.render('newpass',{log:"hi"})

                            }else{
                        
                                const user =  await  User.findOne({_id:userId})
                                if(user.referalCode !== null){
                                    const code=user.referalCode
                                    const data = {
                                        amount: 1000,
                                        date: Date.now(),
                                    }
                                    const data2 = {
                                        amount: 200,
                                        date: Date.now(),
                                    }
                                    await User.findOneAndUpdate({referalCode:code}, { $inc: { wallet: 1000 }, $push: { walletHistory: data } })
                                    await User.findOneAndUpdate({_id:userId}, { $inc: { wallet: 200 }, $push: { walletHistory: data2 } })
                                }
                            await User.updateOne({_id:userId},{verified: true})
                                let referal = Math.floor(Math.random() * 90000) + 10000;
                                await User.findOneAndUpdate({_id:userId},{$set:{referalCode:referal,is_varified:true}})
                                const userData = await User.findOne({_id:userId})
                            req.session.userId=userId

                            await userOtpVerification.deleteMany({userId});
                            res.redirect('/')
                            }
                        }
                    }
                }
        }
    }catch(error){
        console.log(error.message);
    }

}




const loadHome=async (req,res)=>{
    try {
        res.redirect('/')
    } catch (error) {
        console.log(error.message)
    }
}




const forgotPassword = async(req,res)=>{
    try {
        const email = req.body.email
        const result = await User.findOne({email:email})
        const forgotPassword = 1

       if(result){
        req.session.userId=result._id
        sendOtpVerificationForgot(result,res);
       }else{
        res.render('login1',{message:"No Use found on the provided Email"})
       }

      
       
    } catch (error) {
        console.log(error.message)
    }
}

const loadDashboard = async(req, res) => {
    try {
        const userId = req.session.userId;

        // const totalPages = Math.ceil(totalOrder / limit);
        const address = await Address.findOne({ user: userId });
        const user = await User.findOne({ _id: userId });
        const wallet = await User.findOne({ _id: userId }).select('wallet walletHistory').sort({walletHistory:-1})
        const coupon = await Coupon.find({});
        const cart= await Cart.findOne({user:userId}).populate('product.productId')
        let subtotal
        if(cart){
            subtotal = cart.product.reduce((acc,curr)=>{
                return acc +curr.productId.price
            },0)
        }
   
        const page = parseInt(req.query.page) || 1; 
        const limit = 10; // Display 10 wallet history details per page
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const order = await Order.find({ user: userId }).populate('products.productId').sort({ orderDate: -1 })
        const totalOrderPage = Math.ceil(order.length/limit)
        const total = user.walletHistory.length;
        const totalPages = Math.ceil(total / limit);

        const slicedWalletHistory = user.walletHistory.slice(startIndex, endIndex);

        res.render('dashboard', { address,subtotal,cart, user, order, totalPages, currentPage: page, coupon, wallet, slicedWalletHistory ,totalOrderPage,currentPage: page});

    } catch (error) {
        console.log(error.message);
    }
}



const editProfile = async(req,res)=>{
    try {
        const name = req.body.name
        const phone = req.body.phone
        const userId = req.session.userId
        await User.updateOne({_id:userId},{$set:{name:name,mobile:phone}})    
        res.json({success:true}) 
    } catch (error) {
        console.log(error.message);
    }
}


const userLogout = async(req,res)=>{

    try {
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.log(error.message);
    }
} 

const userHome = async(req,res)=>{
    try {
        const userd=req.session.userId
        
        const cart= await Cart.findOne({user:userd}).populate('product.productId')
        const wishlist = await Wishlist.findOne({user:userd})
        let subtotal
        if(cart){
            subtotal = cart.product.reduce((acc,curr)=>{
                return acc +curr.productId.price
            },0)
        }
      
        res.render('home',{userd,cart,subtotal,wishlist})

    } catch (error) {
        console.log(error.message);
    }
}
const loadLogin = async(req,res)=>{
    try {
        res.render('login1')
    } catch (error) {
        
    }
}
const verifyLogin = async(req,res)=>{
    try {

        const email = req.body.email;
        const password= req.body.password;
        const userData =await User.findOne({email:email});
        if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password);
            if(passwordMatch){

                if(userData.is_blocked == true){
                    res.render('login1',{blockMessage:"Your accound has been blocked"})
                }else if(userData.is_varified == false){
                    const result = {
                        _id:userData._id,
                        email:userData.email
                    }
                    sendOtpVerificationEmail(result,res);
                }else{
               req.session.userId=userData._id;
              
               res.redirect('/')
                }
            }else{
                res.render('login1',{message:"Email and passsword are Incorrect"})
            }
        }else{

            res.render('login1',{message:"Email and password are Incorrect"});
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

const resentOTPVerification = async(req,res)=>{
    try {
      const email=req.body.userId
      const forgot=req.body.forgot
       const userId = req.session.userId
        if(!userId || !email){
            throw new Error("Empty user details are not allowed")
        }else{
            //delete existing records and resend
            await userOtpVerification.deleteMany({userId});
            sendResentOtpVerificationEmail({_id:userId,email,},forgot,res);
        }
    } catch (error) {
        console.log(error.message);
    }
}


const user = async(req,res)=>{
   
}


const registerWithGoogle =  async (oauthUser) => {
      const isUserExists = await googleUser.findOne({
        accountId: oauthUser.id,
        provider: oauthUser.provider,
      });
      if (isUserExists) {
        const failure = {
          message: 'User already Registered.',
        
          
        };
        return { failure };
      }
  
      const user = new googleUser({
       
        accountId: oauthUser.id,
        name: oauthUser.displayName,
        provider: oauthUser.provider,
        email: oauthUser.emails[0].value, //optional - storing it as extra info
      
      });
      await user.save();
      const success = {
        message: 'User Registered.',
      };
      return { success };
    };
 
const changePassword = async(req,res)=>{
    try{
        const userId = req.session.userId
        const user = await User.findOne({_id:userId})
        const password=req.body.password
        const saltRounds=10;
        const hashedPassword = await bcrypt.hash(password,saltRounds)
        await  User.findOneAndUpdate({_id:userId},{$set:{password:hashedPassword}})
        
        res.redirect('/logining')
    }catch(error){
        console.log(error.message);
    }
}
const loadWhishlist = async (req, res) => {
    try {
        const userId = req.session.userId;

        const wishlist = await Wishlist.findOne({ user: userId })
            .populate({ path: 'products.productId', model: 'Product', populate: { path: 'offer', model: 'offer' } });

        res.render('whishlist', { wishlist });

    } catch (error) {
        console.log(error.message);
      
    }
}

const addToWishlist= async(req,res)=>{
    try{
        const productId = req.body.id
        const userId=req.session.userId
        if(!userId){
            res.json({removed:true , message:"Please login "})
        }else{
        const exist = await Wishlist.findOne({user:userId})
        if(!exist){
            const newWishlist = new Wishlist({
                user: userId,
                products: [{productId:productId}]
            })
            await newWishlist.save();
            res.json({ added: true, message: 'Item added to wishlist' })
        }else{
            const productExist = await Wishlist.findOne({user:userId,'products.productId':productId})
            if(productExist){
                await Wishlist.findOneAndUpdate(
                    { user: userId, 'products.productId': productId }, 
                    { $pull: { products: { productId: productId } } }, 
                    { new: true })
                    res.json({remove:true,message:'Item Removed from Wishlist'})
            }else{
                    await Wishlist.findOneAndUpdate({
                        user:userId },
                        {$addToSet:{products:{productId:productId}}},
                        {upsert:true,new:true})
                    res.json({ added: true, message: 'Item added to wishlist' })
            }
        }
 
    }
    }catch(error){
        console.log(error.message)
    }
}
const removeWishlist = async(req,res)=>{
    try {
        const id = req.body.id 
        const userId = req.session.userId

        const wishRemove =await whishlistModal.findOneAndUpdate({user:userId},
            { $pull: { products: { productId: id} } }, 
            { new: true })

        
        res.json({remove:true})
    } catch (error) {
        console.log(error.message)
    }
}
const sendOtpVerificationForgot = async(result,res)=>{
    try {
       
        const otp =`${Math.floor(1000 + Math.random() * 9000)}`
        console.log(otp,"THIS IS THE OTP");
//mail option
const mailOption = {
        from : process.env.AUTH_EMAIL,
        to: result.email,
        subject:"Verify Your Email",
        html: `<p>Enter the <b>${otp}</b> to verify your email address and complete the sign up</p>`
    }
    const saltRounds = 10 ;
    const userOtpVerificationRecord = await userOtpVerification.findOne({ userId: result._id });
    
    if (userOtpVerificationRecord) {
        const hashedOtp = await bcrypt.hash(otp,saltRounds)
    
        await userOtpVerification.updateOne({ userId: result._id }, { otp:hashedOtp, createAt: Date.now() });
    } else {
    const newhash = await bcrypt.hash(otp,saltRounds)
    
    const newOTPVerification  = await new userOtpVerification({
        userId: result._id,
        otp: newhash,
        createdAt: Date.now(),
        expiresAt: Date.now()+3600000,
    });
    //save otp record
    await newOTPVerification.save();
}
   
    await transporter.sendMail(mailOption);
    res.render('otp copy',{message:"Verification otp  sented",
           
            email:result.email,
            userId:result._id
            
            
        
        
    })
    
    }catch (error) {
      console.log(error.message);
    }
}
const userForgotOtpVerify = async(req,res)=>{
    try{
        
        const{userId,otp,email}=req.body;
       

        
   
        
        if(!otp){
            throw new Error("Empty otp details are not allowed")
        }else if(!user){

        }else{
            const UserOTPVerifivationRecords= await userOtpVerification.findOne({userId
            });
            if(UserOTPVerifivationRecords.length <=0){
                throw new Error(
                    "Account record doesn't exist or has been verified already.Please sign up or log in")
                
                }else{
                    //user otp exist
                    const {expiresAt}=UserOTPVerifivationRecords;
                    const hashedOTP = UserOTPVerifivationRecords.otp;
                    if(expiresAt < Date.now()){
                        //user otp has expires
                        userOtpVerification.deleteMany({userId});
                        throw new Error("Code has expired. Please request again.");
                    }else{
                        const validOTP = await bcrypt.compare(otp,hashedOTP);
                        req.session.userId=userId
                        if(!validOTP){
                            //supplied otp is wrong
                            throw new Error("Invalid code passed.Check your OTP again");
                        }else{
                            //succes
                           

                                
    
                                await userOtpVerification.deleteMany({userId});
                                res.render('newpass',{log:"hi"})

                        }
                    }
                }e
        }
    }catch(error){
        console.log(error.message);
    }

}





module.exports ={
    verifyRegister,
    securePassword,
    userHome,
    loadHome,
    loadLogin,
    userLogout,
    verifyLogin,
    sendOtpVerificationEmail,
    resentOTPVerification,
    userOtpVerify,
    forgotPassword,
    loadDashboard,
    editProfile,
    changePassword,
    loadWhishlist,
    addToWishlist,
    removeWishlist,
    sendOtpVerificationForgot,
    userForgotOtpVerify,
   
    user,
   registerWithGoogle,
  


}  