
const User = require('../models/userModel');
const Category = require('../models/categoriesModel');
const Products = require('../models/productModel')
const Cart = require('../models/cartModel')
const Order = require('../models/orderModel')
const { find, findOne } = require('../models/userVerification');
const { session } = require('passport');
const pdf = require('pdfkit');
const fs = require('fs');
const Razorpay = require('razorpay')
const Address = require('../models/addressModel');
const Wishlist = require('../models/whishlistModal')
const Coupon = require('../models/couponModel')
const crypto = require('crypto');


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})


const loadOrders = async (req, res) => {
    try {
        console.log("orferef")
        const page = parseInt(req.query.page) || 1; 
        const limit = 10; // Display 12 products per page
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const order = await Order.find().sort({ orderDate: -1 })    
        const totalOrder = await Order.countDocuments();
        const totalPages = Math.ceil(totalOrder / limit);
        console.log(totalPages,page)
        res.render('orderPage', { order,totalPages,currentPage: page })
    } catch (error) {
        console.log(error.message);

    }
}

const applyCoupon = async (req, res) => {
    try {
        console.log(req.body, "jjjjjjj")

        const couponId = req.body.couponId;
        const userId = req.session.userId;
        const currentDate = new Date();
        const couponData = await Coupon.findOne({ _id: couponId, expiryDate: { $gte: currentDate }, is_blocked: false });
        const exists = couponData.usedUser.includes(userId);

        if (!exists) {
            const existingCart = await Cart.findOne({ user: userId });
            if (existingCart && existingCart.couponDiscount == null) {
                console.log("pplting prfecetly")
                await Coupon.findOneAndUpdate({ _id: couponId }, { $push: { usedUser: userId } });

                await Cart.findOneAndUpdate({ user: userId }, { $set: { couponDiscount: couponData._id } });
                res.json({ success: true });
            } else {
                console.log("it worked")
                res.json({ success: false });
            }
        } else {
            console.log("it ")

            res.json({ success: false });
        }
    } catch (error) {
        console.log(error.message)
    }
}

const removeCoupon = async (req, res) => {
    try {
        console.log(req.body)
        const couponId = req.body.couponId
        const userId = req.session.userId


        const couponData = await Coupon.findOneAndUpdate({ _id: couponId }, { $pull: { usedUser: userId } })
        const updateCart = await Cart.findOneAndUpdate({ user: userId }, { $set: { couponDiscount: null } })
        console.log(couponData, updateCart)
        res.json({ success: true })




    } catch (error) {
        console.log(error.message)
    }
}

const placeOrder = async (req, res) => {
    try {
        console.log(req.body, 'oijhoijbojboknvsdlkmzvksmvs;dV');
        const userId = req.session.userId
        const method = req.body.methode

        console.log(method, "firsy")
        const productTotal = await Cart.findOne({ user: userId }).populate({ path: 'product.productId', model: 'Product', populate: { path: 'offer', model: 'offer' } }).populate('couponDiscount');
        console.log("hdfkanvo")
        const couponId = productTotal.couponDiscount
        const user = await User.findOne({ _id: userId })
        const couponDiscount = productTotal.couponDiscount ? productTotal.couponDiscount.discountAmount : 0;
        let status = method == "Cash on Delivery" || method == "wallet" ? "placed" : "pending"

        const product = productTotal.product
        
        const subtotal = productTotal.product.reduce((acc, val) => {
            const discount = val.productId.offer ? val.productId.offer.discountAmount : 0;
            return acc + (val.productId.price - discount) * val.quantity;
        }, 0);
        
        let amount = 0
        console.log(couponDiscount, "giurdhgfjgfv")
        if (couponDiscount) {
            amount = subtotal - (subtotal / couponDiscount)
        } else {
            amount = subtotal
        }
        let couponPercentage
        console.log(subtotal,"g");
        if(couponDiscount !== 0){
            couponPercentage =couponDiscount
        }else{
            couponPercentage=1
        }
        const cartItem = productTotal.product
        const addressIndex = req.body.Address
        const address = await Address.findOne({ user: userId })
        console.log("here", "ended here rewif", address);
        const addre = address.address[addressIndex]


        console.log(addressIndex, "fbagvyhbfzbvzb", addre);


        console.log(amount, "amunt svbvvn;l")
        const order = new Order({
            user: userId,

            delivery_address: addre,
            payment: method,
            products: cartItem,
            subtotal: amount,
            orderStatus: status,
            coupon:couponPercentage,
            orderDate: new Date()

        })

        await order.save()
        const orderId = order._id;
     
        console.log("saved", orderId);

        console.log(method, "jkjk");
        if (method == "Cash on Delivery") {
            for (const product of cartItem) {
                const done = await Products.updateOne({ _id: product.productId }, { $inc: { quantity: -product.quantity, popularity: 1 } })
                console.log(done, "divonjnbjznblnblnbmnnznbbnzbnzbnbznone")
        await Cart.deleteOne({ user: userId })

            }
            console.log("cod");

            res.json({ success: true })
        } else if (method == 'Razor Pay') {
            console.log("online hogaya");
            for (const product of cartItem) {
                const done = await Products.updateOne({ _id: product.productId }, { $inc: { quantity: -product.quantity, popularity: 1 } })
                console.log(done, "divonjnbjznblnblnbmnnznbbnzbnzbnbznone")
            }
            let options = {
                amount: amount*100,
                currency: "INR",
                receipt: "" + orderId
            }
            console.log("elet");
            const ordering = await razorpay.orders.create(options)
                .then((result) => {
                    const order = result
                    console.log(order)
                    res.json({ success: false, order })
                }).catch(err => {
                    console.log(err)
                })



        } else {
            console.log("wallet")
        await Cart.deleteOne({ user: userId })

            for (const product of cartItem) {
                const done = await Products.updateOne({ _id: product.productId }, { $inc: { quantity: -product.quantity, popularity: 1 } })
                console.log(done, "divonjnbjznblnblnbmnnznbbnzbnzbnbznone")
            }


            const data = {
                amount: -amount,
                date: Date.now(),
            }
            await User.findOneAndUpdate({ _id: userId }, { $inc: { wallet: amount }, $push: { walletHistory: data } })
            console.log("wallet finished");
            console.log(req.body)
            res.json({ success: true })
        }

    } catch (error) {
        console.log(error.message);
    }
}


const verifyPayment = async (req, res) => {
    try {
        const userId = req.session.userId;
        const data = req.body
        const cart = await Cart.findOne({ user: userId }).populate({ path: 'product.productId', model: 'Product', populate: { path: 'offer', model: 'offer' } });
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


        res.json({ success: true })


    } catch (error) {
        console.log(error.message)
    }
}

const loadSuccess = async (req, res) => {
    try {
        res.render('success')
    } catch (error) {
        console.log(error.message);
    }
}

const loadOrderDetails = async (req, res) => {
    try {
        console.log(req.params);
        const userId = req.session.userId
        const orderNum = req.params.id
        const allOrder = await Order.findOne({ user: userId })
        console.log("gretdsbfefdg", allOrder);
        const order = allOrder.order[orderNum]

        const addressId = order.delivery_address
        const address = await Address.findOne({ _id: addressId })
        console.log(order, "ggs", address);
        const product = await Products.findOne({ _id: 'order' })
        res.render('orderDetails', {})
    } catch (error) {
        console.log(error.message);
    }
}

const detailedPageLoad = async (req, res) => {      //adminSide
    try {
        const id = req.params.index
        const detials = await Order.findOne({ _id: id }).populate('products.productId')

        // console.log(order);
        console.log("igyebuncjadnvuasvnoa   suhair", detials);
        res.render('detailedOrderView', { detials })
    } catch (error) {
        console.log(error.message);
    }
}

const viewFullOrder = async (req, res) => {    //userSide
    try {
        const id = req.params.id
        console.log("hihlwownwdwe");
        const detials = await Order.findOne({ _id: id }).populate('products.productId')
        console.log(detials, "this is detials")
        const product = detials.products
        const userId = req.session.userId
        const user = await User.findOne({ _id: userId })
        console.log(detials, user);
        res.render('detailedOrder', { detials, user })
    } catch (error) {
        console.log(error.message)
    }
}
const updateStatus = async (req, res) => {
    try {
        console.log('status')
        const productId = req.body.productId
        const status = req.body.status
        console.log(productId, status);
        const updateorder = await Order.findOneAndUpdate({ 'products._id': productId }, { $set: { 'products.$.productStatus': status } }, { new: true })
        return res.json({ success: true })
        console.log("done")
    } catch (error) {
        console.log(error.message);
    }
}
const cancelOrder = async (req, res) => {
    try {
        const productId = req.body.productId
        const reason = req.body.returnReason
        const userId = req.session.userId
        const orderId = req.body.orderId
        const payment = await Order.findOne({ _id: orderId })
       
        // console.log(orderId, 'order')
        const orderDetails = await Order.findOne({ user: userId, 'products._id': productId }).populate('products.productId')
        const quantity = orderDetails.products[0].quantity
        const done = await Products.updateOne({ _id: orderDetails.products[0].productId }, { $inc: { quantity:quantity, popularity: -1 } })

        // console.log(orderDetails,"order detialnva",quantity)
        if (payment.payment == 'wallet' || 'Razor Pay') {
            const Walletamount = (orderDetails.products[0].productId.price) * orderDetails.products[0].quantity
            // console.log(Walletamount, "wallet amount")

            const data = {
                amount: Walletamount,
                date: Date.now(),
            }
            await Products.updateOne({ _id: productId }, { $inc: { quantity: 1 } });
            await User.findOneAndUpdate({ _id: userId }, { $inc: { wallet: Walletamount }, $push: { walletHistory: data } })
        }



        const order = await Order.findOneAndUpdate({ user: userId, 'products._id': productId }, { $set: { 'products.$.productStatus': "cancelled", 'products.$.cancelReason': reason } }, { new: true })
        // console.log("finish", order)

        res.json({ cancel: true })

    } catch (error) {
        console.log(error.message);
    }
}

const returnOrder = async (req, res) => {
    try {
        const productId = req.body.productId
        const reason = req.body.returnReason
        const userId = req.session.userId
        const order = await Order.findOneAndUpdate({ user: userId, 'products._id': productId }, { $set: { 'products.$.productStatus': "returned", 'products.$.returnReason': reason } })
        console.log("finish", order)
        res.json({ return: true })
    } catch (error) {
        console.log(error.message)
    }
}

const retryOrder = async(req,res)=>{
    try{
        const subtotal=req.body.subtotal
        const orderId=req.body.orderId
        console.log(req.body)
        let options = {
            amount: (subtotal*100).toFixed(0),
            currency: "INR",
            receipt: "" + orderId
        }
        const ordering = await razorpay.orders.create(options)
        .then((result) => {
            console.log("frtfnd", result, "jaguinjbczj");
            const order = result
            console.log(order, "killed")
            res.json({ success: false, order })
        }).catch(err => {
            console.log(err)
        })


    }catch(error){
        console.log(error.message)
    }
}



const downloadPdf = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id }).populate({ path: 'products.productId'})
        if (!order) {
            return res.status(404).send({ message: 'Order not found' }).populate('products.productId')
        }

        if (!order.products || !Array.isArray(order.products) || order.products.length === 0) {
            return res.status(400).send({ message: 'Order items not found' });
        }

        const doc = new pdf({
            margin: 50,
            layout: 'landscape',
            size: 'A4'
        });

        doc.info['Title'] = `Invoice_${order._id}`;
        doc.info['Author'] = 'ZELLA  FASHIONS';

        doc.fontSize(25).text('ZELLA FASHIONS', { align: 'center' });
        doc.fontSize(10).text('Invoice', { align: 'center' });


        doc.moveDown();
        doc.fontSize(12).text(`Order ID: ${order._id}`);
        doc.moveDown();
        doc.fontSize(12).text(`Date: ${order.orderDate.toLocaleDateString('en-US',
        
        { weekday: 'short' , year: 'numeric'
        , month: 'short' , day: 'numeric' })}`);
        doc.moveDown();
        doc.fontSize(12).text(`Time: ${order.orderDate.toLocaleDateString('en-US',
        
        {  hour: '2-digit',
        minute: '2-digit' })}`);
        doc.moveDown();


        doc.fontSize(12).text('Shipping Address:');
        doc.moveDown();
        doc.fontSize(10).text(`Name: ${order.delivery_address.name}`);
        doc.fontSize(10).text(`Street: ${order.delivery_address.street}`);
        doc.fontSize(10).text(`City: ${order.delivery_address.city}`);
        doc.fontSize(10).text(`Postal Code: ${order.delivery_address.district}`);

        doc.fontSize(10).text(`State: ${order.delivery_address.state}`);
        doc.fontSize(10).text(`Pincode: ${order.delivery_address.pincode}`);
        doc.fontSize(10).text(`Phone: ${order.delivery_address.phone}`);
        doc.fontSize(10).text(`Email: ${order.delivery_address.email}`);

doc.moveDown();doc.moveDown();
        // Create table for order items
        const tableHeader = 'Product              Quantity      Price    Discount    Total';
        doc.moveDown();

        const tableRows = order.products.map(item => {
            const productName = (item.productId && item.productId.name ? item.productId.name : 'N/A').padEnd(20);
            const quantity = (item.quantity ? item.quantity.toString() : 'N/A').padEnd(12);
            const price = `₹ ${(item.productId && item.productId.price ? item.productId.price.toString() : '0.00')}`.padEnd(10);
            
            let totalValue = 0;
            if (item.quantity && item.productId && item.productId.price) {
                totalValue = item.quantity * item.productId.price;
            }
            
            const total = `₹ ${totalValue.toFixed(2).toString()}`;
            let discount
            if(order.coupon !==0){
                discount =item.productId.price/order.coupon
            }else{
                discount = 0
            }
            const discountAmount =`${discount.toFixed(2).toString()}`
            return `${productName}  ${quantity}${price}${discountAmount}    ${total}`;
        }).join('\n \n');

        doc.font('Courier').text(tableHeader + '\n \n' + tableRows, {
            align: 'left'
        });

        // Add subtotal, tax, and total
        const totals = `Subtotal: ₹ ${(order.subtotal ? order.subtotal.toFixed(2) : '0.00')}\n Total: ₹ ${(order.subtotal ? order.subtotal.toFixed(2) : '0.00')}`;
        
        doc.moveDown(); // Add space between table and totals
        doc.font('Courier').text(totals, {
            align: 'right'
        });

        // Add footer
        doc.moveDown(); // Add space between totals and footer
        doc.fontSize(10).text('Thank you for your purchase!', { align: 'center' });

        const pdfBuffer = await new Promise((resolve) => {
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            doc.end();
        });

        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice_${order._id}.pdf`);

        res.send(pdfBuffer);

    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: 'Error generating PDF' });
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
    removeCoupon,
    retryOrder,
    downloadPdf
}
