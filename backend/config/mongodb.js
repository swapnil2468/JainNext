import mongoose from "mongoose";

const connectDB = async () => {

    mongoose.connection.on('connected',() => {
    })
    
    mongoose.connection.on('error', (err) => {
    });

    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`);
    } catch (error) {
        throw error;
    }

}

export default connectDB;