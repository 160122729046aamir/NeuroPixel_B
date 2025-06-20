import express from 'express';
import cors from 'cors'
import 'dotenv/config'  // ====> another method for dotenv.config({})
import connectDB from './config/dbConfig.js';
import userRouter from './routes/userRoutes.js';
import gntImageRouter from './routes/gntImageRoutes.js';

const PORT = process.env.PORT || 4000
const app = express()

app.use(express.json());
app.use(cors());

app.use('/api/user',userRouter);
app.use('/api/image',gntImageRouter);

connectDB();

app.get('/',(req,res)=>{
    res.send("API is working!")
})

app.listen(PORT,()=>{
    console.log(`App is listening at PORT: ${PORT}`)
})