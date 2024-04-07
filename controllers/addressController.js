const User = require('../models/userModel');
const Category = require('../models/categoriesModel');
const Products = require('../models/productModel')
const Cart = require('../models/cartModel')
const { find, findOne } = require('../models/userVerification');
const Address = require('../models/addressModel')
const Wishlist =require('../models/whishlistModal')
const Coupon =require('../models/couponModel')

const addAddress=async(req,res)=>{
    try {
        console.log("reached");
        const data = req.body
        const userId = req.session.userId
        // console.log(userId,"this is id",data);
        const exist = await Address.findOne({user:userId})
        if(exist){
            console.log("exist");
            await Address.findOneAndUpdate({user:userId},{$push:{
                address:[{
                    name:data.name,
                    address:data.address,
                    landmark:data.landmark,
                    state:data.state,
                    city:data.city,
                    district:data.district,
                    pincode:data.pincode,
                    phone:data.phone,
                    email:data.email
                }]
            }}) 
            if(req.body.redirect ==='checkout'){
                res.redirect('/loadCheckout')
            }else{
            res.redirect('dashboard')
            }
        }else{
            const address = new Address({
                user:userId,
                address:[{
                    name:data.name,
                    address:data.address,
                    landmark:data.landmark,
                    state:data.state,
                    city:data.city,
                    district:data.district,
                    pincode:data.pincode,
                    phone:data.phone,
                    email:data.email
                }]
            })
            await address.save()
            .then((result)=>{
                // console.log(result,"success",req.body.redirect);
                if(req.body.redirect ==='checkout'){
                    res.redirect('/loadCheckout')
                }else{
                res.redirect('dashboard')
                }
            })
        }
    } catch (error) {
        console.log(error.message);
    }
}
const editAddress = async(req,res)=>{
    try {
        const{address,
            name,
            email,
            phone,
            pincode,
            landmark,
            city,
            district,
            state,id}=req.body
       const userId = req.session.userId
            console.log(address,
                name,
                email,
                phone,
                pincode,
                landmark,
                city,
                district,
                state,id)
       const oldAddress = await Address.findOneAndUpdate({$and:[{user:userId},{'address._id':id}]},{address:{address:address,
        name:name,
        email:email,
        phone:phone,
        pincode:pincode,
        landmark:landmark,
        city:city,
        district:district,
        state:state}})

       res.json({success:true})
    
    } catch (error) {
        
    }
}
const deleteAddress = async(req,res)=>{
    try{
        console.log("reached")
        const id = req.body.id
        const userId=req.session.userId
        console.log(id,userId)
        await Address.findOneAndUpdate({user:userId},{$pull:{address:{_id:id}}})
        console.log("finished");
        res.redirect('/Dashboard')
    }catch(error){
        console.log(error.message)
    }
}
module.exports ={
    addAddress,
    editAddress,
    deleteAddress
}
