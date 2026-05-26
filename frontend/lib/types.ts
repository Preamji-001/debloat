export type Meal = {
  id: string; name: string; description: string | null
  category: 'high_protein' | 'gut_reset' | 'low_carb' | 'veg' | 'non_veg'
  kcal: number; protein_g: number; carbs_g: number; fat_g: number
  price_paise: number; image_url: string | null; is_available: boolean
}
export type MealPlan = {
  id: string; name: string; description: string | null
  meal_count: number; price_paise: number; discount_pct: number; is_active: boolean
}
export type DeliverySlot = {
  id: string; date: string; label: string
  capacity: number; booked_count: number; is_active: boolean
}
export type CartItem = { id: string; meal_id: string; meal: Meal; quantity: number }
export type Address = { id: string; label: string | null; line1: string; city: string; pincode: string; is_default: boolean }
export type Order = {
  id: string
  status: 'pending_payment' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'
  total_paise: number; created_at: string; delivery_slot: DeliverySlot; items: OrderItem[]
}
export type OrderItem = { id: string; meal_name: string; quantity: number; price_paise: number }
export type User = { id: string; name: string; email: string; phone: string; role: 'customer' | 'admin' }
export type MacroFilters = {
  kcal_max: number | null
  protein_min: number | null
  carbs_max: number | null
  fat_max: number | null
  category: string | null
}
export type ApiError = { error: { code: string; message: string } }
