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

const adminAuth = require('../middleware/adminAuth')
const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController')
const OrderController=require('../controllers/OrderController')
const couponController = require('../controllers/couponController')
const offerController = require('../controllers/offerController')
const salesController = require('../controllers/salesController')
admin_route.get('/',adminAuth.isLogout,adminController.loadLogin)

admin_route.post('/',adminController.verifyLoginAdmin)
admin_route.get('/logout',adminAuth.isLogout,adminController.logout)


admin_route.get('/home',adminAuth.isLogin,adminController.loadDashboard)
admin_route.get('/users_list',adminAuth.isLogin,adminController.LoadUsers)
admin_route.patch('/blockusers/:id',adminAuth.isLogin,adminController.blockUser)

//categories
admin_route.get('/categories',adminAuth.isLogin,adminController.loadCategories)
admin_route.get('/addCategories',adminAuth.isLogin,adminController.loadAddCategories)
admin_route.post('/submitCategory',adminAuth.isLogin,adminController.addCategory)
admin_route.patch('/blockcategories/:id',adminAuth.isLogin,adminController.blockCategories)
admin_route.get('/edit-categories',adminAuth.isLogin,adminController.LoadUpdateCategories)
admin_route.post('/subCat',adminAuth.isLogin,adminController.updateCategories)
admin_route.patch('/removeCategory',adminAuth.isLogin,adminController.deleteCategories)
admin_route.patch('/applyCategoryOffer',adminAuth.isLogin,offerController.categiresOffer)
admin_route.patch('/removeCategoryOffer',adminAuth.isLogin,offerController.categiresOfferRemove)



//products
admin_route.get('/products',adminAuth.isLogin,adminAuth.isLogin,adminController.loadProducts)
admin_route.get('/add-products',adminAuth.isLogin,productController.addProductsLoad)
admin_route.post('/submit-product',adminAuth.isLogin,multer.uploadproduct,productController.addingProduct)
admin_route.get('/editproduct',adminAuth.isLogin,productController.loadEditProduct)
admin_route.post('/submiteditproduct',adminAuth.isLogin,productController.subEditProduct)
admin_route.patch('/removeProduct',adminAuth.isLogin,productController.removeProduct)
admin_route.patch('/blockproduct/:id',adminAuth.isLogin,productController.blockProduct)

//Orders
admin_route.get('/orders',adminAuth.isLogin,OrderController.loadOrders)
admin_route.get('/adminOrderDetails/:index',adminAuth.isLogin,OrderController.detailedPageLoad)
admin_route.post('/updatestatus',adminAuth.isLogin,OrderController.updateStatus)

//Coupon
admin_route.get('/coupons',adminAuth.isLogin,couponController.loadCoupon)
admin_route.get('/loadAddCoupon',adminAuth.isLogin,couponController.loadCreateCoupon)
admin_route.post('/submitCoupon',adminAuth.isLogin,couponController.submitCoupon)
admin_route.get('/removeCoupon/:id',adminAuth.isLogin,couponController.removeCoupon)
admin_route.get('/editCoupon/:id',adminAuth.isLogin,couponController.editCoupon)
admin_route.post('/submitCouponEdit',adminAuth.isLogin,couponController.submitCouponEdit)

//Offer
admin_route.get('/offer',adminAuth.isLogin,offerController.loadOffer)
admin_route.get('/createOffer',adminAuth.isLogin,offerController.createOffer)
admin_route.post('/submitOffer',adminAuth.isLogin,offerController.submitOffer)
admin_route.get('/removeOffer/:id',adminAuth.isLogin,offerController.deleteOffer)
admin_route.patch('/applyOffer',adminAuth.isLogin,offerController.applyOffer)
admin_route.patch('/removeOffer',adminAuth.isLogin,offerController.removeOffer)

// sales
admin_route.get('/sales',adminAuth.isLogin,salesController.loadSales)
admin_route.get('/filterSales',adminAuth.isLogin,salesController.filterSales)




admin_route.post('/try',adminAuth.isLogin,adminController.users)


   module.exports=admin_route
