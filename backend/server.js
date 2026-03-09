import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
 
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import reviewRouter from './routes/reviewRoute.js'

// Validate required environment variables
const requiredEnvVars = [
    'MONGODB_URI',
    'CLOUDINARY_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_SECRET_KEY',
    'JWT_SECRET',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
];

// Warn (but don't exit) for optional service keys
const optionalEnvVars = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'EMAIL_USER', 'EMAIL_PASS'];
optionalEnvVars.forEach(v => {
    if (!process.env[v]) console.warn(`⚠️  Optional env var not set: ${v}`);
});

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error('❌ Error: Missing required environment variables:');
    missingEnvVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nPlease configure all required environment variables in .env file');
    process.exit(1);
}

// App Config
const app = express()
const port = process.env.PORT || 4000;

// Connect to database and cloudinary
(async () => {
    try {
        await connectDB();
        await connectCloudinary();
        console.log('✅ All services connected successfully');
    } catch (error) {
        console.error('❌ Failed to connect services:', error.message);
        process.exit(1);
    }
})();

// middlewares
app.use(express.json())
app.use(cors())

// api endpoints

app.use('/api/user',userRouter)
app.use('/api/product',productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/order',orderRouter)
app.use('/api/review', reviewRouter)

app.get('/',(req,res)=>{
    res.send("API Working")
})

app.listen(port, ()=> console.log('Server started on PORT : '+ port))