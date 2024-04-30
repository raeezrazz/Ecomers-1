
const User = require('../models/userModel');
const Category = require('../models/categoriesModel');
const Products = require('../models/productModel')
const Cart = require('../models/cartModel')
const Order = require('../models/orderModel')
const { find, findOne } = require('../models/userVerification');
const { session } = require('passport');
const Address = require('../models/addressModel');
const Wishlist =require('../models/whishlistModal')
const Coupon =require('../models/couponModel')


const loadCoupon =async(req,res)=>{
    try {
        const coupon = await Coupon.find()
        res.render('coupon',{coupon})
    } catch (error) {
        console.log(error.message)
    }
}
const loadCreateCoupon= async(req,res)=>{
    try {
        res.render('createCoupon')
    } catch (error) {
        console.log(error.message)
    }
}

const submitCoupon = async(req,res)=>{
    try {
        console.log(req.body)
        const{name,code,discount,criteria,start,expiry}=req.body
       
        const exist = await Coupon.findOne({couponCode:code})
        const today = new Date().getFullYear()-new Date().getMonth()
          console.log(today,start)
        if(!exist){
            console.log("not ekjf")
        // if(criteria>1000 &&discount <=100 && discount > 0 && expiry>start){

            console.log("not insie")
    

       
            const newCoupon = new Coupon({
                name:name,
                couponCode:code,
                discountAmount:discount,
                criteriaAmount:criteria,
                activationDate:start,
                expiryDate:expiry
            }).save()
           
                console.log(newCoupon,"f")
                res.json({success:true})
       
        
//     }else{
//         console.log("here i")
//         if(criteria<10){
//             console.log("not crit")

//             res.render('createCoupon',{criteria:"Criteria must be above 1000 rs"})

//         }else if(start>today){
//             console.log("star")
// console.log("here found")
//         res.render('createCoupon',{start:"Start date must be above today"})
//     }else if(discount<=0){
//         res.render('createCoupon',{discount:"Discount percentage must be above 0"})

//     }else if(expiry<=start){
//         console.log("fuedj");
//         res.json({result:expired})

//     }else{
//         console.log("jfi")
//         res.json({result:exist})

//     }
// }
}else{
    console.log("not in")

           res.json({success:false})


}
    } catch (error) {
        console.log(error.message)
    }
}

const removeCoupon= async(req,res)=>{
    try {
        const couponId = req.params.id
        console.log(couponId)
        const removeCoupon = await Coupon.findOneAndDelete({_id:couponId})
        if(removeCoupon){
            res.redirect('/admin/coupons')
        }else{
            console.log("removing failed")
        }
    } catch (error) {
        console.log(error.message)
    }
}

const editCoupon=async(req,res)=>{
    try{
        const couponId = req.params.id
        console.log(req.params,couponId)
        const coupon = await Coupon.findOne({_id:couponId})
        res.render('edit-coupon',{coupon})
    }catch(error){
        console.log(error.message)
    }
}

const submitCouponEdit =async(req,res)=>{
    try{
        console.log(req.body,"dcjoki")
        const{couponId,name,code,discount,criteria,start,expiry}=req.body
        const data = await Coupon.findOne({_id:couponId})
        if(data.couponCode===code){
            const coupon = await Coupon.findOneAndUpdate({_id:couponId},{$set:{name:name,couponCode:code,discountAmount:discount,criteriaAmount:criteria,activationDate:start,expiryDate:expiry}})
            console.log(coupon)
        
                res.json({success:true})
        }else{
            const exist = await Coupon.findOne({_id:couponId,couponCode:code})
            if(exist){
                res.json({success:false})
            }else{
                const coupon = await Coupon.findOneAndUpdate({_id:couponId},{$set:{name:name,couponCode:code,discountAmount:discount,criteriaAmount:criteria,activationDate:start,expiryDate:expiry}})
                console.log(coupon)
            
                    res.json({success:true})
            }
      
        }
    
    }catch(error){
        console.log(error.message)
    }
}

module.exports={
    loadCoupon,
    loadCreateCoupon,
    submitCoupon,
    removeCoupon,
    editCoupon,
    submitCouponEdit
}