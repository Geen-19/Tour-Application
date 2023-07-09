const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'The name of the user is required']
    },
    email: {
        type: String,
        required: [true, 'The email of the user is required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'please provide a valid email']
    },
    photo: {
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
      },
    password: {
        type: String,
        required: [true, 'A password is required for the user to login'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'The password confirmed field is required'],
        validate: {
            // this only works on create and save !!!
            validator: function(el) {
                return el === this.password;
            },
            message: 'Passwords are not the same'
        }

    },
    passwordChangedAt: Date,
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: Date
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    }
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

userSchema.pre('save', async function(next) {
    // only run this middleware if passwords are modified
    if(!this.isModified('password')) return next();
    // the current password is encrypted by hashing using bcrypt of 12 words
    // making it not possible for hackers to hack
    this.password = await bcrypt.hash(this.password, 12);
    // we do not want password confirm in database
    this.passwordConfirm = undefined;
    next();

});
userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now();
    next();
});
userSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: '-__v'
    });
    next();
})
userSchema.pre(/^find/, function(next) {
    // this points to the current query
    this.find({active: {$ne: false}});
    next();
});
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
  
      return JWTTimestamp < changedTimestamp;
    }
  
    // False means NOT changed
    return false;
  };

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = 
     crypto.createHash('sha256').update(resetToken).digest('hex');

     console.log(resetToken);
     console.log(this.passwordResetToken);
    this.passwordResetExpires = Date.now()  + 10*60*1000;
    return resetToken;
}
const User = mongoose.model('User', userSchema);
module.exports = User;