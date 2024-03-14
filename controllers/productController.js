
const bcrypt = require('bcrypt')
const session = require('express-session');
const User = require('../models/userModel');
const Category = require('../models/categoriesModel');
const Products = require('../models/productModel')
const { find, findOne } = require('../models/userVerification');

const sharp = require('sharp')







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
      console.log(req.body,"hello there first");
        const details = req.body;
        const products = await Products.find().populate('categoryId', 'name');
        const category = await Category.find()
        
        // console.log("here is body",categoryname.name
        // );

        
        
        const files = await req.files;
        const images = files.map((item)=>{
          return item.filename
          
        })
       
        if(images.length !== 3){
          res.render('add-products',{category,images:"Please select atleast 3 images"})
        }else{

          const sharpImage = await Promise.all(
            images.map(async(imagename)=>{
              if(imagename){
                await sharp(`public/multerImage/${imagename}`)
                .resize(500,500)
                .toFile(`public/multerImage/sharp/${imagename}`)
                console.log("done")
                return imagename;
              }
            })
          )
          console.log(sharpImage);


       if (details.quantity > 0 && details.price > 0) {
          // console.log("inside",files);
          const product = new Products({
            name: details.name,
            quantity: details.quantity,
            categoryId: details.category,
            price: details.price,
            offer: details.offer,
            description: details.description,
            images:sharpImage,
            createdAt:new Date()
          });
          // console.log(product,"finaly");
    
          const result = await product.save();
          // console.log(result);
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
        console.log("running");
        console.log(error.message);
        res.status(500).send("Internal Server Error");
      }
}
const removeProduct = async(req,res)=>{
  try {
    const productId = req.body.id 
    await Products.deleteOne({_id:productId})
    res.redirect('/admin/products')
  } catch (error) {
    console.log(error.message);
  }
}

const loadEditProduct = async(req,res)=>{
  try {
    const id = req.query.id

    const product = await Products.findOne({_id:id}).populate('categoryId');
    const category = await Category.find()
    console.log(id);
    const length = product.images.length
    console.log(length);
    res.render('edit-product',{product,category,length})
  } catch (error) {
    console.log(error.message);
  }
}
const subEditProduct= async (req,res)=>{
  try{
      console.log("hi",req.body,"end");
      const id = req.body.id
      const new1 = req.body
      const oldProduct = await Products.findOne({_id:id}).populate('categoryId');
      const oldImage = oldProduct.images
      console.log(oldImage);

        await Promise.all(
        new1.image1.map(async(imagename)=>{
          if(imagename){
            await sharp(`public/multerImage/${imagename}`)
            .resize(500,500)
            .toFile(`public/multerImage/sharp/${imagename}`)
            console.log("done")
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
    console.log(new1);
    const userData = await Products.findByIdAndUpdate({_id: req.body.id }, { $set: { name: req.body.name,quantity:req.body.quantity,price:req.body.price,description:req.body.description,images:req.body.image1, categoryId:req.body.category} })
    res.redirect('/admin/products')
  }catch(error){
    console.log(error.message);
  }
} 



// user side
const loadProducts =async(req,res)=>{
  try {
      const products = await Products.find()
      const category = await Category.find({})
      res.render('products',{products,category})
  
  } catch (error) {
      console.log(error.message);
  }
  
}
  
    const loadeachProducts =async(req,res)=>{
      try {
  
          
          const id = req.params.id
        
          console.log(id,"this is id");
          const data = await Products.findOne({_id:id})
          console.log(data,"data is here");
          const images = data.images
          console.log(images);
          res.render('detailedProduct',{data})
      } catch (error) {
          console.log(error.message);
      }
    }

    const searchProduct = async (req,res)=>{
      try{
        console.log(req.params ,"hiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
        const query = req.query.name
        console.log("frgf",query);
        const search = req.query.search

        const category = await Category.find({})
        
        let products
        if(!search && !query){
         const  product =await Products.find({})
         res.redirect('/loadProducts')
        }else if(search){
          console.log("her");
          products = await Products.find({name:{$regex:search,$options:'i'}});
          console.log("not");

        }else{
          products= await Products.find({categoryId:query})
        }
        console.log(products);
        
        if(products.lenght ==0){
          console.log("empty");
          res.render('products',{message:"No products found",products,category})
        }else{
          res.render('products',{products,category})
        }

      }catch(error){
        console.log(error.message)
      }
    }
      const sortProducts = async(req,res)=>{
        try{
          
          const sort = req.body.sortby
          // console.log(sort);
          const category = await Category.find({})
          let products
          if(sort == 'HighToLow'){
            products = await Products.find().sort({price:-1})
          }else if(sort == 'LowToHigh'){
            console.log("lowtoHigh");
            products = await Products.find().sort({price:1})
          }else if(sort == 'New'){
            products = await Products.find().sort({createdAt:-1})
            console.log(products,"new  sorting");
          }
          // console.log("empty",products,category,"ende");
          if (products && category) {
            console.log("Products , category available");
            res.render('products', { products, category });
        } else {
            // Handle case where products or category are not available
            console.log("Products or category not available");
            res.status(500).send("Internal Server Error");
        }
        
        }catch(error){
          console.log(error.message);
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
    sortProducts
}