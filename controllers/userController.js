import User from "../models/userModel.js";
import jwt from 'jsonwebtoken';
import razorpay from 'razorpay';
import Transaction from "../models/transactionModel.js";

export const registerUser = async (req,res) => {
try {
    const {name,email,password} = req.body;
    if (!name || !email || !password){
        return res.status(400).json({message:"All fields are required!"})
    }
    const ExistingUser = await User.findOne({email})
    if (ExistingUser){
        return res.status(409).json({message:"User alread exists with given email...."})
    }
    const newUser = new User({name,email,password})
    const user = await newUser.save();
    const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn: "7d",});
    return res.status(201).json({
        success:true,
        message:"User Registered Successfully!",
        user: {
            name: user.name,
            email: user.email
        },
        token
    });
} catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
}
}

export const loginUser = async (req,res) =>{
    try {
        const {email,password} = req.body;
        if (!email || !password){
            return res.status(400).json({message:"All fields are required!"})
        }
        const user = await User.findOne({email});
        if (!user){
            return res.status(401).json({message:"User doesn't exists with current mail Id!"})
        }
        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'})
        return res.status(201).json({
            success:true,
            token,
            message:"User loggedIn successfully!",
            user:{
                name:user.name,
                email:user.email
            }
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({message:error.message})
    }
}

export const getCredits = async (req,res) => {
    try {
       const userId = req.user._id;
       const user = await User.findById(userId);
       if (!user){
        return res.status(400).json({message:"User doesn't exists!"})
       }
       return res.status(201).json({
        success:true,
        credits: user.creditBalance,
        user:{
            name:user.name,
            email:user.email
        }
       })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({message:error.message})
    }
}

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET
});

export const razorPayment = async (req,res) => {
    try {
        const userId = req.user._id;
        const {planId} = req.body;
        if (!planId || !userId){
            return res.status(400).json({success:false,message:"Missing details in razorpayment controller!"})
        }
        const user = await User.findById(userId);
        if (!user){
            return res.status(401).json({success:false,message:"User not found! please login with valid user."})
        }
        let plan, credits, amount, date
        switch (planId) {
            case 'Basic':
                plan="Basic";
                credits=100;
                amount=10;
                break;
            case 'Advanced':
                plan="Advanced";
                credits=500;
                amount=50;
                break;
            case 'Business':
                plan="Business";
                credits=5000;
                amount=250;
                break;
            default:
                return res.status(401).json({success:false,message:"Invalid Plan"})
        };
        date = Date.now();
        const transaction = new Transaction({
            plan, userId, credits, amount, date
        });
        await transaction.save();
        const options = {
            amount: amount*100,
            currency: process.env.CURRENCY,
            receipt: transaction._id
        };
        const order = await razorpayInstance.orders.create(options);
        if (!order) return res.status(500).send("Some error occured");
        res.status(201).json({success:true,order});
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:error})
    }
}

export const verifyPayment = async (req,res) => {
    try {
        const {razorpayOrderId} = req.body;
        const userId = req.user._id;
        const orderInfo = await razorpayInstance.orders.fetch(razorpayOrderId);
        console.log(orderInfo);
        if (orderInfo.status === 'paid'){
            const transaction = await Transaction.findById(orderInfo.receipt);
            const user = await User.findById(userId);
            const updatedCreditBalance = user.creditBalance + transaction.credits;
            await Transaction.findByIdAndUpdate(orderInfo.receipt,{payment:true});
            await User.findByIdAndUpdate(userId,{creditBalance:updatedCreditBalance});
            return res.status(201).json({success:true,message:"Credits added to your account!"})
        }else{
            return res.status(401).json({success:false,message:"Payment is pending!"})
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:error})
    }
}
