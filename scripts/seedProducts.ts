/**
 * Run this script to clear old products/recipes/ingredients and seed real ones.
 * Command: npx ts-node scripts/seedProducts.ts
 * Make sure to load environment variables first if needed, e.g.:
 * MONGODB_URI="your_uri" npx ts-node scripts/seedProducts.ts
 */

const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String, enum: ['fruit', 'veg', 'misc'], required: true },
  unit: { type: String, enum: ['kg', 'gm', 'pcs', 'ml', 'bunch'], required: true },
  marketPrice: { type: Number, default: 0 },
  qtyAvailable: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  ingredients: [{
    ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
    quantity: { type: Number, required: true },
  }],
  instructions: String,
  yieldAmount: { type: Number, required: true },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, default: 0 },
  category: { type: String, enum: ['Juice', 'Shake', 'Smoothie', 'Other', 'Immunity', 'Energy', 'Detox', 'Daily Core'], default: 'Juice' },
  image: { type: String, required: true },
  description: String,
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
  isActive: { type: Boolean, default: true },
});

const Ingredient = mongoose.models.Ingredient || mongoose.model('Ingredient', ingredientSchema);
const Recipe = mongoose.models.Recipe || mongoose.model('Recipe', recipeSchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function seedDatabase() {
  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI is not set in .env.local!");
    process.exit(1);
  }

  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB!");

    // 1. CLEAR OLD DATA
    console.log("🗑️ Clearing old Products, Recipes, and Ingredients...");
    await Product.deleteMany({});
    await Recipe.deleteMany({});
    await Ingredient.deleteMany({});

    // 2. CREATE BASE MODELS (Raw Materials / Ingredients)
    console.log("🌱 Seeding Raw Materials...");
    
    const rawMaterials = [
      { name: 'Spinach', category: 'veg', unit: 'kg', marketPrice: 40 },
      { name: 'Green Apple', category: 'fruit', unit: 'kg', marketPrice: 150 },
      { name: 'Celery', category: 'veg', unit: 'kg', marketPrice: 120 },
      { name: 'Cucumber', category: 'veg', unit: 'kg', marketPrice: 30 },
      { name: 'Lemon', category: 'fruit', unit: 'pcs', marketPrice: 5 },
      { name: 'Ginger', category: 'misc', unit: 'gm', marketPrice: 0.2 },
      { name: 'Orange', category: 'fruit', unit: 'kg', marketPrice: 80 },
      { name: 'Carrot', category: 'veg', unit: 'kg', marketPrice: 40 },
      { name: 'Pineapple', category: 'fruit', unit: 'pcs', marketPrice: 60 },
      { name: 'Turmeric Root', category: 'misc', unit: 'gm', marketPrice: 0.3 },
      { name: 'Black Pepper', category: 'misc', unit: 'gm', marketPrice: 1.0 },
      { name: 'Beetroot', category: 'veg', unit: 'kg', marketPrice: 50 },
      { name: 'Pomegranate', category: 'fruit', unit: 'kg', marketPrice: 180 },
      { name: 'Red Apple', category: 'fruit', unit: 'kg', marketPrice: 140 },
      { name: 'Mint Leaves', category: 'misc', unit: 'bunch', marketPrice: 10 },
      { name: 'Watermelon', category: 'fruit', unit: 'kg', marketPrice: 25 },
      { name: 'Yellow Apple', category: 'fruit', unit: 'kg', marketPrice: 130 },
      { name: 'Red Grape', category: 'fruit', unit: 'kg', marketPrice: 90 },
      { name: 'Kale', category: 'veg', unit: 'kg', marketPrice: 60 },
      { name: 'Parsley', category: 'misc', unit: 'bunch', marketPrice: 15 }
    ];

    const insertedIngredients = await Ingredient.insertMany(rawMaterials);
    const getIngId = (name: string) => insertedIngredients.find((i: any) => i.name === name)?._id;

    // 3. CREATE RECIPES
    console.log("📜 Seeding Recipes...");
    
    const recipes = [
      {
        name: 'Green Vitality Recipe',
        yieldAmount: 300,
        ingredients: [
          { ingredient: getIngId('Cucumber'), quantity: 0.15 },
          { ingredient: getIngId('Green Apple'), quantity: 0.15 },
          { ingredient: getIngId('Celery'), quantity: 0.10 },
          { ingredient: getIngId('Spinach'), quantity: 0.05 },
          { ingredient: getIngId('Lemon'), quantity: 0.5 },
          { ingredient: getIngId('Ginger'), quantity: 10 },
        ],
        instructions: 'Wash cucumber, celery, and spinach thoroughly in cold ozone water. Pass cucumber and celery through the cold press first for liquid base. Add green apples, followed by spinach leaves. Finish by pressing lemon (peeled) and ginger root. Double strain to remove micro-fibers for a smooth texture.'
      },
      {
        name: 'Citrus Glow Recipe',
        yieldAmount: 300,
        ingredients: [
          { ingredient: getIngId('Orange'), quantity: 0.20 },
          { ingredient: getIngId('Carrot'), quantity: 0.15 },
          { ingredient: getIngId('Pineapple'), quantity: 0.1 },
          { ingredient: getIngId('Turmeric Root'), quantity: 15 },
          { ingredient: getIngId('Black Pepper'), quantity: 1 },
        ],
        instructions: 'Peel oranges and pineapple completely. Scrub carrots well. Cold press carrots first, followed by the pineapple chunks. Juice the oranges and fresh turmeric root. Add a tiny pinch of finely ground black pepper directly into the mixing vat. Stir gently and bottle immediately to prevent Vitamin C oxidation.'
      },
      {
        name: 'Beet Rooted Recipe',
        yieldAmount: 300,
        ingredients: [
          { ingredient: getIngId('Watermelon'), quantity: 0.20 },
          { ingredient: getIngId('Beetroot'), quantity: 0.15 },
          { ingredient: getIngId('Red Apple'), quantity: 0.10 },
          { ingredient: getIngId('Pomegranate'), quantity: 0.05 },
          { ingredient: getIngId('Mint Leaves'), quantity: 0.5 },
        ],
        instructions: 'Extract arils from pomegranate. Scrub beetroots rigorously. Cold press the watermelon first to create a highly hydrating base liquid. Process the red apples and beetroots through the heavy press. Crush the pomegranate arils alongside the fresh mint for infused flavor. Mix thoroughly. Ensure deep ruby red hue without separation.'
      },
      {
        name: 'Liquid Gold Recipe',
        yieldAmount: 300,
        ingredients: [
          { ingredient: getIngId('Pineapple'), quantity: 0.15 },
          { ingredient: getIngId('Yellow Apple'), quantity: 0.20 },
          { ingredient: getIngId('Ginger'), quantity: 15 },
          { ingredient: getIngId('Lemon'), quantity: 0.5 },
          { ingredient: getIngId('Mint Leaves'), quantity: 0.2 },
        ],
        instructions: 'Peel the pineapple and cut into small chunks. Cold press the yellow apples and pineapple first. Add the ginger root and peeled lemon. Lightly crush mint leaves and stir into the final yield.'
      },
      {
        name: 'Ruby Cleanse Recipe',
        yieldAmount: 300,
        ingredients: [
          { ingredient: getIngId('Pomegranate'), quantity: 0.1 },
          { ingredient: getIngId('Beetroot'), quantity: 0.1 },
          { ingredient: getIngId('Carrot'), quantity: 0.2 },
          { ingredient: getIngId('Red Grape'), quantity: 0.15 },
        ],
        instructions: 'Extract pomegranate arils. Wash grapes and carrots thoroughly. Process grapes first, followed by the pomegranate arils. Cold press the carrots and beetroot to yield the dense red base. Mix well and double strain for a silky smooth finish.'
      },
      {
        name: 'Alkaline Green Recipe',
        yieldAmount: 300,
        ingredients: [
          { ingredient: getIngId('Kale'), quantity: 0.1 },
          { ingredient: getIngId('Cucumber'), quantity: 0.15 },
          { ingredient: getIngId('Celery'), quantity: 0.15 },
          { ingredient: getIngId('Parsley'), quantity: 0.5 },
          { ingredient: getIngId('Lemon'), quantity: 1 },
          { ingredient: getIngId('Green Apple'), quantity: 0.05 },
        ],
        instructions: 'Wash all greens rigorously in ozone water. Cold press cucumber and celery for maximum liquid yield. Slowly press kale, parsley, and green apple. Finish with a whole peeled lemon to cut the earthiness.'
      }
    ];

    const insertedRecipes = await Recipe.insertMany(recipes);
    const getRecId = (name: string) => insertedRecipes.find((r: any) => r.name === name)?._id;

    // 4. CREATE FINAL PRODUCTS
    console.log("🧃 Seeding Products...");

    const products = [
      {
        name: 'Green Vitality Real',
        price: 120,
        category: 'Immunity',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1QuAZLQgXCBHxy0BcEKhRglzerfWWC-1vPn7NXZciyOqV_MZgInCEWjivoDmzw_XLtny0YeXfJoFb7zrHBi3BTX-8QVbJRBdjeAPbKJnhIZLPQXlrJ4kUlrFihd_qCx4lbucJ6uXSk0tXYwFuQb2-gr_4zjfE1XZ-0Bf5AoVu12NBnleBwT9AbcdsNO2bzPcNzX8rEN4tdP6e14o9wZrdNAnKYZPERcoTEOnO32z3afdKSme0XJXKoEMDo-gB7Byc5EnnQIwmZwc',
        description: 'A powerful blend of alkalizing greens and hydrating cucumber, designed to flush toxins and rebuild cellular strength.',
        recipe: getRecId('Green Vitality Recipe'),
        isActive: true
      },
      {
        name: 'Citrus Glow Real',
        price: 110,
        category: 'Energy',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbA9CAicGuI3_qnblBkoS5JUaLGJiLMkMgWW-UhG8AGeY2G4HAMMHz2LmIpvAX8BD2ZC0GqHCeI0iY5ostmkp69mQheBa86_T9N-QhcOXWjJfkZblGf7Xk0L3yIPlpqysdbQIXRcR3g6GPrg7JlWwAHm-wR9AoJOCCirdtxNpCLmHdH20oQ6n2njZ0YxCLDAk1_zkwHS5VKKAzyxxFvxwAfoqCPI5jgkulkKw6ePnVabZrU_A5T1CQ9jRnJXF0Dq27zR1n7e3oPdU',
        description: 'A vibrant, metabolism-boosting citrus blend packed with vitamin C and anti-inflammatory turmeric activated by black pepper.',
        recipe: getRecId('Citrus Glow Recipe'),
        isActive: true
      },
      {
        name: 'Beet Rooted Real',
        price: 130,
        category: 'Detox',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIrfiBzFWaXV4otHis8tCw4zQvYiuhbSV-LBjN1kSlQTzUDlDFg4gW1vjSDrpxjNh_YAIgmwhL0skxCoTSyL5OFVN3as4AR_fFgJoWIHnBgC6WfJmRkgVGEnpBIfabjNRsPPVQ2qMrBM2dMcfJ_JsS2_kkT9FOQ_Kv8lAG6KcGMHgljGIoUuqyineCTxBz-1fX8JtkmvScLUQt9ha9RmprJbTCrMCZQpO8SvsRnT7dnU5Y_KAbefSPmtlhYqohE1lWjUmpnjvasf8',
        description: 'An earthy, stamina-building root blend that improves blood flow, paired with hydrating watermelon and sweet pomegranate.',
        recipe: getRecId('Beet Rooted Recipe'),
        isActive: true
      },
      {
        name: 'Liquid Gold Real',
        price: 115,
        category: 'Immunity',
        image: '/products/liquid_gold_glass.png',
        description: 'A tropical, anti-inflammatory blend that soothes the stomach and boosts immunity.',
        recipe: getRecId('Liquid Gold Recipe'),
        isActive: true
      },
      {
        name: 'Ruby Cleanse Real',
        price: 140,
        category: 'Detox',
        image: '/products/ruby_cleanse_glass.png',
        description: 'A deep red antioxidant powerhouse that cleanses the blood and supports liver function.',
        recipe: getRecId('Ruby Cleanse Recipe'),
        isActive: true
      },
      {
        name: 'Alkaline Green Real',
        price: 125,
        category: 'Daily Core',
        image: '/products/alkaline_green_glass.png',
        description: 'The ultimate daily core green juice. Highly alkalizing, extremely low in natural sugars.',
        recipe: getRecId('Alkaline Green Recipe'),
        isActive: true
      }
    ];

    await Product.insertMany(products);

    console.log("🎉 Successfully seeded all real data!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
