import axios from "axios";
import FormData from "form-data";
import User from "../models/userModel.js";

export const generateImage = async (req,res) =>{
    try {
        const userId = req.user._id;
        const {prompt} = req.body;
        if (!prompt){
            return res.status(401).json({message:"Prompt is missing!"});
        }
        const form = new FormData()
        form.append('prompt', prompt);
        const response = await axios.post('https://clipdrop-api.co/text-to-image/v1',form, {headers: {'x-api-key': process.env.CLIPDROP_API_KEY,},responseType: "arraybuffer"});
        const user = await User.findById(userId);
         if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
        if (user.creditBalance==0 || User.creditBalance<=0){
            return res.status(401).json({message:"User is out of credit balance!"})
        }
        const updatedCreditBalance = user.creditBalance-1
        await User.findByIdAndUpdate(userId,{creditBalance:(updatedCreditBalance)});
        const base64Image = Buffer.from(response.data,"binary").toString('base64');
        res.status(201).json({
            success:true,
            message:"Image generated successfully!",
            user:{
                name:user.name,
                email:user.email
            },
            creditBalance:updatedCreditBalance,
            image: `data:image/png;base64,${base64Image}`
        })
    } catch (error) {
        console.log(error.message);
        return res.status(401).json({message:error.message})
    }
}