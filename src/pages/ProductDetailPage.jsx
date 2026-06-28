import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMinus, FiPlus, FiShoppingCart, FiCheck } from 'react-icons/fi';
import { useProduct } from '../api/products';
import { useAddToCart } from '../api/cart';
import { ProductComments } from '../components/ProductComments';
import { Button } from '../components/Button';
import { formatCurrency } from '../utils/formatCurrency';
import { LoadingSpinner } from '../components/LoadingStates';
import { ErrorState } from '../components/FeedbackStates';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  const { data: product, isLoading, isError, refetch } = useProduct(id);
  const addToCartMutation = useAddToCart();

  const variants = product?.variants || [];

  useEffect(() => {
    const v = product?.variants;
    if (v?.length > 0) {
      setSelectedVariantId(v[0].id);
    } else {
      setSelectedVariantId(null);
    }
  }, [product?.id]);

  const activeVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];
  const displayPrice = activeVariant?.price ?? product?.price;

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty >= 1) setQuantity(newQty);
  };

  const handleAddToCart = () => {
    addToCartMutation.mutate(
      {
        productId: product.id,
        quantity,
        variantId: selectedVariantId || activeVariant?.id,
      },
      {
        onSuccess: () => {
          setIsAdded(true);
          setTimeout(() => setIsAdded(false), 3000);
        },
      }
    );
  };

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (isError) {
    return (
      <div className="mt-12">
        <ErrorState
          title="Product not found"
          message="The product you're looking for doesn't exist or could not be loaded."
          onRetry={refetch}
        />
        <div className="text-center mt-4">
          <Button variant="ghost" onClick={() => navigate('/products')}>Back to Products</Button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-sm font-medium text-secondary-500 hover:text-secondary-900 mb-8 transition-colors"
      >
        <FiArrowLeft className="mr-2 w-4 h-4" /> Back
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-secondary-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="p-8 lg:p-12 bg-white flex items-center justify-center border-b md:border-b-0 md:border-r border-secondary-100">
            <div className="aspect-square w-full max-w-md relative">
              <img
                src={product.image || product.thumbnail || 'https://via.placeholder.com/600'}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="p-8 lg:p-12 flex flex-col justify-center bg-secondary-50/30">
            <div className="mb-2">
              <span className="inline-block px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-xs font-semibold uppercase tracking-wider">
                {product.category}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-secondary-900 tracking-tight mb-4">
              {product.title}
            </h1>

            <div className="flex items-end space-x-4 mb-6">
              <span className="text-3xl font-bold text-secondary-900">
                {formatCurrency(displayPrice)}
              </span>
              {product.rating && (
                <div className="flex items-center pb-1">
                  <div className="flex text-amber-400">
                    {'★'.repeat(Math.round(product.rating.rate))}
                    <span className="text-secondary-300">
                      {'★'.repeat(5 - Math.round(product.rating.rate))}
                    </span>
                  </div>
                  <span className="text-secondary-500 text-sm ml-2">
                    ({product.rating.count} reviews)
                  </span>
                </div>
              )}
            </div>

            <p className="text-base text-secondary-600 mb-6 leading-relaxed">
              {product.description}
            </p>

            {variants.length > 1 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-secondary-700 mb-2">Color</p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        selectedVariantId === variant.id
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-secondary-300 bg-white text-secondary-700 hover:border-primary-300'
                      }`}
                    >
                      {variant.color || variant.sku}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex items-center border border-secondary-300 rounded-lg bg-white h-14">
                  <button
                    type="button"
                    className="px-4 text-secondary-500 hover:text-primary-600 h-full transition-colors disabled:opacity-50"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <FiMinus className="w-5 h-5" />
                  </button>
                  <span className="w-12 text-center font-medium text-lg text-secondary-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    className="px-4 text-secondary-500 hover:text-primary-600 h-full transition-colors"
                    onClick={() => handleQuantityChange(1)}
                  >
                    <FiPlus className="w-5 h-5" />
                  </button>
                </div>

                <Button
                  size="lg"
                  className={`flex-1 h-14 text-lg font-bold shadow-sm transition-all duration-300 ${
                    isAdded ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''
                  }`}
                  onClick={handleAddToCart}
                  isLoading={addToCartMutation.isPending}
                >
                  {isAdded ? (
                    <>
                      <FiCheck className="w-5 h-5 mr-2" /> Added to Cart
                    </>
                  ) : (
                    <>
                      <FiShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center text-sm text-secondary-500">
                <svg className="w-5 h-5 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                In stock and ready to ship
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProductComments productId={product.id} />
    </div>
  );
};
