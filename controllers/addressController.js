const User = require('../models/userModel');
const Category = require('../models/categoriesModel');
const Products = require('../models/productModel')
const Cart = require('../models/cartModel')
const { find, findOne } = require('../models/userVerification');
const Address = require('../models/addressModel')

const addAddress=async(req,res)=>{
    try {
        console.log("reached");
        const data = req.body
        const userId = req.session.userId
        console.log(userId,"this is id",data);
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
                console.log(result,"success",req.body.redirect);
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
        const number= req.body.count
        console.log(number,"helo");
        res.render()
    } catch (error) {
        
    }
}

module.exports ={
    addAddress,
    editAddress
}