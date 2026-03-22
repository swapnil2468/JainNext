import express from 'express'
import { listProducts, addProduct, removeProduct, singleProduct, updateProduct, updateProductStatus } from '../controllers/productController.js'
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';

const productRouter = express.Router();

const variantImageFields = []
for (let v = 0; v < 10; v++) {
  for (let i = 0; i < 4; i++) {
    variantImageFields.push({ name: `variantImage_${v}_${i}`, maxCount: 1 })
  }
}
const uploadFields = [
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 },
  ...variantImageFields
]

productRouter.post('/add',adminAuth,upload.fields(uploadFields),addProduct);
productRouter.post('/update',adminAuth,upload.fields(uploadFields),updateProduct);
productRouter.post('/updateStatus',adminAuth,updateProductStatus);
productRouter.post('/remove',adminAuth,removeProduct);
productRouter.post('/single',singleProduct);
productRouter.get('/list',listProducts)

export default productRouter