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


// passport.use(
//     new FacebookStrategy(
//         {
//             clientID: process.env.FACEBOOK_CLIENT_ID,
//             clientSecret:process.env.FACEBOOK_SECRET_KEY,
//             callbackURL: process.env.FACEBOOK_CALLBACK_URL,
//         },
//         async function(accessToken, refreshToken, profile, cb){
//             const user = await User.findO({
//                 accountId: profile.id,
//                 provider: 'facebook',
//             });
//             if (!user){
//                 console.log('Adding new facebook user to DB');
//                 const user = new User({
//                     accountId : profile.id,
//                     name : profile.displayName,
//                     provider: profile.provider,
//                 });
//                 await user.save();
//                 console.log(user);
//                 return cb(null,profile);
//             }
//         }
//     )
// )




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
console.log(typeof otp, 'dkfdhf')
    
    const newOTPVerification  = await new userOtpVerification({
        userId: result._id,
        otp: newhash,
        createdAt: Date.now(),
        expiresAt: Date.now()+3600000,
    });
    //save otp record
    await newOTPVerification.save();
}
   
   console.log("else runnning")
    await transporter.sendMail(mailOption);
    console.log(result.email,"  hhhu ",result._id)
    res.render('otp',{message:"Verification otp  sented",
           
            email:result.email,
            userId:result._id
            
            
        
        
    })
    
    }catch (error) {
      console.log(error.message);
    }
}




const loadHome = async(req,res)=>{
    try {
           const userId=req.session.userId

            res.render('home',{userId})
    
        
    } catch (error) {
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
console.log(typeof otp, 'dkfdhf')
    
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
 console.log(name,email,password,mobile);
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
                            verified: false
                        });
                        console.log(newUser,"new user log");
                        newUser.save()
                        .then((result)=>{
                            console.log(newUser,"new userr",result);
                            req.session.userId=result._id
                            console.log("hellothere");
                            console.log(result,"reslllllttttttt")
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
// const userOtpVerify = async(req,res)=>{
//     try{
        
//         console.log("otp verification running");
//         const{userId,otp,email}=req.body;
//         // console.log(req.session.userId);

//         // console.log(await bcrypt.hash(otp, 10),'aaaaa')
        
   
        
//         // console.log(req.body);
//         if(!userId ||!otp){
//             throw new Error("Empty otp details are not allowed")
//         }else{
//             const UserOTPVerifivationRecords= await userOtpVerification.findOne({userId
//             });
//             // console.log(UserOTPVerifivationRecords,"hhhhhh");
//             if(UserOTPVerifivationRecords.length <=0){
//                 //no records found
//                 throw new Error(
//                     "Account record doesn't exist or has been verified already.Please sign up or log in")
                
//                 }else{
//                     //user otp exist
//                     const {expiresAt}=UserOTPVerifivationRecords;
//                     console.log(UserOTPVerifivationRecords,"bbbbbbb");
//                     const hashedOTP = UserOTPVerifivationRecords.otp;
//                         console.log(hashedOTP,"ccccccccc");
//                     if(expiresAt < Date.now()){
//                         //user otp has expires
//                         userOtpVerification.deleteMany({userId});
//                         throw new Error("Code has expired. Please request again.");
//                     }else{
//                         console.log(typeof otp)
//                         const validOTP = await bcrypt.compare(otp,hashedOTP);
//                         console.log(validOTP,otp);
//                         if(!validOTP){
//                             //supplied otp is wrong
//                             throw new Error("Invalid code passed.Check your OTP again");
//                         }else{
//                             //succes
//                             console.log(userId,typeof(userId));

//                             await User.updateOne({_id:userId},{verified: true})

//                             await userOtpVerification.deleteMany({userId});
//                             res.render('home',{log:"hi"})
//                         }
//                     }
//                 }
//         }
//     }catch(error){
//         console.log(error.message);
//     }

// }





const userOtpVerify = async(req,res)=>{
    try{
        
        console.log("otp verification running");
        const{userId,otp,email,forgot}=req.body;
       

        // console.log(await bcrypt.hash(otp, 10),'aaaaa')
        
   
        
        // console.log(req.body);
        if(!otp){
            throw new Error("Empty otp details are not allowed")
        }else if(!user){

        }else{
            const UserOTPVerifivationRecords= await userOtpVerification.findOne({userId
            });
            // console.log(UserOTPVerifivationRecords,"hhhhhh");
            if(UserOTPVerifivationRecords.length <=0){
                //no records found
                throw new Error(
                    "Account record doesn't exist or has been verified already.Please sign up or log in")
                
                }else{
                    //user otp exist
                    const {expiresAt}=UserOTPVerifivationRecords;
                    console.log(UserOTPVerifivationRecords,"bbbbbbb");
                    const hashedOTP = UserOTPVerifivationRecords.otp;
                        console.log(hashedOTP,"ccccccccc");
                    if(expiresAt < Date.now()){
                        //user otp has expires
                        userOtpVerification.deleteMany({userId});
                        throw new Error("Code has expired. Please request again.");
                    }else{
                        console.log(typeof otp)
                        const validOTP = await bcrypt.compare(otp,hashedOTP);
                        console.log(validOTP,otp);
                        req.session.userId=userId
                        if(!validOTP){
                            //supplied otp is wrong
                            throw new Error("Invalid code passed.Check your OTP again");
                        }else{
                            //succes
                            if(forgot){
                                console.log(userId,typeof(userId));

                                
    
                                await userOtpVerification.deleteMany({userId});
                                res.render('newpass',{log:"hi"})

                            }else{
                            console.log(userId,typeof(userId));

                            await User.updateOne({_id:userId},{verified: true})

                            await userOtpVerification.deleteMany({userId});
                            res.render('home',{log:"hi"})
                            }
                        }
                    }
                }
        }
    }catch(error){
        console.log(error.message);
    }

}









const forgotPassword = async(req,res)=>{
    try {
        console.log(req.body.email);
        const email = req.body.email
        const result = await User.findOne({email:email})
        const forgotPassword = 1

       if(result){
        req.session.userId=result._id
        console.log("no user found");
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

        const address = await Address.findOne({ user: userId });
        const order = await Order.find({ user: userId }).populate('products.productId').sort({ orderDate: -1 });
        const user = await User.findOne({ _id: userId });
        const wallet = await User.findOne({ _id: userId }).select('wallet walletHistory').sort({walletHistory:-1})
        const coupon = await Coupon.find({});

        const page = parseInt(req.query.page) || 1; 
        const limit = 10; // Display 10 wallet history details per page
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const total = user.walletHistory.length;
        const totalPages = Math.ceil(total / limit);

        const slicedWalletHistory = user.walletHistory.slice(startIndex, endIndex);

        res.render('dashboard', { address, user, order, totalPages, currentPage: page, coupon, wallet, slicedWalletHistory });

    } catch (error) {
        console.log(error.message);
    }
}



const editProfile = async(req,res)=>{
    try {
        const name = req.body.name
        const phone = req.body.phone
        const userId = req.session.userId
        console.log(name,phone,userId);
        await User.updateOne({_id:userId},{$set:{name:name,mobile:phone}})    
        res.redirect('/dashboard') 
    } catch (error) {
        console.log(error.message);
    }
}


const userLogout = async(req,res)=>{

    try {
        console.log("ivide ethi  23456789");
        req.session.destroy();
        res.redirect('/');

    } catch (error) {
        console.log(error.message);
    }
} 

const userHome = async(req,res)=>{
    try {
       
        
        res.render('home')
    } catch (error) {
        
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
        console.log('etheetund');

        const email = req.body.email;
        const password= req.body.password;
console.log(email,passport);
        const userData =await User.findOne({email:email});
        console.log(userData);
        if(userData){
            // console.log('matched');
            const passwordMatch = await bcrypt.compare(password,userData.password);
            if(passwordMatch){
                console.log('match hogaya');

                if(userData.is_blocked == true){
                    res.render('login1',{blockMessage:"Your accound has been blocked"})
                }else{
                console.log(userData._id,"here reached")
               req.session.userId=userData._id;
              
               res.redirect('/loadHome')
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
        console.log("ethi   ihiyghqfjqevphofubufjepiv");
      const email=req.body.userId
      const forgot=req.body.forgot
       console.log(req.body);
    //    console.log(req.session.email,"helloemail");
       console.log(req.session.userId," ","sessionnnnnnnnnnn",email,forgot);
       const userId = req.session.userId
       console.log(userId)
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
   res.render('zayedLogin')
   
}


const registerWithGoogle =  async (oauthUser) => {
    console.log("google");
      const isUserExists = await googleUser.findOne({
        accountId: oauthUser.id,
        provider: oauthUser.provider,
      });
      if (isUserExists) {
        const failure = {
          message: 'User already Registered.',
        
          
        };
        console.log(failure);
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
      console.log(success);
      return { success };
    };
  
    // loginUser: async (oauthUser) => {
    //   const userExists = await User.findOne({ email: oauthUser.emails[0].value });
    //   if (userExists) {
    //     const success = {
    //       message: 'User successfully logged In.',
    //     };
    //     return { success };
    //   }
    //   const failure = {
    //     message: 'Email not Registered. You need to sign up first',
    //   };
    //   return { failure };
    // },
const changePassword = async(req,res)=>{
    try{
        console.log(req.session.userId);
        const userId = req.session.userId
        const user = await User.findOne({_id:userId})
        const password=req.body.password
        console.log(user);
        const saltRounds=10;
        console.log("before");
        const hashedPassword = await bcrypt.hash(password,saltRounds)
        console.log(hashedPassword,"eu",password);
        await  User.findOneAndUpdate({_id:userId},{$set:{password:hashedPassword}})
        
        console.log("finished");
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

        console.log(wishlist, "it is here");
        res.render('whishlist', { wishlist });

    } catch (error) {
        console.log(error.message);
      
    }
}

const addToWishlist= async(req,res)=>{
    try{
        console.log("hello widhlist",req.body.id);
        const productId = req.body.id
        const userId=req.session.userId
        if(!userId){
            res.json({removed:true , message:"Please login "})
        }else{
        const exist = await Wishlist.findOne({user:userId})
        console.log("hello widhlist",exist);
        if(!exist){
            const newWishlist = new Wishlist({
                user: userId,
                products: [{productId:productId}]
            })
            await newWishlist.save();
            console.log(newWishlist,"hello")
            console.log("added");
            res.json({ added: true, message: 'Item added to wishlist' })
        }else{
            console.log("user Exist");
            const productExist = await Wishlist.findOne({user:userId,'products.productId':productId})
            console.log("her is the product xist ",productExist);
            if(productExist){
                console.log("user product Exist");
                await Wishlist.findOneAndUpdate(
                    { user: userId, 'products.productId': productId }, 
                    { $pull: { products: { productId: productId } } }, 
                    { new: true })
                    console.log("removed");
                    res.json({remove:true,message:'Item Removed from Wishlist'})
            }else{
                    await Wishlist.findOneAndUpdate({
                        user:userId },
                        {$addToSet:{products:{productId:productId}}},
                        {upsert:true,new:true})
                        console.log("added");
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
        console.log(result.email,"emilllllll",result)
        console.log(result.userId,"idddddddddddddddddddd")
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
        console.log(hashedOtp,"kfdkakvn")
        await userOtpVerification.updateOne({ userId: result._id }, { otp:hashedOtp, createAt: Date.now() });
    } else {
    const newhash = await bcrypt.hash(otp,saltRounds)
console.log(typeof otp, 'dkfdhf')
    
    const newOTPVerification  = await new userOtpVerification({
        userId: result._id,
        otp: newhash,
        createdAt: Date.now(),
        expiresAt: Date.now()+3600000,
    });
    //save otp record
    await newOTPVerification.save();
}
   
   console.log("else runnning")
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
        
        console.log("otp verification running forgot");
        const{userId,otp,email}=req.body;
       

        console.log(await bcrypt.hash(otp, 10),'aaaaa')
        
   
        
        // console.log(req.body);
        if(!otp){
            throw new Error("Empty otp details are not allowed")
        }else if(!user){

        }else{
            const UserOTPVerifivationRecords= await userOtpVerification.findOne({userId
            });
            // console.log(UserOTPVerifivationRecords,"hhhhhh");
            if(UserOTPVerifivationRecords.length <=0){
                //no records found
                throw new Error(
                    "Account record doesn't exist or has been verified already.Please sign up or log in")
                
                }else{
                    //user otp exist
                    const {expiresAt}=UserOTPVerifivationRecords;
                    console.log(UserOTPVerifivationRecords,"bbbbbbb");
                    const hashedOTP = UserOTPVerifivationRecords.otp;
                        console.log(hashedOTP,"ccccccccc");
                    if(expiresAt < Date.now()){
                        //user otp has expires
                        userOtpVerification.deleteMany({userId});
                        throw new Error("Code has expired. Please request again.");
                    }else{
                        console.log(typeof otp)
                        const validOTP = await bcrypt.compare(otp,hashedOTP);
                        console.log(validOTP,otp);
                        req.session.userId=userId
                        if(!validOTP){
                            //supplied otp is wrong
                            throw new Error("Invalid code passed.Check your OTP again");
                        }else{
                            //succes
                           
                                console.log(userId,typeof(userId));

                                
    
                                await userOtpVerification.deleteMany({userId});
                                res.render('newpass',{log:"hi"})

                        }
                    }
                }
        }
    }catch(error){
        console.log(error.message);
    }

}





module.exports ={
    verifyRegister,
    securePassword,
    userHome,
    loadLogin,
    loadHome,
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