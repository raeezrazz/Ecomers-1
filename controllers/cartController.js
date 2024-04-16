
const User = require('../models/userModel');
const Category = require('../models/categoriesModel');
const Products = require('../models/productModel')
const Cart = require('../models/cartModel')
const Addres = require('../models/addressModel')
const { find, findOne } = require('../models/userVerification');
const { session } = require('passport');
const Wishlist = require('../models/whishlistModal')
const Coupon = require('../models/couponModel')


const loadCart = async (req, res) => {
    try {
        const userId = req.session.userId
        console.log("kjhgfdsazxcvbnmk")
        console.log(userId, req.session.userId);
        if (userId) {
            const userCart= await Cart.findOne({ user: userId }) .populate({ path: 'product.productId', model: 'Product', populate: { path: 'offer', model: 'offer' } });
            if (userCart) {
                console.log(userCart, "hello");

                const subtotal = userCart.product.reduce((acc, val) => {
                    const discount = val.productId.offer&&val.productId.offer.expiryDate > new Date() ? val.productId.offer.discountAmount : 0;
                    return acc + (val.productId.price - discount) * val.quantity;
                }, 0);
            //    const subtotal=3
                console.log(subtotal,"kkkoi");

                res.render('cart', { userCart, subtotal })

            } else {
                res.render('cart',{userCart:null})
            }

        } else {
            res.redirect('logining')
        }
    } catch (error) {
        console.log(error.message);
    }
}
const addCart = async (req, res) => {
    try {
        console.log("reached")

        const id = req.body.id
        const userId = req.session.userId
        const wish = req.body.wish
        if (wish ==true) {
                 console.log("wish true")
            const product = await Products.findOne({ _id: id })
            const productId = product._id
            const userExist = await Cart.findOne({ user: userId })
            console.log(product, "jhjvghcfgcgvh,");
            // const subtotal=product.price *quantity
            console.log('quantity');
            if (userExist) {

                const exist = await Cart.findOne({ user: userId, 'product.productId': productId })
                if (exist) {
                    console.log("producte exist");

                    res.json({ exist: true })
                } else {
                    console.log(" exist user");
                    await Cart.findOneAndUpdate({ user: userId }, {
                        $push: {
                            product: [{
                                productId: product._id,
                              
                                quantity: 1,
                               
                                images: product.images
                            }]
                        }
                    }, { upsert: true, new: true })
                    const wishRemove =await Wishlist.findOneAndUpdate({user:userId},
                        { $pull: { products: { productId: id} } }, 
                        { new: true })
                   console.log(wishRemove,"final")
                    res.json({ success: true })
                }
            } else {
                console.log("new user");
                const newCartProduct = new Cart({
                    user: req.session.userId,
                    product: [{
                        productId: product._id,
                        name: product.name,
                        quantity: 1,
                        price: product.price,
                        totalPrice: product.price,
                        images: product.images
                    }]

                })
                await newCartProduct.save()
                    .then((result) => {
                        res.json({success:true})
                    })

            }


        } else {
            console.log("wish false")

            const product = await Products.findOne({ _id: id })
            const productId = product._id
            const userExist = await Cart.findOne({ user: userId })
            console.log(product, "jhjvghcfgcgvh,");
            // const subtotal=product.price *quantity
            console.log('quantity');
            if (userExist) {

                const exist = await Cart.findOne({ user: userId, 'product.productId': productId })
                if (exist) {
                    console.log("producte exist");

                    res.json({ exist: true })
                } else {
                    console.log(" exist user");
                    await Cart.findOneAndUpdate({ user: userId }, {
                        $push: {
                            product: [{
                                productId: product._id,
                                name: product.name,
                                quantity: 1,
                                price: product.price,
                                totalPrice: product.price,
                                images: product.images
                            }]
                        }
                    }, { upsert: true, new: true })
                    res.json({ success: true })
                }
            } else {
                console.log("new user");
                const newCartProduct = new Cart({
                    user: req.session.userId,
                    product: [{
                        productId: product._id,
                        name: product.name,
                        quantity: 1,
                        price: product.price,
                        totalPrice: product.price,
                        images: product.images
                    }]

                })
                await newCartProduct.save()
                    .then((result) => {
                        res.redirect('/loadCart')
                    })

            }

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

const removeCart = async (req, res) => {
    try {
        const productId = req.body.id;
        const userId = req.session.userId
        const result = await Cart.findOneAndUpdate({ user: userId }, { $pull: { product: { productId: productId } } })

        console.log(result, "hi");

        res.json({remove:true})


    } catch (error) {
        console.log(error.message);
    }
}


const loadCheckout = async (req, res) => {
    try {
        const userId = req.session.userId
        const address = await Addres.findOne({ user: userId });
        const product =await Cart.findOne({ user: userId }) .populate({ path: 'product.productId', model: 'Product', populate: { path: 'offer', model: 'offer' } }).populate('couponDiscount'); ;
        const couponDiscount = product.couponDiscount ? product.couponDiscount.discountAmount : 0;
        const wallet = await User.findOne({_id:userId}).select('wallet')
        const subtotal = product.product.reduce((acc, val) => {
            const discount = val.productId.offer &&val.productId.offer.expiryDate > new Date() ? val.productId.offer.discountAmount : 0;
            return acc + (val.productId.price - discount) * val.quantity;
        }, 0);   

        
        const  currentDate=new Date()
       
        const coupon = await Coupon.find({
            expiryDate: { $gte: currentDate },
            criteriaAmount: { $lte: subtotal },
            is_blocked: false,
            usedUser: { $nin: [userId] }
        });
        
        console.log(coupon,"hdajdkvnlkjnvnjkas")
        if (address) {
         
            const data = address.address
            console.log(coupon,"fuewosdfjo")
            res.render('checkout', { data, address,product, subtotal,coupon,couponDiscount,wallet})
        } else {
            const data = null
            res.render('checkout', { data, address, product, subtotal ,coupon,couponDiscount,wallet})
        }

    } catch (error) {
        console.log(error.message);
    }
}
const updateQuantity = async (req, res) => {
    try {
        console.log(req.body,"hytnvuvsjnvjsnjvsnjnwubwt")
        const userId = req.session.userId
        const productId = req.body.productId
        const count = req.body.count
        const cart = await Cart.findOne({ user: userId })
        const product = await Products.findOne({ _id: productId })
        console.log(cart, "this is cart");
        
        if (count == -1) {
            const productQuantity = cart.product.find((p) => p.productId == productId).quantity
            console.log(productQuantity, "final")
            if (productQuantity <= 1) {
                return res.json({ success: false, message: 'Quantity cannot be decreased further. ' })
            }
        }
        if (count == 1) {
            const productQuantity = cart.product.find((p) => p.productId == productId).quantity
            if (productQuantity + count > product.quantity) {
                return res.json({ success: false, message: 'Stock limit reached' })
            }
        }
        const updateCart = await Cart.findOneAndUpdate(
            { user: userId, 'product.productId': productId },
            {
                $inc: {
                    'product.$.quantity': count,
                    'product.$.totalPrice': count * cart.product.find(p => p.productId.equals(productId)).price,
                },
            },
            { new: true }
        );
        console.log("reached at the end");
        const Allquantity = await Cart.findOne({user:userId,'product.productId':productId}).populate({ path: 'product.productId', model: 'Product', populate: { path: 'offer', model: 'offer' } });
        const allCart = await Cart.findOne({user:userId}).populate({ path: 'product.productId', model: 'Product', populate: { path: 'offer', model: 'offer' } });
        const quantity=Allquantity.product[0].quantity
        const stock =product.quantity
        const discount = Allquantity.product[0].productId.offer&&Allquantity.product[0].productId.offer.expiryDate > new Date() ? Allquantity.product[0].productId.offer.discountAmount : 0;

        const price = Allquantity.product[0].productId.price
        const total = (price-discount)*quantity

        const subtotal = allCart.product.reduce((acc, val) => {
            const discount = val.productId.offer &&val.productId.offer.expiryDate > new Date() ? val.productId.offer.discountAmount : 0;
            return acc + (val.productId.price - discount) * val.quantity;
        }, 0);
     
        console.log(quantity,stock,subtotal,price,total)
        res.json({ success: true,quantity:quantity,remainingStock:stock,subtotal:subtotal,total:total })

    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadCart,
    loadCheckout,
    addCart,
    removeCart,
    updateQuantity
}