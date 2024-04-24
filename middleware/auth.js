const isLogin = async(req,res,next)=>{
    try {
        if(req.session.userId){
            next()
        }else{
            res.redirect('/logining')
        }
    } catch (error) {
        console.log(error.message0);
    }
}

const isLogout = async(req,res,next)=>{
    try {
        if(req.session.userId){
            res.redirect('/')
        }else{
        next()
        }
    } catch (error) {
        console.log(error.message0);
    }
}

module.exports={
    isLogin,
    isLogout
}
