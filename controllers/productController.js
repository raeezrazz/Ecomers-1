
const bcrypt = require('bcrypt')
const session = require('express-session');
const User = require('../models/userModel');
const Category = require('../models/categoriesModel');
const Products = require('../models/productModel')
const { find, findOne } = require('../models/userVerification');

const sharp = require('sharp')
const Wishlist =require('../models/whishlistModal')
const Coupon =require('../models/couponModel')
const Cart = require('../models/cartModel')




const addProductsLoad = async (req,res)=>{
    try {
        const category = await Category.find()

        res.render('add-products',{category})
    } catch (error) {
        console.log(error.message);
    }
} 

const addingProduct = async(req,res)=>{
    try {
        const details = req.body;
        const products = await Products.find().populate('categoryId', 'name');
        const category = await Category.find()
        
        // );

        
        
        const files = await req.files;
        const images = files.map((item)=>{
          return item.filename
          
        })
        if(images.length !== 3){
          res.render('add-products',{category,images:"Please select images"})
        }else{

         


       if (details.quantity > 0 && details.price > 0) {
          const product = new Products({
            name: details.name,
            quantity: details.quantity,
            categoryId: details.category,
            price: details.price,
            offer: details.offer,
            description: details.description,
            images:images,
            createdAt:new Date()
          });
    
          const result = await product.save();
          res.redirect("/admin/products");
        } else {
          // Provide specific error message
         if (details.quantity > 0) {
          const errors = 'Quantity must be greater than 0';
          res.render("add-Products", { errors, category });
         } else if(details.price > 0){
          const errors2 = 'Price must be greater than 0';
          res.render("add-Products", { errors2, category });
         }
        }}
          
      } catch (error) {
        res.status(500).send("Internal Server Error");
      }
}
const removeProduct = async(req,res)=>{
  try {
    const productId = req.body.id 
    await Products.deleteOne({_id:productId})
    res.json({remove:true})
  } catch (error) {
    console.log(error.message);
  }
}

const loadEditProduct = async(req,res)=>{
  try {
    const id = req.query.id

    const product = await Products.findOne({_id:id}).populate('categoryId');
    const category = await Category.find()
    const length = product.images.length
    res.render('edit-product',{product,category,length})
  } catch (error) {
    console.log(error.message);
  }
}
const subEditProduct= async (req,res)=>{
  try{
      const id = req.body.id
      const new1 = req.body

      const oldProduct = await Products.findOne({_id:id}).populate('categoryId');
      const oldImage = oldProduct.images

        await Promise.all(
        new1.image1.map(async(imagename)=>{
          if(imagename){
            await sharp(`public/multerImage/${imagename}`)
            .resize(500,500)
            .toFile(`public/multerImage/sharp/${imagename}`)
            return imagename;
          }
        })
      )
    if(new1.image1[0]==''){
      new1.image1[0]=oldImage[0]
    }
     if(new1.image1[1]==''){
      new1.image1[1]=oldImage[1]
    }
     if(new1.image1[2]==''){
      new1.image1[2]=oldImage[2]
    }
     if(new1.image1[3]==''){
      new1.image1[3]=oldImage[3]
    }
    const userData = await Products.findByIdAndUpdate({_id: req.body.id }, { $set: { name: req.body.name,quantity:req.body.quantity,price:req.body.price,description:req.body.description,images:req.body.image1, categoryId:req.body.category} })
    res.redirect('/admin/products')
  }catch(error){
    console.log(error.message);
  }
} 



// user side
const loadProducts = async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1; 
      const limit = 6; // Display 12 products per page
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      const products = await Products.find().populate({ path: 'offer', model: 'offer' }).populate('categoryId').skip(startIndex).limit(limit);
      
      const totalProducts = await Products.countDocuments();
      const totalPages = Math.ceil(totalProducts / limit);

      const category = await Category.find({});
      const wishlist = await Wishlist.find();
      const cart = await Cart.findOne({user:req.session.userId}).populate('product.productId')
      let subtotal
      if(cart){
        subtotal = cart.product.reduce((acc,curr)=>{
          return acc +curr.productId.price
      },0)
      }
     
      const old = new Date();
      old.setDate(old.getDate() - 5);


      res.render('products', {
          products,
          category,
          old,
          cart,
          subtotal,
          wishlist,
          totalPages,
          currentPage: page
      });
  } catch (error) {
      console.log(error.message);
      
  }
}

  
    const loadeachProducts =async(req,res)=>{
      try {
  
          
          const id = req.params.id
          const userId=req.session.userId
          const cart =await Cart.findOne({user:userId})
          let subtotal
          if(cart){
            subtotal = cart.product.reduce((acc,curr)=>{
              return acc +curr.productId.price
          },0)
          }
          const data = await Products.findOne({_id:id}).populate('categoryId')
          const images = data.images
          res.render('detailedProduct',{data,cart,subtotal})
      } catch (error) {
          console.log(error.message);
      }
    }

    const searchProduct = async (req,res)=>{
      try{
        const query = req.query.name
        const search = req.query.search
        const cart = await Cart.findOne({user:req.session.userId}).populate('product.productId')
      let subtotal
      if(cart){
        subtotal = cart.product.reduce((acc,curr)=>{
          return acc +curr.productId.price
      },0)
      }
     
        const old = new Date();
      old.setDate(old.getDate() - 5);
        const category = await Category.find({})
        if(query == 'all'){
          const  product =await Products.find({}).populate({ path: 'offer', model: 'offer' }).populate('categoryId')
         res.redirect('/loadProducts')
        }else{
        let products
        if(!search && !query){
         const  product =await Products.find({}).populate({ path: 'offer', model: 'offer' }).populate('categoryId')
         res.redirect('/loadProducts')
        }else if(search){
          products = await Products.find({name:{$regex:search,$options:'i'}}).populate({ path: 'offer', model: 'offer' }).populate('categoryId')

        }else{
          products= await Products.find({categoryId:query}).populate({ path: 'offer', model: 'offer' }).populate('categoryId')
        }
        
        if(products.lenght ==0){
          res.render('products',{message:"No products found",products,cart,subtotal,category,currentPage:20,totalPages:2})
        }else{
          res.render('products',{products,category,old,currentPage:20,cart,subtotal,totalPages:2})
        }
      }
      }catch(error){
        console.log(error.message)
      }
    }
const sortProducts = async(req,res)=>{
        try{
          
          const cart = await Cart.findOne({user:req.session.userId}).populate('product.productId')
      let subtotal
      if(cart){
        subtotal = cart.product.reduce((acc,curr)=>{
          return acc +curr.productId.price
      },0)
      }
     
          const sort = req.query.sort
          const old = new Date();
      old.setDate(old.getDate() - 5);
          const category = await Category.find({})
          let products
          if(sort == 'HighToLow'){
            products = await Products.find().sort({price:-1}).populate({ path: 'offer', model: 'offer' }).populate('categoryId')
          }else if(sort == 'LowToHigh'){
            products = await Products.find().sort({price:1}).populate({ path: 'offer', model: 'offer' }).populate('categoryId')
          }else if(sort == 'New'){
            products = await Products.find().sort({createdAt:-1}).limit(3).populate({ path: 'offer', model: 'offer' }).populate('categoryId')
          } else if (sort === 'A-Z') {
            products = await Products.find().sort({ name: 1 }).collation({ locale: "en", caseLevel: false }).populate({ path: 'offer', model: 'offer' }).populate('categoryId')
        } else if (sort === 'Z-A') {
            products = await Products.find().sort({ name: -1 }).collation({ locale: "en", caseLevel: false }).populate({ path: 'offer', model: 'offer' }).populate('categoryId')
        }else if (sort =='popularity'){
          products = await Products.find().sort({ popularity:-1}).populate({ path: 'offer', model: 'offer' }).populate('categoryId')
        }
          if (products && category) {
            res.render('products', { products, category,old ,cart,subtotal,currentPage:20,totalPages:2});
        } else {
            // Handle case where products or category are not available
            console.log("Products or category not available");
            res.status(500).send("Internal Server Error");
        }
        
        }catch(error){
          console.log(error.message);
          }
        
      }

const blockProduct = async(req,res)=>{
  try{
    const productId = req.params.id
    const product = await Products.findOne({_id:productId})
    product.is_blocked =! product.is_blocked
    await product.save()
    res.json({block:true})

  }catch(error){
    console.log(error.message)
  }
}

module.exports= {
    addProductsLoad,
    addingProduct,
    removeProduct,
    loadEditProduct,
    subEditProduct,
    loadeachProducts,
    loadProducts,
    searchProduct,
    sortProducts,
    blockProduct
}