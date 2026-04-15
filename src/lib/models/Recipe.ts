import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRecipeItem {
  ingredient: mongoose.Types.ObjectId;
  quantity: number;
}

export interface IRecipe extends Document {
  name: string;
  ingredients: IRecipeItem[];
  instructions?: string;
  yieldAmount: number; // Volume in ml
  createdAt: Date;
  updatedAt: Date;
}

const recipeSchema = new Schema<IRecipe>(
  {
    name: { type: String, required: true, unique: true },
    ingredients: [
      {
        ingredient: { type: Schema.Types.ObjectId, ref: 'Ingredient', required: true },
        quantity: { type: Number, required: true },
      },
    ],
    instructions: { type: String },
    yieldAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

const RecipeModel: Model<IRecipe> = mongoose.models.Recipe || mongoose.model<IRecipe>('Recipe', recipeSchema);
export default RecipeModel;
