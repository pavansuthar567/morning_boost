/**
 * Run: MONGODB_URI="your_uri" npx ts-node scripts/seedProducts.ts
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
  ingredients: [{ ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true }, quantity: { type: Number, required: true } }],
  instructions: [String],
  yieldAmount: { type: Number, required: true },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, default: 0 },
  category: { type: String, enum: ['Juice', 'Shake', 'Smoothie', 'Other'], default: 'Juice' },
  healthGoal: { type: String, enum: ['Immunity', 'Energy', 'Detox', 'Daily Core', 'Wellness', 'Hydration'] },
  image: { type: String, required: true },
  description: String,
  servingSize: { type: Number, default: 300 },
  unit: { type: String, default: 'ml' },
  benefits: [String],
  detailedBenefits: [{ title: String, description: String }],
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
  isActive: { type: Boolean, default: true },
});

const Ingredient = mongoose.models.Ingredient || mongoose.model('Ingredient', ingredientSchema);
const Recipe = mongoose.models.Recipe || mongoose.model('Recipe', recipeSchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function seedDatabase() {
  if (!process.env.MONGODB_URI) { console.error("❌ MONGODB_URI not set!"); process.exit(1); }
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected!");

    console.log("🗑️ Clearing old data...");
    await Product.deleteMany({});
    await Recipe.deleteMany({});
    await Ingredient.deleteMany({});

    // ── RAW MATERIALS ──
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
      { name: 'Parsley', category: 'misc', unit: 'bunch', marketPrice: 15 },
      // New for simple juices
      { name: 'Mango', category: 'fruit', unit: 'kg', marketPrice: 100 },
      { name: 'Sweet Lime (Mosambi)', category: 'fruit', unit: 'kg', marketPrice: 60 },
      { name: 'Amla (Indian Gooseberry)', category: 'fruit', unit: 'kg', marketPrice: 80 },
      { name: 'Sugarcane', category: 'misc', unit: 'kg', marketPrice: 20 },
      { name: 'Guava', category: 'fruit', unit: 'kg', marketPrice: 50 },
      { name: 'Honey', category: 'misc', unit: 'gm', marketPrice: 0.8 },
    ];
    const insertedIngredients = await Ingredient.insertMany(rawMaterials);
    const ing = (name: string) => insertedIngredients.find((i: any) => i.name === name)?._id;

    // ── RECIPES ──
    console.log("📜 Seeding Recipes...");
    const recipes = [
      // === PREMIUM BLENDS (existing 6) ===
      { name: 'Green Vitality Recipe', yieldAmount: 300, ingredients: [
        { ingredient: ing('Cucumber'), quantity: 0.15 }, { ingredient: ing('Green Apple'), quantity: 0.15 },
        { ingredient: ing('Celery'), quantity: 0.10 }, { ingredient: ing('Spinach'), quantity: 0.05 },
        { ingredient: ing('Lemon'), quantity: 0.5 }, { ingredient: ing('Ginger'), quantity: 10 },
      ], instructions: ['Wash cucumber, celery, and spinach thoroughly.', 'Cold press cucumber and celery first for liquid base.', 'Add green apples, then spinach leaves.', 'Finish with lemon and ginger root.', 'Double strain for smooth texture.'] },
      { name: 'Citrus Glow Recipe', yieldAmount: 300, ingredients: [
        { ingredient: ing('Orange'), quantity: 0.20 }, { ingredient: ing('Carrot'), quantity: 0.15 },
        { ingredient: ing('Pineapple'), quantity: 0.1 }, { ingredient: ing('Turmeric Root'), quantity: 15 },
        { ingredient: ing('Black Pepper'), quantity: 1 },
      ], instructions: ['Peel oranges and pineapple.', 'Cold press carrots, then pineapple.', 'Juice oranges and turmeric root.', 'Add pinch of black pepper.', 'Stir and bottle immediately.'] },
      { name: 'Beet Rooted Recipe', yieldAmount: 300, ingredients: [
        { ingredient: ing('Watermelon'), quantity: 0.20 }, { ingredient: ing('Beetroot'), quantity: 0.15 },
        { ingredient: ing('Red Apple'), quantity: 0.10 }, { ingredient: ing('Pomegranate'), quantity: 0.05 },
        { ingredient: ing('Mint Leaves'), quantity: 0.5 },
      ], instructions: ['Extract pomegranate arils.', 'Cold press watermelon for base.', 'Process red apples and beetroots.', 'Crush pomegranate with mint.', 'Mix thoroughly.'] },
      { name: 'Liquid Gold Recipe', yieldAmount: 300, ingredients: [
        { ingredient: ing('Pineapple'), quantity: 0.15 }, { ingredient: ing('Yellow Apple'), quantity: 0.20 },
        { ingredient: ing('Ginger'), quantity: 15 }, { ingredient: ing('Lemon'), quantity: 0.5 },
        { ingredient: ing('Mint Leaves'), quantity: 0.2 },
      ], instructions: ['Peel and chunk pineapple.', 'Cold press yellow apples and pineapple.', 'Add ginger and lemon.', 'Stir in crushed mint leaves.'] },
      { name: 'Ruby Cleanse Recipe', yieldAmount: 300, ingredients: [
        { ingredient: ing('Pomegranate'), quantity: 0.1 }, { ingredient: ing('Beetroot'), quantity: 0.1 },
        { ingredient: ing('Carrot'), quantity: 0.2 }, { ingredient: ing('Red Grape'), quantity: 0.15 },
      ], instructions: ['Extract pomegranate arils and wash grapes.', 'Process grapes then pomegranate.', 'Cold press carrots and beetroot.', 'Double strain for smooth finish.'] },
      { name: 'Alkaline Green Recipe', yieldAmount: 300, ingredients: [
        { ingredient: ing('Kale'), quantity: 0.1 }, { ingredient: ing('Cucumber'), quantity: 0.15 },
        { ingredient: ing('Celery'), quantity: 0.15 }, { ingredient: ing('Parsley'), quantity: 0.5 },
        { ingredient: ing('Lemon'), quantity: 1 }, { ingredient: ing('Green Apple'), quantity: 0.05 },
      ], instructions: ['Wash all greens in ozone water.', 'Cold press cucumber and celery.', 'Press kale, parsley, green apple.', 'Finish with peeled lemon.'] },

      // === SIMPLE PURE JUICES (new 10) ===
      { name: 'Pure Orange Recipe', yieldAmount: 300, ingredients: [
        { ingredient: ing('Orange'), quantity: 0.4 },
      ], instructions: ['Peel oranges.', 'Cold press directly.', 'Strain and serve fresh.'] },
      { name: 'Pomegranate Bliss Recipe', yieldAmount: 250, ingredients: [
        { ingredient: ing('Pomegranate'), quantity: 0.3 },
      ], instructions: ['Extract arils from pomegranate.', 'Cold press arils.', 'Double strain for seedless finish.'] },
      { name: 'Watermelon Mint Recipe', yieldAmount: 300, ingredients: [
        { ingredient: ing('Watermelon'), quantity: 0.4 }, { ingredient: ing('Mint Leaves'), quantity: 0.3 },
      ], instructions: ['Remove watermelon rind and seeds.', 'Cold press watermelon.', 'Crush mint and stir in.'] },
      { name: 'Mosambi Fresh Recipe', yieldAmount: 300, ingredients: [
        { ingredient: ing('Sweet Lime (Mosambi)'), quantity: 0.4 },
      ], instructions: ['Peel mosambi.', 'Cold press directly.', 'Serve immediately for max freshness.'] },
      { name: 'ABC Juice Recipe', yieldAmount: 300, ingredients: [
        { ingredient: ing('Red Apple'), quantity: 0.15 }, { ingredient: ing('Beetroot'), quantity: 0.1 },
        { ingredient: ing('Carrot'), quantity: 0.15 },
      ], instructions: ['Wash and scrub all produce.', 'Cold press apple first.', 'Follow with beetroot and carrot.', 'Mix well.'] },
      { name: 'Carrot Ginger Recipe', yieldAmount: 300, ingredients: [
        { ingredient: ing('Carrot'), quantity: 0.35 }, { ingredient: ing('Ginger'), quantity: 10 },
      ], instructions: ['Scrub carrots well.', 'Cold press carrots with ginger.', 'Strain and serve.'] },
      { name: 'Amla Shot Recipe', yieldAmount: 60, ingredients: [
        { ingredient: ing('Amla (Indian Gooseberry)'), quantity: 0.1 }, { ingredient: ing('Honey'), quantity: 5 },
        { ingredient: ing('Ginger'), quantity: 5 },
      ], instructions: ['Wash and deseed amla.', 'Cold press with ginger.', 'Add raw honey and stir.'] },
      { name: 'Pineapple Punch Recipe', yieldAmount: 300, ingredients: [
        { ingredient: ing('Pineapple'), quantity: 0.3 }, { ingredient: ing('Mint Leaves'), quantity: 0.2 },
      ], instructions: ['Peel and chunk pineapple.', 'Cold press pineapple.', 'Muddle mint and stir in.'] },
      { name: 'Guava Delight Recipe', yieldAmount: 300, ingredients: [
        { ingredient: ing('Guava'), quantity: 0.3 }, { ingredient: ing('Lemon'), quantity: 0.5 },
      ], instructions: ['Wash and quarter guavas.', 'Cold press guava.', 'Add fresh lemon juice.', 'Strain well.'] },
      { name: 'Mango Magic Recipe', yieldAmount: 300, ingredients: [
        { ingredient: ing('Mango'), quantity: 0.35 },
      ], instructions: ['Peel and pit mangoes.', 'Cold press mango pulp.', 'Serve chilled.'] },
    ];
    const insertedRecipes = await Recipe.insertMany(recipes);
    const rec = (name: string) => insertedRecipes.find((r: any) => r.name === name)?._id;

    // ── PRODUCTS ──
    console.log("🧃 Seeding Products...");
    const products = [
      // === PREMIUM BLENDS ===
      { name: 'Green Vitality', price: 120, category: 'Juice', healthGoal: 'Immunity', servingSize: 300, unit: 'ml',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1QuAZLQgXCBHxy0BcEKhRglzerfWWC-1vPn7NXZciyOqV_MZgInCEWjivoDmzw_XLtny0YeXfJoFb7zrHBi3BTX-8QVbJRBdjeAPbKJnhIZLPQXlrJ4kUlrFihd_qCx4lbucJ6uXSk0tXYwFuQb2-gr_4zjfE1XZ-0Bf5AoVu12NBnleBwT9AbcdsNO2bzPcNzX8rEN4tdP6e14o9wZrdNAnKYZPERcoTEOnO32z3afdKSme0XJXKoEMDo-gB7Byc5EnnQIwmZwc',
        description: 'A powerful blend of alkalizing greens and hydrating cucumber, designed to flush toxins.',
        benefits: ['🥒 Deep Hydration', '🌱 Cell Rebuilder', '✨ Toxin Flush'],
        detailedBenefits: [{ title: 'Deep Hydration', description: 'Cucumber and celery provide essential electrolytes.' }, { title: 'Cell Rebuilder', description: 'Loaded with chlorophyll from spinach.' }],
        recipe: rec('Green Vitality Recipe'), isActive: true },
      { name: 'Citrus Glow', price: 110, category: 'Juice', healthGoal: 'Energy', servingSize: 300, unit: 'ml',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbA9CAicGuI3_qnblBkoS5JUaLGJiLMkMgWW-UhG8AGeY2G4HAMMHz2LmIpvAX8BD2ZC0GqHCeI0iY5ostmkp69mQheBa86_T9N-QhcOXWjJfkZblGf7Xk0L3yIPlpqysdbQIXRcR3g6GPrg7JlWwAHm-wR9AoJOCCirdtxNpCLmHdH20oQ6n2njZ0YxCLDAk1_zkwHS5VKKAzyxxFvxwAfoqCPI5jgkulkKw6ePnVabZrU_A5T1CQ9jRnJXF0Dq27zR1n7e3oPdU',
        description: 'Metabolism-boosting citrus blend with vitamin C and anti-inflammatory turmeric.',
        benefits: ['🍊 Vitamin C Surge', '🔥 Metabolism Boost', '✨ Glowing Skin'],
        detailedBenefits: [{ title: 'Vitamin C Surge', description: 'Massive natural Vitamin C for immunity and skin.' }, { title: 'Metabolism Boost', description: 'Turmeric with black pepper boosts absorption.' }],
        recipe: rec('Citrus Glow Recipe'), isActive: true },
      { name: 'Beet Rooted', price: 130, category: 'Juice', healthGoal: 'Detox', servingSize: 300, unit: 'ml',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIrfiBzFWaXV4otHis8tCw4zQvYiuhbSV-LBjN1kSlQTzUDlDFg4gW1vjSDrpxjNh_YAIgmwhL0skxCoTSyL5OFVN3as4AR_fFgJoWIHnBgC6WfJmRkgVGEnpBIfabjNRsPPVQ2qMrBM2dMcfJ_JsS2_kkT9FOQ_Kv8lAG6KcGMHgljGIoUuqyineCTxBz-1fX8JtkmvScLUQt9ha9RmprJbTCrMCZQpO8SvsRnT7dnU5Y_KAbefSPmtlhYqohE1lWjUmpnjvasf8',
        description: 'Earthy, stamina-building root blend that improves blood flow.',
        benefits: ['🩸 Blood Flow', '🏃 Stamina Builder', '❤️ Heart Health'],
        detailedBenefits: [{ title: 'Improved Blood Flow', description: 'Beetroots are high in nitrates for blood flow.' }, { title: 'Stamina Builder', description: 'Increased oxygen delivery to muscles.' }],
        recipe: rec('Beet Rooted Recipe'), isActive: true },
      { name: 'Liquid Gold', price: 115, category: 'Juice', healthGoal: 'Immunity', servingSize: 300, unit: 'ml',
        image: '/products/liquid_gold_glass.png',
        description: 'Tropical, anti-inflammatory blend that soothes the stomach.',
        benefits: ['🍍 Digestion Aid', '🛡️ Immunity Boost', '✨ Anti-Inflammatory'],
        detailedBenefits: [{ title: 'Digestion Aid', description: 'Pineapple bromelain helps break down proteins.' }, { title: 'Immunity Boost', description: 'Vitamin C from lemon and apples.' }],
        recipe: rec('Liquid Gold Recipe'), isActive: true },
      { name: 'Ruby Cleanse', price: 140, category: 'Juice', healthGoal: 'Detox', servingSize: 300, unit: 'ml',
        image: '/products/ruby_cleanse_glass.png',
        description: 'Deep red antioxidant powerhouse that cleanses blood.',
        benefits: ['🍷 Antioxidants', '🩸 Blood Purifier', '👀 Vision Health'],
        detailedBenefits: [{ title: 'Antioxidants', description: 'Red grapes and pomegranate provide resveratrol.' }, { title: 'Vision Health', description: 'Beta-carotene from carrots for healthy eyes.' }],
        recipe: rec('Ruby Cleanse Recipe'), isActive: true },
      { name: 'Alkaline Green', price: 125, category: 'Juice', healthGoal: 'Daily Core', servingSize: 300, unit: 'ml',
        image: '/products/alkaline_green_glass.png',
        description: 'Ultimate daily core green juice. Highly alkalizing, low sugar.',
        benefits: ['🥬 Alkalizing', '⚖️ Low Sugar', '🦴 Bone Health'],
        detailedBenefits: [{ title: 'Highly Alkalizing', description: 'Chlorophyll restores alkaline pH balance.' }, { title: 'Bone Health', description: 'Kale is packed with Vitamin K.' }],
        recipe: rec('Alkaline Green Recipe'), isActive: true },

      // === SIMPLE PURE JUICES (new 10) ===
      { name: 'Pure Orange', price: 80, category: 'Juice', healthGoal: 'Immunity', servingSize: 300, unit: 'ml',
        image: '/products/pure_orange.png',
        description: '100% pure cold-pressed orange juice. Classic immunity booster.',
        benefits: ['🍊 Vitamin C', '🛡️ Immunity', '⚡ Instant Energy'],
        detailedBenefits: [{ title: 'Vitamin C Rich', description: 'One glass provides your full daily Vitamin C requirement.' }],
        recipe: rec('Pure Orange Recipe'), isActive: true },
      { name: 'Pomegranate Bliss', price: 120, category: 'Juice', healthGoal: 'Wellness', servingSize: 250, unit: 'ml',
        image: '/products/pomegranate_bliss.png',
        description: 'Pure pomegranate juice — the king of antioxidants.',
        benefits: ['🍷 Antioxidants', '❤️ Heart Health', '🩸 Iron Rich'],
        detailedBenefits: [{ title: 'Antioxidant Powerhouse', description: '3x more antioxidants than green tea.' }],
        recipe: rec('Pomegranate Bliss Recipe'), isActive: true },
      { name: 'Watermelon Mint', price: 70, category: 'Juice', healthGoal: 'Hydration', servingSize: 300, unit: 'ml',
        image: '/products/watermelon_mint.png',
        description: 'Refreshing watermelon with a hint of cool mint. Perfect summer cooler.',
        benefits: ['💧 Super Hydrating', '🌿 Cooling', '🏃 Post-Workout'],
        detailedBenefits: [{ title: 'Super Hydrating', description: 'Watermelon is 92% water with natural electrolytes.' }],
        recipe: rec('Watermelon Mint Recipe'), isActive: true },
      { name: 'Mosambi Fresh', price: 75, category: 'Juice', healthGoal: 'Daily Core', servingSize: 300, unit: 'ml',
        image: '/products/mosambi_fresh.png',
        description: 'Pure sweet lime juice. India\'s all-time favourite refresher.',
        benefits: ['🍋 Digestive', '💧 Hydrating', '✨ Skin Glow'],
        detailedBenefits: [{ title: 'Easy on Stomach', description: 'Mosambi is gentle on digestion, perfect for any time.' }],
        recipe: rec('Mosambi Fresh Recipe'), isActive: true },
      { name: 'ABC Juice', price: 90, category: 'Juice', healthGoal: 'Wellness', servingSize: 300, unit: 'ml',
        image: '/products/abc_juice.png',
        description: 'Apple + Beetroot + Carrot — the miracle detox combination.',
        benefits: ['🍎 Miracle Drink', '🩸 Blood Purifier', '✨ Skin Glow'],
        detailedBenefits: [{ title: 'Miracle Drink', description: 'The ABC combo is globally famous for its detox and anti-aging properties.' }],
        recipe: rec('ABC Juice Recipe'), isActive: true },
      { name: 'Carrot Ginger', price: 75, category: 'Juice', healthGoal: 'Immunity', servingSize: 300, unit: 'ml',
        image: '/products/carrot_ginger.png',
        description: 'Classic carrot juice with a ginger kick. Immunity in a glass.',
        benefits: ['🥕 Beta-Carotene', '🔥 Anti-Inflammatory', '👀 Eye Health'],
        detailedBenefits: [{ title: 'Beta-Carotene', description: 'Converts to Vitamin A for eye health and immunity.' }],
        recipe: rec('Carrot Ginger Recipe'), isActive: true },
      { name: 'Amla Shot', price: 50, category: 'Juice', healthGoal: 'Immunity', servingSize: 60, unit: 'ml',
        image: '/products/amla_shot.png',
        description: 'Concentrated amla shot with honey and ginger. Ayurvedic immunity booster.',
        benefits: ['🛡️ Super Immunity', '✨ Anti-Aging', '💪 Strength'],
        detailedBenefits: [{ title: 'Super Immunity', description: 'Amla has 20x more Vitamin C than orange.' }],
        recipe: rec('Amla Shot Recipe'), isActive: true },
      { name: 'Pineapple Punch', price: 85, category: 'Juice', healthGoal: 'Energy', servingSize: 300, unit: 'ml',
        image: '/products/pineapple_punch.png',
        description: 'Tropical pineapple juice with fresh mint. Sweet and tangy.',
        benefits: ['🍍 Bromelain', '⚡ Energy Boost', '🌿 Refreshing'],
        detailedBenefits: [{ title: 'Bromelain Enzyme', description: 'Natural digestive enzyme that reduces inflammation.' }],
        recipe: rec('Pineapple Punch Recipe'), isActive: true },
      { name: 'Guava Delight', price: 70, category: 'Juice', healthGoal: 'Daily Core', servingSize: 300, unit: 'ml',
        image: '/products/guava_delight.png',
        description: 'Pure guava juice with a lemon twist. Rich in Vitamin C and fiber.',
        benefits: ['🍈 Fiber Rich', '🛡️ Immunity', '💚 Low Calorie'],
        detailedBenefits: [{ title: 'Fiber Rich', description: 'Guava has 4x more fiber than pineapple, great for digestion.' }],
        recipe: rec('Guava Delight Recipe'), isActive: true },
      { name: 'Mango Magic', price: 90, category: 'Juice', healthGoal: 'Energy', servingSize: 300, unit: 'ml',
        image: '/products/mango_magic.png',
        description: 'Pure Alphonso-style mango juice. India\'s king of fruits, cold-pressed.',
        benefits: ['🥭 King of Fruits', '⚡ Natural Energy', '✨ Skin Glow'],
        detailedBenefits: [{ title: 'Natural Energy', description: 'Natural sugars from mango provide sustained energy without crashes.' }],
        recipe: rec('Mango Magic Recipe'), isActive: true },
    ];

    await Product.insertMany(products);
    console.log("🎉 Successfully seeded all data! (6 premium + 10 simple juices)");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

seedDatabase();
