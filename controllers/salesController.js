const bcrypt = require('bcrypt')
const session = require('express-session');
const User = require('../models/userModel');
const Category = require('../models/categoriesModel');
const Products = require('../models/productModel')
const { find, findOne } = require('../models/userVerification');
const Order = require('../models/orderModel')

const sharp = require('sharp')
const Wishlist =require('../models/whishlistModal')
const Coupon =require('../models/couponModel')



const loadSales = async(req,res)=>{
    try {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        sales = await Order.find({'products.productStatus':'delivered',
            orderDate: {
                $gte: startOfMonth,
                $lte: endOfMonth
            }
        }).populate('products.productId');
        const subtotal = sales.reduce((acc, curr) => {
            return acc + curr.subtotal
        }, 0);
        console.log(sales,startOfMonth,endOfMonth,"faes")
        res.render('sales',{sales,subtotal})
    } catch (error) {
        console.log(error.message)
    }
}

const filterSales= async(req,res)=>{
    try {
        console.log(req.query.filter,"frhj")
        const filter = req.query.filter

        const customStart = req.query.start
        const customEnd = req.query.end
        console.log(customStart,customEnd,"custoom")
        const endDateTime = new Date(customEnd);
        endDateTime.setHours(23, 59, 59, 999);
        let message = 'showing all sales reports';
        let sales
        if(customStart){
            console.log("custom reached")
            sales = await Order.aggregate([
                {
                  $match:{
                    'products.productStatus':'delivered',
                    orderDate:{$gte:new Date(customStart),$lte: endDateTime}
                  }
                },
                
              ])
              console.log(sales[0])
              let sum =0
              const subtotal = sales.reduce((acc, curr) => {
                return acc + curr.subtotal
            }, 0);
              console.log(subtotal,"sub")
              message = `showing ${customStart} to ${customEnd} sales reports.`
              res.render('sales',{sales,message,subtotal})
        }else{

        if(filter == 'monthly'){
            console.log("reacjed")
            const currentDate = new Date();
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            sales = await Order.find({'products.productStatus':'delivered',
                orderDate: {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                }
            }).populate('products.productId');;
            const subtotal = sales.reduce((acc, curr) => {
                return acc + curr.subtotal
            }, 0);
            console.log(sales,startOfMonth,endOfMonth,"faes")
            res.render('sales',{sales,subtotal})
        }else if(filter =='yearly'){
            console.log("yearly")
            const currentDate = new Date();
            const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
            const endOfYear = new Date(currentDate.getFullYear(), 11, 31);
            let sales = await Order.find({'products.productStatus':'delivered',
                orderDate: {
                    $gte: startOfYear,
                    $lte: endOfYear
                }
            }).populate('products.productId');
            const subtotal = sales.reduce((acc, curr) => {
                return acc + curr.subtotal
            }, 0);
            // console.log(yearly)
            res.render('sales',{sales,subtotal})

        }else{
            console.log("weeek")
            const currentDate = new Date();
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

            const endOfWeek = new Date(currentDate);
            endOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 6);
            console.log("Start of Week:", startOfWeek);
            console.log("End of Week:", endOfWeek);


            let sales = await Order.find({
                orderDate: {
                    $gte: startOfWeek,
                    $lte: endOfWeek
                }
            }).populate('products.productId');
            const subtotal = sales.reduce((acc, curr) => {
                return acc + curr.subtotal
            }, 0);
            res.render('sales',{sales,subtotal})
        }
    
    }

    } catch (error) {
        console.log(error.message)
    }
}

module.exports ={
    loadSales,
    filterSales,
} 