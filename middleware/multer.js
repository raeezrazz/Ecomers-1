const multer=require('multer');
console.log("mult");
const productStorage = multer.diskStorage({

    destination: "public/multerImage",
    filename:(req,file,cb)=>{
        const filename = file.originalname;
        cb(null,filename)
    }
})
console.log("mult");



const products = multer({ storage:productStorage});
const uploadproduct =products.array('images[]', 4)
// const uploadBanner = multer({ storage:BannerStorage})
const uploadproducts = products.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
])
module.exports = {
    uploadproduct,
    
    uploadproducts
}