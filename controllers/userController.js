const userModels = require('../models/userModel');
const User= require('../models/userModel');
const bcrypt =require('bcrypt')
const userOtpVerification = require('../models/userVerification')
const nodemailer = require('nodemailer');
const dotenv = require('dotenv').config()
const FacebookStrategy= require('passport-facebook').Strategy
const passport = require('passport')
const nocache = require('nocache')
const Category = require('../models/categoriesModel');
const Products=require('../models/productModel')
const Address = require('../models/addressModel')
const Order = require('../models/orderModel')
const googleUser=require('../models/googleModel')
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
    await transporter.sendMail(mailOption);
    res.render('otp',{message:"Verification otp  sented",
           
            email:result.email,
            userId:result._id
            
            
        
        
    })

    } catch (error) {
      console.log(error.message);
    }
}


const ForgotPasswordOTPSent = async(result,res)=>{
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
    await transporter.sendMail(mailOption);
    res.render('otp',{message:"Verification otp  sented",
           
            email:result.email,
            userId:result._id,
            forgot:"yes"
            
            
        
        
    })

    } catch (error) {
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

const sendResentOtpVerificationEmail = async(result,res)=>{
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
    await transporter.sendMail(mailOption);
    res.render('otp',{message:"Otp sended Again",
           
            email:result.email,
            userId:result._id
            
        
        
    })

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
        // console.log(req.session.userId);

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
                        if(!validOTP){
                            //supplied otp is wrong
                            throw new Error("Invalid code passed.Check your OTP again");
                        }else{
                            //succes
                            console.log(userId,typeof(userId));

                            await User.updateOne({_id:userId},{verified: true})

                            await userOtpVerification.deleteMany({userId});
                            res.render('home',{log:"hi"})
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
    

       if(result){
        
        console.log("no user found");
        ForgotPasswordOTPSent(result,res);
       }else{
        res.render('login1',{message:"No Use found on the provided Email"})
       }

      
       
    } catch (error) {
        console.log(error.message)
    }
}

const loadDashboard = async(req,res)=>{
    try {
        const userId = req.session.userId
        const address= await Address.findOne({user:userId})
        const order = await Order.find({user:userId}).populate('products.productId')
        
        const user = await User.findOne({_id:userId})
        console.log("start",user    ); 
        res.render('dashboard',{address,user,order})
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
      
       console.log(req.body);
    //    console.log(req.session.email,"helloemail");
       console.log(req.session.userId," ","sessionnnnnnnnnnn");
       const userId = req.session.userId
       console.log(userId)
        if(!userId || !email){
            throw new Error("Empty user details are not allowed")
        }else{
            //delete existing records and resend
            await userOtpVerification.deleteMany({userId});
            sendResentOtpVerificationEmail({_id:userId,email,},res);
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
   
    user,
   registerWithGoogle,
  


}  