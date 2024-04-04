
const User = require('../models/userModel');
const Category = require('../models/categoriesModel');
const Products = require('../models/productModel')
const Cart = require('../models/cartModel')
const Order = require('../models/orderModel')
const { find, findOne } = require('../models/userVerification');
const { session } = require('passport');
const Razorpay = require('razorpay')
const Address = require('../models/addressModel');
const Wishlist =require('../models/whishlistModal')
const Coupon =require('../models/couponModel')
const crypto = require('crypto');


const razorpay = new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})


const loadOrders = async(req,res)=>{
    try {
        const order = await Order.find().sort({orderDate:-1})
        
        res.render('orderPage',{order})
    } catch (error) {
        console.log(error.message);
        
    }
}

const applyCoupon = async(req,res)=>{
    try{
     console.log(req.body,"jjjjjjj")
  
     const couponId = req.body.couponId;
     const userId = req.session.userId;
     const currentDate = new Date();
     const couponData = await Coupon.findOne({ _id: couponId, expiryDate: { $gte: currentDate }, is_blocked: false });
     const exists = couponData.usedUser.includes(userId);
 
     if (!exists) {
       const existingCart = await Cart.findOne({ user: userId });
       if (existingCart && existingCart.couponDiscount == null) {
         await Coupon.findOneAndUpdate({ _id: couponId }, { $push: { usedUser: userId } });
         await Cart.findOneAndUpdate({ user: userId }, { $set: { couponDiscount: couponData._id } });
         res.json({ success: true });
       } else {
        console.log("it worked")
         res.json({ success:false });
       }
     } else {
        console.log("it ")

       res.json({ success: false });
     }
    }catch(error){
        console.log(error.message)
    }
}

const removeCoupon = async(req,res)=>{
    try{
        console.log(req.body)
        const couponId=req.body.couponId
        const userId=req.session.userId
       
      
       const couponData = await Coupon.findOneAndUpdate({ _id: couponId }, { $pull: { usedUser: userId} })
       const updateCart = await Cart.findOneAndUpdate({ user: userId }, { $set: { couponDiscount: null } })
       console.log(couponData,updateCart)
       res.json({ success: true })
        
   
           
           
    }catch(error){
        console.log(error.message)
    }
}

const placeOrder = async(req,res)=>{
    try {
        console.log(req.body,'oijhoijbojboknvsdlkmzvksmvs;dV');
        const userId = req.session.userId
        const method = req.body.methode
        
        console.log(method,"firsy")
        const productTotal =await Cart.findOne({ user: userId }) .populate({ path: 'product.productId', model: 'Product', populate: { path: 'offer', model: 'offer' } }).populate('couponDiscount');
        const couponId = productTotal.couponDiscount
        const user = await User.findOne({_id:userId})
        const couponDiscount = productTotal.couponDiscount ? productTotal.couponDiscount.discountAmount : 0;
        let status=method=="Cash on Delivery"||method=="wallet" ? "placed":"pending"
        
        const product = productTotal.product

        const subtotal = productTotal.product.reduce((acc, val) => {
            const discount = val.productId.offer ? val.productId.offer.discountAmount : 0;
            return acc + (val.productId.price - discount) * val.quantity;
        }, 0);
        let amount = 0 
        console.log(couponDiscount,"giurdhgfjgfv")
        if(couponDiscount){
             amount = subtotal-(subtotal/couponDiscount)
        }else{
            amount = subtotal
        }
        console.log(subtotal,"ggggggggggggggggggggggg");

        const cartItem = productTotal.product
        const addressIndex = req.body.Address
        const address = await Address.findOne({user:userId})
        console.log("here","ended here rewif",address);
        // const realAddress = 
        const addre = address.address[addressIndex]


        console.log(addressIndex,"fbagvyhbfzbvzb",addre);
    

        console.log(amount,"amunt svbvvn;l")
        const order = new Order({
            user:userId,
           
            delivery_address:addre,
            payment:method,
            products:cartItem,
            subtotal:amount,
            orderStatus:status,
            orderDate:new Date()
            
        })
    
        await order.save()
        const couponData = await Coupon.findOneAndUpdate({ _id: couponId }, { $pull: { usedUser: userId} })
        const orderId = order._id;
        console.log("saved",orderId);
       
        console.log(method,"jkjk");
        if(method =="Cash on delivery"){
            for(const product of cartItem){
                const done=await Products.updateOne({_id:product.productId},{$inc:{ quantity:-product.quantity,popularity:1}})
                console.log(done,"divonjnbjznblnblnbmnnznbbnzbnzbnbznone")
            }
            console.log("cod");
            await Cart.deleteOne({user:userId})
            console.log("finished");
            res.json({success:true})
        }else if(method == 'Razor Pay'){
            console.log("online hogaya");
            let options = {
                amount:subtotal,
                currency:"INR",
                receipt:""+orderId
            }
            console.log("elet");
            const ordering = await razorpay.orders.create(options)
            .then((result)=>{
                console.log("frtfnd",result,"jaguinjbczj");
                const order = result
                console.log(order,"killed")
                res.json({success:false,order})
            }).catch(err=>{
                console.log(err)
            })
             
   

        }else{
            console.log("wallet")
            for(const product of cartItem){
                const done=await Products.updateOne({_id:product.productId},{$inc:{ quantity:-product.quantity,popularity:1}})
                console.log(done,"divonjnbjznblnblnbmnnznbbnzbnzbnbznone")
            }
              
              
     const data={
        amount:-amount,
        date:Date.now(),
       }
       await User.findOneAndUpdate({ _id: userId }, { $inc: { wallet:amount }, $push: { walletHistory: data } })
              console.log("wallet finished");
              res.json({success:true})
        }
    
    } catch (error) {
        console.log(error.message);
    }
}


const verifyPayment = async(req,res)=>{
    try {
        const userId = req.session.userId;
        const data=req.body
        const cart = await Cart.findOne({ user: userId }) .populate({ path: 'product.productId', model: 'Product', populate: { path: 'offer', model: 'offer' } });
        console.log(req.body)

        const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
      hmac.update(data.razorpay_order_id + "|" + data.razorpay_payment_id);
      const hmacValue = hmac.digest("hex");
     
      if (hmacValue == data.razorpay_signature) {
        for (const Data of cartData.product) {
          const { productId, quantity } = Data;
          await Products.updateOne({ _id: productId }, { $inc: { quantity: -quantity } });
        }
      }
      const newOrder = await Order.findByIdAndUpdate(
        { _id: data.order.receipt },
        { $set: { orderStatus: "placed" } }
      );
      newOrder.products.forEach((product) => {
        product.productStatus = "placed";
      });
      const orderItems = await Order.findByIdAndUpdate(
        { _id: newOrder._id },
        { $set: { products: newOrder.products } },
        { new: true }
      );
  
      
      await Cart.deleteOne({ user: userId });
     console.log('endedjfaifoankgkgaknkhmdmk')
  
  
      res.json({success:true})
  
  
    } catch (error) {
        console.log(error.message)
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

const detailedPageLoad = async(req,res)=>{      //adminSide
    try {
        const id = req.params.index
        const detials = await Order.findOne({_id:id}).populate('products.productId')
      
        // console.log(order);
        console.log("igyebuncjadnvuasvnoa   suhair",detials);
        res.render('detailedOrderView',{detials})
    } catch (error) {
        console.log(error.message);
    }
}

const viewFullOrder = async(req,res)=>{    //userSide
    try {
        const id = req.params.id
        console.log("hihlwownwdwe");
        const detials = await Order.findOne({_id:id}).populate('products.productId','name images')
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
const cancelOrder=async(req,res)=>{
    try {
        console.log("reached ");
        const productId = req.body.productId
        const reason = req.body.returnReason
        const userId = req.session.userId
        const orderId = req.body.orderId
        const payment = await Order.findOne({_id:orderId})

        console.log(orderId,'order')
       const orderDetails = await Order.findOne({user:userId,'products._id':productId}).populate('products.productId')
       console.log(orderDetails)
    if(payment.payment =='wallet'||'Razor Pay'){
        const Walletamount=(orderDetails.products[0].productId.price)*orderDetails.products[0].quantity
        console.log(Walletamount,"wallet amount")

     const data={
      amount:Walletamount,
      date:Date.now(),
     }
     await Products.updateOne({ _id: productId }, { $inc: { quantity: 1 } });
     await User.findOneAndUpdate({ _id: userId }, { $inc: { wallet: Walletamount }, $push: { walletHistory: data } })
    }


      
        const order= await Order.findOneAndUpdate({user:userId,'products._id':productId},{$set:{'products.$.productStatus':"cancelled",'products.$.cancelReason':reason}}, { new: true } )
        console.log("finish",order)

        res.json({cancel:true})      
    
    } catch (error) {
        console.log(error.message);
    }
}

const returnOrder = async(req,res)=>{
    try {
        const productId = req.body.productId
        const reason = req.body.returnReason
        const userId = req.session.userId
        const order = await Order.findOneAndUpdate({user:userId,'products._id':productId},{$set:{'products.$.productStatus':"returned",'products.$.returnReason':reason}})
        console.log("finish",order)
        res.json({return:true})
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadOrders,
    placeOrder,
    verifyPayment,
    loadSuccess,
    loadOrderDetails,
    detailedPageLoad,
    viewFullOrder,
    updateStatus,
    cancelOrder,
    returnOrder,
    applyCoupon,
    removeCoupon
}