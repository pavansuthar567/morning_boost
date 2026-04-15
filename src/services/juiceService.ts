import api from '@/lib/api';
import { Product } from '@/store/useStore';

export const juiceService = {
  // Get all active products
  getProducts: async (): Promise<Product[]> => {
    const response: any = await api.get('/products');
    return response?.products || [];
  },

  // Get single juice details
  getJuiceById: async (id: string): Promise<any> => {
    const response: any = await api.get(`/products/${id}`);
    return response?.product;
  },

  // Admin: Product Management
  saveProduct: async (id: string | null, data: any): Promise<any> => {
    if (id) return await api.patch(`/admin/products/${id}`, data);
    return await api.post('/admin/products', data);
  },

  deleteProduct: async (id: string): Promise<any> => {
    return await api.delete(`/admin/products/${id}`);
  },

  // Admin: Ingredients
  getIngredients: async (): Promise<any[]> => {
    const response: any = await api.get('/admin/ingredients');
    return response?.ingredients || [];
  },
  saveIngredient: async (id: string | null, data: any): Promise<any> => {
    if (id) return await api.patch(`/admin/ingredients/${id}`, data);
    return await api.post('/admin/ingredients', data);
  },
  deleteIngredient: async (id: string): Promise<any> => {
    return await api.delete(`/admin/ingredients/${id}`);
  },

  // Admin: Recipes
  getRecipes: async (): Promise<any[]> => {
    const response: any = await api.get('/admin/recipes');
    return response?.recipes || [];
  },
  saveRecipe: async (id: string | null, data: any): Promise<any> => {
    if (id) return await api.patch(`/admin/recipes/${id}`, data);
    return await api.post('/admin/recipes', data);
  },
  deleteRecipe: async (id: string): Promise<any> => {
    return await api.delete(`/admin/recipes/${id}`);
  },

  // Admin: Get procurement list for next delivery
  getProcurementList: async (date: string): Promise<any> => {
    const response: any = await api.get(`/admin/procurement?date=${date}`);
    return response?.items;
  }
};

export default juiceService;
