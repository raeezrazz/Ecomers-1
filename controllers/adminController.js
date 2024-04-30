const session = require('express-session');
const User = require('../models/userModel');
const bcrypt = require('bcrypt')
const Category = require('../models/categoriesModel');
const Products = require('../models/productModel')
const Wishlist =require('../models/whishlistModal')
const { find, findOne } = require('../models/userVerification');
const Coupon =require('../models/couponModel')
const Offer = require('../models/offerModel')
const Order = require('../models/orderModel')




const securePassword = async(password)=>{
    try{
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
    }catch(error){
        console.log(error.message);
    }
}

const loadLogin =async(req,res)=>{

    try {
        res.render('login')
    } catch (error) {
        
    }

}
const verifyLoginAdmin = async (req, res) => {

    try {
       

        const email = req.body.email;
        const password = req.body.password;
        console.log('adminbhai')
        const userData = await User.findOne({ email: email })
        console.log(userData);
        if (userData) {

            const passwordMatch = await bcrypt.compare(password, userData.password)

            if (passwordMatch) {

                if (userData.is_admin === 0) {
                    res.render('Login', { message: "Email and password is incorrect   1" });

                } else {
                    req.session.user_id = userData._id;
                    res.redirect("/admin/home");
                }

            } else {
                res.render('Login', { message: "Email and password is incorrect  2" });

            }



        } else {
            res.render('Login', { message: "Email and password is incorrect  3" });
        }
    } catch (error) {
        console.log(error.message);

    }

}


const loadDashboard = async (req, res) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id })
        const products= await Products.find()
        const categoreis = await Category.find()
        const orders = await Order.find()
        const razorPayCount = await Order.countDocuments({payment:"Razor Pay","products.productStatus": "delivered"});
        const codCount = await Order.countDocuments({payment: "Cash on Delivery","products.productStatus": "delivered"});
        const walletCount = await Order.countDocuments({payment: "wallet","products.productStatus": "delivered"});
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();



        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        sales = await Order.find({'products.productStatus':'delivered',
            orderDate: {
                $gte: startOfMonth,
                $lte: endOfMonth
            }
        }).populate('products.productId');;
        const monthlyIncome = sales.reduce((acc, curr) => {
            return acc + curr.subtotal
        }, 0);


        
       

        console.log(monthlyIncome,"nfibsvjsajvn")

        
        const filter = req.query.filter
        let labels
        let graphData
        const revenue = await Order.aggregate([
            {$match:{'products.productStatus':"delivered"}},
            {
                $group:{
                    _id:null,revenue:{$sum:"$subtotal"}
                }
            }
        ]);

        console.log(revenue,"nuaoj")


        const sellingProduct = await Order.aggregate([
            {$match:{'products.productStatus':'delivered'}},
            {$unwind:'$products'},
            {
                $lookup:{
                    from:"products",
                    localField:"products.productId",
                    foreignField:"_id",
                    as:"joinedProduct"
                }
            },{$unwind:"$joinedProduct"},
            {$group:{
                _id:"$joinedProduct._id",
                productName:{$first:"$joinedProduct.name"},
                totalSold:{$sum:"$products.quantity"},
            }},
            {$sort:{totalSold:-1}},
            {$limit:3}
        ])
const topProductLabel = sellingProduct.map(product =>product.productName)
const topProductCount = sellingProduct.map(product=>product.totalsold)


        const sellingCategory = await Order.aggregate([
            {$match:{'products.productStatus':'delivered'}},
            {$unwind:'$products'},
            {
                $lookup:{
                    from:"products",
                    localField:"products.productId",
                    foreignField:"_id",
                    as:"joinedProduct"
                }
            },{$unwind:"$joinedProduct"},
            {
                $lookup: { 
                  from: "categories",
                  localField: "joinedProduct.categoryId", 
                  foreignField: "_id",
                  as: "joinedCategory"
                }
              },
            {$group:{
                _id:"$joinedCategory._id",
                categoryName:{$first:"$joinedCategory.name"},
                totalSold:{$sum:"$products.quantity"},
            }},
            {$sort:{totalSold:-1}},
            {$limit:3}
        ])
        const topCategoryLabel = sellingCategory.map(product =>product.categoryName)
        const topCategoryCount = sellingCategory.map(product =>product.totalSold)



            // FILTERS
            if(filter ==='yearly'){
                const currentYear = new Date().getFullYear();

                const years = [currentYear-4,currentYear - 3,currentYear -2 ,currentYear-1,currentYear ]
                labels = years

                const yearlyRevenues = [];

                for(const year of years){
                    const startOfYear = new Date(year,0,1);
                    const endOfYear = new Date(year +1,0,1);
                    endOfYear.setMilliseconds(endOfYear.getMilliseconds()-1);

                    const yearlyRevenue = await Order.aggregate([
                        {
                            $match:{
                                'products.productStatus':'delivered',
                                orderDate:{
                                    $gte:startOfYear,
                                    $lt:endOfYear
                                }
                            }
                        },
                        {
                            $group:{
                                _id:{$year:'$orderDate'},
                                yearlyRevenue:{$sum:'$subtotal'}
                            }
                        }
                    ]);

                    yearlyRevenues.push({year,yearlyRevenue});
                }
                graphData = Array(5).fill(0);

                yearlyRevenues.forEach((yearData,index)=>{
                    graphData[index]=yearData.yearlyRevenue.length >0? yearData.yearlyRevenue[0].yearlyRevenue : 0 ;
                })
                console.log("fsd",yearlyRevenues,"fds",graphData)

            }else{
                console.log("else")
                labels =  [1, 2, 3, 4, 5,6, 7, 8,9, 10, 11, 12];

                const currentMonth= new Date();
                const startMonth = new Date(currentMonth.getFullYear(),0,1);
                const endOfMonth = new Date(currentMonth.getFullYear()+1,0,1)
                endOfMonth.setMilliseconds(endOfMonth.getMilliseconds()-1)  

                const monthlyRevenue = await Order.aggregate([
                    {
                        $match:{
                            'products.productStatus':'delivered',
                            orderDate:{
                                $gte:startMonth,
                                $lt:endOfMonth
                            }
                        }
                    },
                    {
                        $group:{
                            _id:{$month:'$orderDate'},
                            monthlyRevenue:{$sum:'$subtotal'}
                        }
                    }

                ]);

                graphData = Array(12).fill(0)

                monthlyRevenue.forEach(data =>{
                    const month = data._id -1;
                    graphData[month]= data.monthlyRevenue;
                })
                console.log(monthlyRevenue,"month" ,graphData,"revenue")
                console.log(sellingCategory,"sellingctgryyyy");
                console.log(sellingProduct,"prdcttlnggg")

            } 



        
        res.render('home', { admin: userData,labels,graphData ,revenue,products,categoreis,orders ,razorPayCount,codCount,walletCount,topProductLabel,topProductCount,topCategoryLabel,topCategoryCount,monthlyIncome});

    } catch (error) {
        console.log(error.message);
    }
}
const LoadUsers = async(req,res)=>{
    try {
       const users=await User.find()
        // console.log(users);
        res.render('users',{users})
    } catch (error) {
        console.log(error.message);
    }
}
const blockUser =async(req,res)=>{
    try {
        const user = req.params.id
        // console.log(user);
        const value = await User.findOne({_id:user})
        value.is_blocked = !value.is_blocked
        await value.save()
        res.json({block:true})
    } catch (error) {
        console.log(error.message);
        
    }

}

const loadCategories =async(req,res)=>{

    try {
        // console.log("first");
        const categories = await Category.find().populate('offer')
        const offer = await Offer.find()
        // console.log(categories);
        res.render('categories',{categories,offer})
    } catch (error) {
        console.log(error.message);
    }
}
const loadAddCategories =async(req,res)=>{

    try {
        res.render('addCategories')
    } catch (error) {
        console.log(error.message);
    }
}
const addCategory=async(req,res)=>{
    try {
        console.log("first");
        const name =req.body.name.trim();
        const isExists = await Category.findOne({ name: { $regex: '.*' + name + '.*', $options: 'i' } })
        console.log(isExists);
        if(!isExists){
            const category = new Category({
            name    
            })
            await category.save();
            console.log("if running");
            res.redirect('/admin/categories')
        }else{
            console.log("else runing");
            res.render('addCategories',{message:'Category name already exists'})
        }
    } catch (error) {
        
    }
}

const blockCategories =async(req,res)=>{
    try {
        console.log("first  block");
        const user = req.params.id
       
        const value = await Category.findOne({_id:user})
        if(value.is_blocked){
            await Category.updateOne({_id:user},{$set:{is_list:false}})
            
        }else if(value.is_blocked ==false){
            await Category.updateOne({_id:user},{$set:{is_list:true}})
        }
        res.json({block:true})
    } catch (error) {
        console.log(error.message);
        
    }

}

const LoadUpdateCategories = async (req, res) => {
   


    try {
        const id = req.query.id;
        console.log("hi",id);
        
        const catData = await Category.findById({ _id: id });
        
        if (catData) {
            res.render('edit-cat', { user: catData });
        } else {
            res.redirect('/admin/categories')
        }

    } catch (error) {
        console.log(error.message);
    }
}

const updateCategories = async (req, res) => {
    try {
    console.log("looo");
     const id = await req.body.id;
        const exist = await Category.findOne({name:req.body.name});
        console.log("searching",id);
        const catData = await Category.findById({ _id: id });
        console.log("searchingthe again");
        console.log(exist);

        if(exist){
            res.render('edit-cat',{message1:"This Category already exist",user:catData});
        }else{
            console.log("saving");
        const userData = await Category.findByIdAndUpdate({_id: req.body.id }, { $set: { name: req.body.name,} })
console.log("done");
        res.redirect('/admin/categories');
        }
    } catch (error) {
        console.log(error.message);

    }
}
const deleteCategories = async (req,res)=>{
    try {
        console.log("1",req.body.id);
        const id = req.body.id;
        await Category.deleteOne({ _id: id });
        
        res.json({remove:true})

    } catch (error) {
        console.log(error.message);
    }
}






//products


const loadProducts =async(req,res)=>{

    try {
        console.log(req.query,"profdi nfijd")
        const page = parseInt(req.query.page) || 1; 
        const limit = 10; // Display 12 products per page
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        
  
        const products = await Products.find().populate({ path: 'categoryId', model: 'categories', populate: { path: 'offer', model: 'offer' } }).populate('offer').skip(startIndex).limit(limit);
        const category = await Category.find()
        const totalProducts = await Products.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);
  
        const today = new Date()
        const offer = await Offer.find({ expiryDate: { $gte: today } });
        console.log(category);
        
        res.render('products',{products,category,offer,totalPages,currentPage: page})
    } catch (error) {
       console.log(error.message)
    }
}
const addProducts = async (req,res)=>{
    try {
        const category = await Category.find()

        res.render('add-products',{category})
    } catch (error) {
        console.log(error.message);
    }
}

const logout = async (req, res) => {

    try {
        console.log("ivide ethi");
        req.session.destroy();
        res.redirect('/admin');

    } catch (error) {
        console.log(error.message);
    }
}

const users = async(req,res)=>{
   
   console.log(req.body)
}


module.exports ={
    loadLogin,
    loadDashboard,
    logout,
    verifyLoginAdmin,
    LoadUsers,
    blockUser,
    loadCategories,
    loadAddCategories,
    addCategory,
    blockCategories,
    LoadUpdateCategories,
    updateCategories,
    deleteCategories,
    loadProducts,
    addProducts,
    

    users
}