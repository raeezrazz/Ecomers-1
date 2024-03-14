
function generateUniqueId(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let uniqueId = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      uniqueId += characters.charAt(randomIndex);
    }
  
    return uniqueId;
  }


  const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}


const insertuser = async (req, res) => {
    try {
        console.log("1",req.body)
        const existingUser = await User.findOne({
            $or: [{ email: req.body.email }, { mobile: req.body.mobile }],
          });
      
          if (existingUser) {
            res.json({user:true,  message: "User already exists" });
            return;
          }

          if (req.body.referralCode) {
            const existReferral = await User.findOne({ referral_code: req.body.referralCode });
        
            if (!existReferral) {
                return res.json( { referral:true,message: 'Referral code is not valid.' });
            } else {
                const data = {
                    amount: 1000,
                    date: new Date()
                };
        
                await User.findOneAndUpdate(
                    { _id: existReferral._id },
                    {
                        $inc: { wallet: 1000 },
                        $push: { walletHistory: data }
                    }
                );
            }
        }
          const id = generateUniqueId(7);

        const spassword = await securePassword(req.body.password);

        const { name, email, mobile } = req.body;
        const user = new User({
            name: name,
            email: email,
            mobile: mobile,
            password: spassword,
            referral_code: id
        });
        
        const userData = await user.save();
        const redirectPath = `/verifyotp?id=${user._id}`;

        res.json({ redirectPath });
        await sendOtpVerificationEmail(userData, res);
        req.session.user_email = req.body.email
        console.log( req.session.user_email,"vvero");
      } catch (error) {
        console.error(error.message);
      }
    };

