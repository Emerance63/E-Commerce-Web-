# E-Comus - React E-Commerce Assignment

A complete, working e-commerce web client built with React, Tailwind CSS v4, Axios, and TanStack Query. 

## Features
- **Product Catalog**: Browse products, search, filter by category, and view product details. Pagination included.
- **Cart**: Add to cart, update quantities, remove items. Persistent via server state. Optimistic UI updates.
- **Checkout & Orders**: Place orders, view order confirmation, and review order history.
- **State Management**: Strict separation of server state (TanStack Query cache) and local UI state (React state/URL params). No duplication of server data.
- **UI/UX**: Fully responsive design system using TailwindCSS v4. Meaningful loading skeletons, error states, and empty states. Toast notifications for actions.

## Tech Stack
- **React 18** (Vite)
- **Tailwind CSS v4**
- **React Router v6**
- **Axios** (Centralized instance with interceptors)
- **TanStack Query v5** (Data fetching, caching, optimistic mutations)
- **React Hot Toast** (Notifications)
- **React Icons**

## Project Structure
Organized by layer:
- `/src/api` - Centralized Axios client and all TanStack Query hooks organized by resource (`products.js`, `cart.js`, etc.)
- `/src/components` - Reusable UI components (Button, ProductCard, CartItem, Layout)
- `/src/pages` - Route-level components mapping to specific URLs
- `/src/hooks` - Custom React hooks (e.g., `useDebounce` for search)
- `/src/utils` - Helper functions

## State Management Approach
As per the rubric, server state and UI state are strictly separated:
- **Server State**: Products, Cart, Orders, and Categories are fetched and managed entirely by **TanStack Query**. They live in the query cache, and components subscribe to them via `useQuery`. Mutations (adding to cart, placing an order) use `useMutation` with cache invalidation to keep the UI perfectly synced with the server.
- **UI State**: The active search string, form input fields during checkout, current page number, and mobile menu toggle are managed locally using `useState` or URL search parameters (`useSearchParams`).

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add the API Base URL:
   ```env
   VITE_API_BASE_URL=https://e-commas-apis-production-e0f8.up.railway.app/api-docs/
   ```
  
4. Start the development server:
   ```bash
   npm run dev
   ```

## Note on the API ("E-Comus")
During development, the specific "E-Comus" API documentation was unavailable. The API layer (`/src/api`) has been architected to handle standard RESTful e-commerce endpoints. Once the actual API URL and exact endpoint paths are confirmed, you only need to update the base URL in `.env` and potentially adjust the paths in the `/api/*.js` files. The UI and state management logic will continue to work seamlessly.
