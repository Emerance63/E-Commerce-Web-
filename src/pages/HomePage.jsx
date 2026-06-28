import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useProducts } from "../api/products";
import { ProductCard } from "../components/ProductCard";
import { SkeletonCard, LoadingSpinner } from "../components/LoadingStates";
import { ErrorState } from "../components/FeedbackStates";

export const HomePage = () => {
  // Fetch a small limit of products for the featured section
  const { data, isLoading, isError, refetch } = useProducts({ limit: 8 });

  // Handle fakestoreapi response format (array) vs standard paginated format (object with results array)
  const products = Array.isArray(data) ? data : data?.results || [];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-[url('/image-1.jpg')] rounded-3xl overflow-hidden shadow-xl">
        <div className="absolute inset-0 "></div>
        {/* Optional background image or pattern here */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
            Discover Your Next{" "}
            <span className="text-primary-300">Favorite Thing</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-50 max-w-2xl mb-10 font-semibold">
            Explore our curated collection of premium products. Fast shipping,
            easy returns, and exceptional customer service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-medium rounded-lg text-primary-900 bg-white hover:bg-primary-50 transition-colors shadow-sm"
            >
              Shop Now <FiArrowRight className="ml-2 -mr-1 w-5 h-5" />
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-8 py-3.5 border border-primary-300 text-base font-medium rounded-lg text-white hover:bg-primary-800 transition-colors"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-secondary-900 tracking-tight">
              Featured Products
            </h2>
            <p className="mt-2 text-secondary-500">Hand-picked just for you.</p>
          </div>
          <Link
            to="/products"
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center group"
          >
            View All{" "}
            <FiArrowRight className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            title="Failed to load featured products"
            onRetry={refetch}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Value Props Section */}
      <section className="bg-white py-16 rounded-3xl border border-secondary-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-primary-50 p-4 rounded-full mb-4 text-primary-600">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-2">
                Free Shipping
              </h3>
              <p className="text-secondary-500">
                On all orders over $50. Delivered right to your door.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary-50 p-4 rounded-full mb-4 text-primary-600">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-2">
                Secure Payments
              </h3>
              <p className="text-secondary-500">
                Your information is protected by industry-leading encryption.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary-50 p-4 rounded-full mb-4 text-primary-600">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-2">
                Easy Returns
              </h3>
              <p className="text-secondary-500">
                Not satisfied? Return within 30 days for a full refund.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
