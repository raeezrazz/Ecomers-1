const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    //accountId can be google Id, facebook Id, github Id etc.
    accountId: {
      type: String,
    },
    name: {
      type: String,
      trim: true,
    },
 
    provider: {
      type: String,
    },
    // facebookId: {
    //   type: String,
    // },
    // githubId: {
    //   type: String,
    // },
  },
  {
    timestamps: true,
  }
);

const googleUser = mongoose.model('googleUser', userSchema);
module.exports = googleUser;