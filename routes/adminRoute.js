const express = require('express');
const admin_route = express();
const multer = require('../middleware/multer');
const session = require('express-session');
const config = require('../config/config');


admin_route.use(session({
    secret: config.sessionSecret,
    resave:false,
    saveUninitialized:true
}))

const bodyParser = require('body-parser');
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({extended:true}));


admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin');

const path = require('path');

const auth = require('../middleware/adminAuth')
const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController')
const OrderController=require('../controllers/OrderController')
const couponController = require('../controllers/couponController')
const offerController = require('../controllers/offerController')
admin_route.get('/',auth.isLogout,adminController.loadLogin)

admin_route.post('/',adminController.verifyLoginAdmin)
admin_route.get('/logout',auth.isLogout,adminController.logout)


admin_route.get('/home',auth.isLogin,adminController.loadDashboard)
admin_route.get('/users_list',auth.isLogin,adminController.LoadUsers)
admin_route.patch('/blockusers/:id',auth.isLogin,adminController.blockUser)

//categories
admin_route.get('/categories',auth.isLogin,adminController.loadCategories)
admin_route.get('/addCategories',auth.isLogin,adminController.loadAddCategories)
admin_route.post('/submitCategory',auth.isLogin,adminController.addCategory)
admin_route.patch('/blockcategories/:id',auth.isLogin,adminController.blockCategories)
admin_route.get('/edit-categories',auth.isLogin,adminController.LoadUpdateCategories)
admin_route.post('/subCat',auth.isLogin,adminController.updateCategories)
admin_route.patch('/removeCategory',auth.isLogin,adminController.deleteCategories)
admin_route.patch('/applyCategoryOffer',offerController.categiresOffer)
admin_route.patch('/removeCategoryOffer',offerController.categiresOfferRemove)


//products
admin_route.get('/products',auth.isLogin,adminController.loadProducts)
admin_route.get('/add-products',productController.addProductsLoad)
admin_route.post('/submit-product',multer.uploadproduct,productController.addingProduct)
admin_route.get('/editproduct',productController.loadEditProduct)
admin_route.post('/submiteditproduct',productController.subEditProduct)
admin_route.patch('/removeProduct',productController.removeProduct)
admin_route.patch('/blockproduct/:id',productController.blockProduct)

//Orders
admin_route.get('/orders',OrderController.loadOrders)
admin_route.get('/adminOrderDetails/:index',OrderController.detailedPageLoad)
admin_route.post('/updatestatus',OrderController.updateStatus)

//Coupon
admin_route.get('/coupons',couponController.loadCoupon)
admin_route.get('/loadAddCoupon',couponController.loadCreateCoupon)
admin_route.post('/submitCoupon',couponController.submitCoupon)
admin_route.get('/removeCoupon/:id',couponController.removeCoupon)
admin_route.get('/editCoupon/:id',couponController.editCoupon)
admin_route.post('/submitCouponEdit',couponController.submitCouponEdit)

//Offer
admin_route.get('/offer',offerController.loadOffer)
admin_route.get('/createOffer',offerController.createOffer)
admin_route.post('/submitOffer',offerController.submitOffer)
admin_route.get('/removeOffer/:id',offerController.deleteOffer)
admin_route.patch('/applyOffer',offerController.applyOffer)
admin_route.patch('/removeOffer',offerController.removeOffer)


admin_route.get('/try',adminController.users)


   module.exports=admin_route