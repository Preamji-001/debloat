# Changelog

All notable changes to DeBloat are documented here.

## [Unreleased]

### Added
- `frontend/`: Next.js 14 App Router project scaffold with TypeScript and Tailwind CSS
- Design tokens: bg, surface, surface2, border, off-white, muted colours + logo/mono/body font families
- CSS vars and global reset (`border-radius: 0`) in `globals.css`
- Jest + React Testing Library setup with ts-jest
- Stub `Nav` and `Footer` layout components
- `zustand` and `lucide-react` dependencies
- `frontend/lib/types.ts`: all shared TypeScript types (Meal, MealPlan, DeliverySlot, CartItem, Address, Order, User, MacroFilters)
- `frontend/lib/api.ts`: typed fetch wrapper with 401→refresh retry, full endpoint coverage
- `frontend/components/ui/Button.tsx`: primary/ghost/danger variants, sm/md sizes
- `frontend/components/ui/Input.tsx`: labelled input with inline error state
- `frontend/components/ui/Toggle.tsx`: on/off toggle with 150ms transition
- `frontend/components/layout/Nav.tsx`: logo with blinking cursor, nav links, cart badge
- `frontend/components/layout/Footer.tsx`: minimal dark footer
- `frontend/lib/cartStore.ts`: Zustand cart store (load/add/update/remove/clear)
- `frontend/app/(public)/page.tsx`: Home page — hero, stats bar, featured meals (server component)
- `frontend/components/meals/MacroSlider.tsx`: range slider with label and null-for-max semantics
- `frontend/components/meals/MacroFilters.tsx`: Apply-gated filters, active tags with dismiss, category pills
- `frontend/components/meals/MealCard.tsx`: macro pills, price, add-to-cart button, unavailable overlay
- `frontend/components/meals/MealGrid.tsx`: responsive 3-column grid with empty state
- `frontend/app/(public)/menu/page.tsx`: client-side menu page with live macro filtering
- `frontend/app/(public)/menu/[id]/page.tsx`: meal detail page with static params generation
- `frontend/components/plans/PlanCard.tsx`: plan card with discount badge, meal count, pricing
- `frontend/app/(public)/plans/page.tsx`: plans listing page (server component)
- `frontend/app/(public)/plans/[id]/page.tsx`: plan detail page (server component)
- `frontend/app/(auth)/login/page.tsx`: login form with email/password validation
- `frontend/app/(auth)/register/page.tsx`: registration form with name/email/phone/password validation
- `frontend/components/cart/CartItem.tsx`: cart item row with quantity stepper and remove button
- `frontend/components/cart/CartDrawer.tsx`: slide-in cart drawer with clear and checkout actions
- `frontend/app/cart/page.tsx`: full cart page, auth-guarded, with subtotal panel
- `frontend/components/checkout/SlotPicker.tsx`: date-picker + time slot selector with capacity enforcement
- `frontend/components/checkout/AddressForm.tsx`: address selector with inline add-new form
- `frontend/components/checkout/OrderSummary.tsx`: read-only order summary with slot info
- `frontend/app/(account)/checkout/page.tsx`: checkout page integrating address, slot, summary + Razorpay modal
- `frontend/app/(account)/order-confirmed/page.tsx`: post-payment confirmation page with order detail
- `frontend/app/(account)/account/orders/page.tsx`: order history list with status badges
- `frontend/app/(account)/account/orders/[id]/page.tsx`: order detail with status timeline
- `frontend/app/(account)/account/page.tsx`: profile page with saved addresses management
- `frontend/components/admin/MealToggleRow.tsx`: admin row with availability toggle
- `frontend/app/(account)/admin/meals/page.tsx`: admin meal availability management page
- `frontend/app/(account)/admin/orders/page.tsx`: admin orders page with inline status update selects
- `frontend/lib/api.ts`: added `updateOrderStatus` endpoint
- `backend/`: Go/Gin REST API server
- `backend/cmd/server/main.go`: entry point — loads env, connects DB, wires CORS and all routes
- `backend/internal/config/config.go`: env-based config loader
- `backend/internal/db/db.go`: pgxpool connection helper
- `backend/internal/middleware/auth.go`: JWT cookie auth middleware + admin role check
- `backend/internal/models/models.go`: all domain structs (User, Meal, MealPlan, DeliverySlot, Address, CartItem, Order, OrderItem)
- `backend/internal/handlers/auth.go`: register, login, logout, refresh, /me
- `backend/internal/handlers/meals.go`: list (with macro filters) and get meal
- `backend/internal/handlers/plans.go`: list and get meal plan
- `backend/internal/handlers/slots.go`: list delivery slots by date
- `backend/internal/handlers/cart.go`: get, add (upsert), update, remove, clear cart
- `backend/internal/handlers/addresses.go`: list and create addresses
- `backend/internal/handlers/orders.go`: create order with Razorpay, list orders, get order
- `backend/internal/handlers/admin.go`: admin list/update orders, toggle meal availability
- `backend/migrations/001_init.sql`: full PostgreSQL schema
- `backend/.env.example`: environment variable template
- `backend/internal/handlers/webhook.go`: Razorpay webhook — verifies HMAC-SHA256 signature, confirms/cancels order on payment.captured/payment.failed
- `frontend/.env.local.example`: frontend environment variable template (NEXT_PUBLIC_RAZORPAY_KEY_ID)
