
const User = require('../models/userModel');
const Category = require('../models/categoriesModel');
const Products = require('../models/productModel')
const Cart = require('../models/cartModel')
const Addres = require('../models/addressModel')
const { find, findOne } = require('../models/userVerification');
const { session } = require('passport');

const loadCart = async(req,res)=>{
    try {
        const userId=req.session.userId
        console.log(userId,req.session.uerId);
        if(userId){
        const userCart= await Cart.findOne({user:userId}) 
        if(userCart){
            console.log(userCart,"hello");
            const userProducts = userCart.product
            console.log(userProducts);
            const subtotal= userProducts.reduce((acc,val)=>acc+(val.price)*val.quantity,0)
            console.log(subtotal);
            if(userProducts){
                res.render('cart',{userProducts,subtotal})
            }
        }else{
            res.render('cart')
        }
       
    }else{
        res.redirect('logining')
    }
    } catch (error) {
        console.log(error.message);
    }
}
const addCart = async(req,res)=>{
    try {
        const quantity =req.params.quantity
        const id = req.params.id
        const userId=req.session.userId
        const product= await Products.findOne({_id:id})
        const productId =product._id
        const userExist = await Cart.findOne({user:userId})
       
console.log(quantity,'quantity');
        if(userExist){

            const exist=await Cart.findOne({user:userId,'product.productId':productId})
        if(exist){
            console.log("producte exist");
            res.redirect('/loadProducts')
        }else{
            console.log(" exist user");
            await Cart.findOneAndUpdate({user:userId},{$push:{product:[{
                productId:product._id,
                name:product.name,
                quantity:quantity,
                price:product.price,
                images:product.images
            }]}},{upsert:true,new:true})
            res.redirect('/loadCart')
        }
    }else{
            console.log("new user");   
        const newCartProduct = new Cart({
            user:req.session.userId,
            product:[{
                productId:product._id,
                name:product.name,
                quantity:1,
                price:product.price,
                images:product.images
            }]
            
        }) 
        await newCartProduct.save()
        .then((result)=>{
            res.redirect('/loadProducts')
        })

        }


        // console.log(newCartProduct,"new");
            // newCartProduct.save()
            // .then((result)=>{
            //     res.redirect('/loadProducts')
            // })
    } catch (error) {
        console.log(error.message);
    }
}

const removeCart = async (req,res)=>{
    try {
        const productId = req.params.id;
        const userId=req.session.userId
        const result = await Cart.findOneAndUpdate({user:userId},{$pull:{product:{productId:productId}}})
        
        console.log(result,"hi");
       
            res.redirect('/loadCart')
        

    } catch (error) {
        console.log(error.message);
    }
}


const loadCheckout = async(req,res)=>{
    try {
        const userId = req.session.userId
        const address = await Addres.findOne({user:userId});
        const product = await Cart.findOne({user:userId})
        console.log(product,address);
        if(address){
            const data = address.address
            res.render('checkout',{data,address})
        }else{
            const data=null
            res.render('checkout',{data,address,product})
        }
       
    } catch (error) {
        console.log(error.message);
    }
}
const updateQuantity = async(req,res)=>{
    try {
        console.log(req.body)
        const userId = req.session.userId
        const productId = req.body.productId
        const count = req.body.count
        const cart = await Cart.findOne({user:userId})
        const product = await Products.findOne({_id:productId})
        console.log(cart,"this is cart");
        if(count == -1){
            const productQuantity = cart.product.find((p)=>p.productId==productId).quantity
            console.log(productQuantity ,"final")
            if(productQuantity <=1){
                return res.json({success:false,message:'Quantity cannot be decreased further. '})
            }
        }
        if(count ==1){
            const productQuantity = cart.product.find((p)=>p.productId ==productId).quantity
            if(productQuantity +count >product.quantity){
                return res.json({success:false , message: 'Stock limit reached'})
            }
        }
        const updateCart = await Cart.findOneAndUpdate(
            {user:userId ,'product.productId':productId},
            {
                $inc:{
                    'product.$.quantity':count,
                    'product.$.totalPrice':count*cart.product.find(p=>p.productId.equals(productId)).price,
                },
            },
            {new:true}
        );
        console.log("reached at the end");
        res.json({success:true})
        
    } catch (error) {
        console.log(error.message)
    }
}

module.exports ={
    loadCart,
    loadCheckout,
    addCart,
    removeCart,
    updateQuantity
}