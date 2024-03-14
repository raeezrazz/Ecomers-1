const session = require('express-session');
const User = require('../models/userModel');
const bcrypt = require('bcrypt')
const Category = require('../models/categoriesModel');
const Products = require('../models/productModel')
const { find, findOne } = require('../models/userVerification');





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
        res.render('home', { admin: userData });

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
        if(value.is_blocked){
            await User.updateOne({_id:user},{$set:{is_blocked:false}})
            
        }else if(value.is_blocked ==false){
            await User.updateOne({_id:user},{$set:{is_blocked:true}})
        }
        res.json({block:true})
    } catch (error) {
        console.log(error.message);
        
    }

}

const loadCategories =async(req,res)=>{

    try {
        // console.log("first");
        const categories = await Category.find()
        // console.log(categories);
        res.render('categories',{categories})
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
        
        res.redirect('/admin/categories')

    } catch (error) {
        console.log(error.message);
    }
}

const loadProducts =async(req,res)=>{

    try {
        const products = await Products.find().populate('categoryId', 'name');
        const category = await Category.find()
        console.log(category);
        
        res.render('products',{products,category})
    } catch (error) {
        console.log(error.message);
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
    const category = await Category.find()
    res.render('add-products',{category})
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