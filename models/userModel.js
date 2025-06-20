import mongoose from "mongoose";
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
name:{
    type:String,
    required:true
},
email:{
    type: String,
    required: true
},
password:{
    type: String,
    required: true
},
creditBalance: {
    type: Number,
    default:5
}
})

userSchema.pre('save',async function (next) {
    if (!this.isModified('password')){
        return next()
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password,salt)
        next()
    } catch (error) {
        console.log(error.message)
        next(error)
    }
})

const User = mongoose.models.users || mongoose.model('User',userSchema);

export default User;