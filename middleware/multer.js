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

module.exports = {
    uploadproduct,
    
   
}   