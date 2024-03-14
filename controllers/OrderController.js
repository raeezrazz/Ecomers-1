
const User = require('../models/userModel');
const Category = require('../models/categoriesModel');
const Products = require('../models/productModel')
const Cart = require('../models/cartModel')
const Order = require('../models/orderModel')
const { find, findOne } = require('../models/userVerification');
const { session } = require('passport');
const Address = require('../models/addressModel');





const loadOrders = async(req,res)=>{
    try {
        const order = await Order.find()
        res.render('orderPage',{order})
    } catch (error) {
        console.log(error.message);
        
    }
}
const placeOrder = async(req,res)=>{
    try {
        console.log(req.body,'oijhoijbojbokn');
        const userId = req.session.userId
        const method = req.body.methode
        const productTotal =await Cart.findOne({user:userId})
        const user = await User.findOne({_id:userId})
        // console.log(userId,"1",method,"2","3",productTotal,"4",user,"end");
        // const address = await Address.findOne({'address._id':addressId})
        // console.log(address.address[0],"gfsba","kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk");
        let status=method=="Cash on Delivery"||method=="wallet" ? "placed":"pending"

        const product = productTotal.product

        const subtotal=product.reduce((acc,val)=>acc+(val.price)*val.quantity,0)

        console.log(subtotal,"ggggggggggggggggggggggg");

        const cartItem = productTotal.product
        const addressIndex = req.body.Address
        const address = await Address.findOne({user:userId})
        console.log("here","ended here rewif",address);
        // const realAddress = 
        const addre = address.address[addressIndex]


        console.log(addressIndex,"fbagvyhbfzbvzb",addre);
    

        
        const order = new Order({
            user:userId,
           
            delivery_address:addre,
            payment:method,
            products:cartItem,
            subtotal:subtotal,
            orderStatus:status,
            orderDate:new Date()
            
        })
    
        await order.save()
        console.log("saved");
        const orderId=order._id
        console.log(method);
        if(method =="Cash on delivery"){
            for(const product of cartItem){
                await Products.updateOne({_id:product.productId},{$inc:{ quantity:-product.quantity}})
            }
            console.log("cod");
            await Cart.deleteOne({user:userId})
            console.log("finished");
            res.redirect('/successPage')
        }else{
            console.log("methode error");
        }
    
    } catch (error) {
        console.log(error.message);
    }
}
const loadSuccess = async(req,res)=>{
    try {
        res.render('success')
    } catch (error) {
        console.log(error.message);
    }
}

const loadOrderDetails = async(req,res)=>{
    try {
        console.log(req.params);
        const userId = req.session.userId
        const orderNum =req.params.id
        const allOrder = await  Order.findOne({user:userId})
        console.log("gretdsbfefdg",allOrder);
        const order = allOrder.order[orderNum]
   
        const addressId = order.delivery_address
        const address = await Address.findOne({_id:addressId})
        console.log(order,"ggs",address);
        const product = await Products.findOne({_id:'order'})
        res.render('orderDetails',{})
    } catch (error) {
        console.log(error.message);
    }
}

const detailedPageLoad = async(req,res)=>{
    try {
        const index = req.params.index
        const allOrder = await Order.find()
        const detials = allOrder[index]
        // console.log(order);

        res.render('detailedOrderView',{detials})
    } catch (error) {
        console.log(error.message);
    }
}

const viewFullOrder = async(req,res)=>{
    try {
        const id = req.params.id
        console.log("hihlwownwdwe");
        const detials = await Order.findOne({_id:id})
        console.log(detials,"this is detials")
        const product =detials.products
        const userId = req.session.userId
        const user = await User.findOne({_id:userId})
        console.log(detials,user);
        res.render('detailedOrder',{detials,user})
    } catch (error) {
        console.log(error.message)
    }
}
const updateStatus= async(req,res)=>{
    try {
        console.log('status')
        const productId = req.body.productId
        const status = req.body.status
        console.log(productId,status);
        const updateorder = await Order.findOneAndUpdate({'products._id':productId},{$set:{'products.$.productStatus':status}},{new:true})
        return res.json({success:true})
        console.log("done")
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadOrders,
    placeOrder,
    loadSuccess,
    loadOrderDetails,
    detailedPageLoad,
    viewFullOrder,
    updateStatus
}