import { registerUser, loginUser, getCredits, razorPayment, verifyPayment} from "../controllers/userController.js";
import {Router} from 'express';
import userAuth from "../middlewares/AuthMiddleware.js";

const router = Router();

router.post('/register',registerUser);
router.post('/login',loginUser);
router.get('/credits',userAuth,getCredits);
router.post('/razorpay',userAuth,razorPayment);
router.post('/verify-payment',userAuth,verifyPayment);
export default router;