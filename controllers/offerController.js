
const User = require('../models/userModel');
const Category = require('../models/categoriesModel');
const productModel = require('../models/productModel')
const Cart = require('../models/cartModel')
const Order = require('../models/orderModel')
const { find, findOne } = require('../models/userVerification');
const { session } = require('passport');
const Address = require('../models/addressModel');
const Wishlist =require('../models/whishlistModal')
const Coupon =require('../models/couponModel')
const Offer = require('../models/offerModel')


const loadOffer = async (req,res)=>{
    try {
        const offer = await Offer.find()
        res.render('offer',{offer})
    } catch (error) {
        console.log(error.message)
    }
}

const createOffer =async (req,res)=>{
    try {
        res.render('add-offer')
    } catch (error) {
        console.log(error.message)
    }
}

const submitOffer = async(req,res)=>{
    try {
        console.log(req.body,"submited")
        const {name,discount,start,expiry}=req.body

        const exist = await Offer.findOne({name:name})
        if(exist){
console.log("exist")

            res.json({success:false})

        }else{
console.log("not")

            const newOffer = new Offer({
                name:name,
                discountAmount:discount,
                activationDate:start,
                
                expiryDate:expiry
            }).save()
console.log("reached")
            console.log(newOffer)
            res.json({success:true})
        }

    } catch (error) {
        console.log(error.message)
    }
}

const deleteOffer=async(req,res)=>{
    try {
        const offerId = req.params.id
        console.log(offerId)
        const removeOffer = await Offer.findOneAndDelete({_id:offerId})
        if(removeOffer){
            res.redirect('/admin/offer')
        }else{
            console.log("remove failed")
        }
    } catch (error) {
        console.log(error.message)
    }
}
const applyOffer = async(req,res)=>{
    try{

        const productId = req.body.productId;
        const offerId = req.body.val;
        const product = await productModel.findOneAndUpdate({_id:productId},{
            offer: offerId,
        })
        console.log("success ")
        res.json({applied:true})
    }catch(error){
        console.log(error.message)
    }
}

const removeOffer = async(req,res)=>{
    try {
        console.log("reched remve")
        const productId = req.body.productId
        const product = await productModel.findOneAndUpdate({_id:productId},{offer:null})
         console.log(product)
         res.json({remove:true})
    } catch (error) {
        console.log(error.message)
    }
}



const categiresOffer = async(req,res)=>{
    try {
        
        const categoryId = req.body.categoryId;
        const offerId = req.body.val;
        const category = await Category.findOneAndUpdate({_id:categoryId},{
            offer: offerId,
        })
        console.log("success ",category)
        res.json({applied:true})
    } catch (error) {
        console.log(error.message)
    }
}

const categiresOfferRemove = async(req,res)=>{
    try {
        console.log("reched remve")
        const categoryId = req.body.categoryId
        const category = await Category.findOneAndUpdate({_id:categoryId},{offer:null})
         console.log(category)
         res.json({remove:true})
    } catch (error) {
        console.log(error.message)
    }
}


module.exports={
loadOffer,
createOffer,
submitOffer,
removeOffer,
applyOffer,
deleteOffer,
categiresOffer,
categiresOfferRemove
}