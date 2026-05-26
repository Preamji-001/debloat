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
