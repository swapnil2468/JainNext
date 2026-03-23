// Migration script to generate slugs for existing products without them
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import productModel from '../models/productModel.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const generateSlug = async (name, existingSlugs = new Set()) => {
  const base = name.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  
  let slug = base;
  let count = 1;
  
  // Check against existing slugs in database and in-memory set
  while (await productModel.findOne({ slug }) || existingSlugs.has(slug)) {
    slug = `${base}-${count}`;
    count++;
  }
  
  return slug;
};

const migrateProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/forever', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('connected to database');
    
    // Find all products without slugs
    const productsWithoutSlugs = await productModel.find({ slug: { $exists: false } });
    
    console.log(`Found ${productsWithoutSlugs.length} products without slugs`);
    
    if (productsWithoutSlugs.length === 0) {
      console.log('No products need slug generation!');
      mongoose.connection.close();
      return;
    }
    
    const existingSlugs = new Set();
    
    // Generate slugs for all products without them
    for (const product of productsWithoutSlugs) {
      const slug = await generateSlug(product.name, existingSlugs);
      existingSlugs.add(slug);
      
      // Update the product with the generated slug
      product.slug = slug;
      await product.save();
      
      console.log(`✓ Generated slug for "${product.name}": ${slug}`);
    }
    
    console.log(`\n✅ Successfully generated slugs for ${productsWithoutSlugs.length} products`);
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error during migration:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the migration
migrateProducts();

