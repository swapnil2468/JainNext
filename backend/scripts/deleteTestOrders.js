import mongoose from 'mongoose'
import userModel from '../models/userModel.js'
import orderModel from '../models/orderModel.js'
import dotenv from 'dotenv'

dotenv.config()

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'swastijain1903@gmail.com'

async function deleteTestOrders() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Connected to MongoDB')

        // Find all non-admin users
        const nonAdminUsers = await userModel.find({ email: { $ne: ADMIN_EMAIL } })
        console.log(`Found ${nonAdminUsers.length} non-admin users`)

        if (nonAdminUsers.length === 0) {
            console.log('No non-admin users found')
            await mongoose.connection.close()
            return
        }

        // Get their user IDs
        const userIds = nonAdminUsers.map(user => user._id.toString())
        console.log(`User IDs to delete orders for: ${userIds.length}`)

        // Delete all orders for these users
        const result = await orderModel.deleteMany({ userId: { $in: userIds } })
        console.log(`✅ Deleted ${result.deletedCount} test orders`)

        // Also clear cart data for these users
        const cartClearResult = await userModel.updateMany(
            { _id: { $in: userIds } },
            { cartData: {} }
        )
        console.log(`✅ Cleared cart data for ${cartClearResult.modifiedCount} users`)

        console.log('\n✅ Test data cleanup complete!')
        console.log('• All test orders removed')
        console.log('• User accounts preserved')
        console.log('• Admin data untouched')

        await mongoose.connection.close()
    } catch (err) {
        console.error('❌ Error deleting test orders:', err.message)
        process.exit(1)
    }
}

deleteTestOrders()
