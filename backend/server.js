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
    if (!process.env[v]) {
        // Optional variable not set
    }
});

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
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
    } catch (error) {
        process.exit(1);
    }
})();

// middlewares
app.use(express.json())
// Restrict CORS to known origins when ALLOWED_ORIGINS is set; open in dev
const corsOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : true;
app.use(cors({ origin: corsOrigins }))

// api endpoints

app.use('/api/user',userRouter)
app.use('/api/product',productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/order',orderRouter)
app.use('/api/review', reviewRouter)

app.get('/',(req,res)=>{
    res.send("API Working")
})

const tryListen = (portToTry, portsToTry) => {
    const server = app.listen(portToTry, () => {
        console.log(`Server running on port ${portToTry}`)
    })
    
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE' && portsToTry.length > 0) {
            const nextPort = portsToTry.shift()
            console.error(`Port ${portToTry} is in use. Trying port ${nextPort}...`)
            tryListen(nextPort, portsToTry)
        } else {
            throw err
        }
    })
}

// Try ports: 4000, 3000, 4002, 4003, 5000
const initialPort = process.env.PORT || 4000
const fallbackPorts = [3000, 4002, 4003, 5000, 8000]
tryListen(initialPort, fallbackPorts)