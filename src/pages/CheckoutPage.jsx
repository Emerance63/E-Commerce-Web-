import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiLock, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { useCart } from '../api/cart';
import { usePlaceOrder } from '../api/orders';
import { Button } from '../components/Button';
import { formatCurrency } from '../utils/formatCurrency';
import { LoadingSpinner } from '../components/LoadingStates';

const InputField = ({ label, name, value, onChange, type = "text", required = true, placeholder }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-secondary-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      required={required}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="block w-full border-secondary-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-4 py-2.5 border"
    />
  </div>
);

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { data: cartData, isLoading: cartLoading } = useCart();
  const placeOrderMutation = usePlaceOrder();

  // Local UI State for forms (controlled components)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const items = Array.isArray(cartData) ? cartData : (cartData?.items || []);
  const subtotal = items.reduce((sum, item) => sum + ((item.product?.price || item.price || 0) * (item.quantity || 1)), 0);
  const shipping = subtotal > 50 ? 0 : 10;
  const total = subtotal + shipping;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    placeOrderMutation.mutate(undefined, {
      onSuccess: (response) => {
        const orderId = response?.id;
        navigate(`/orders/${orderId}`, { replace: true });
      },
    });
  };

  if (cartLoading) return <LoadingSpinner fullScreen />;
  
  if (items.length === 0 && !placeOrderMutation.isSuccess) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Button onClick={() => navigate('/products')}>Return to Shop</Button>
      </div>
    );
  }


  return (
    <div className="max-w-7xl mx-auto">
      <button 
        onClick={() => navigate('/cart')}
        className="inline-flex items-center text-sm font-medium text-secondary-500 hover:text-secondary-900 mb-6 transition-colors"
      >
        <FiArrowLeft className="mr-2 w-4 h-4" /> Back to Cart
      </button>

      <h1 className="text-3xl font-bold text-secondary-900 tracking-tight mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Checkout Form */}
        <div className="lg:w-2/3">
          <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-secondary-100">
            
            {/* Contact Info */}
            <section>
              <h2 className="text-xl font-bold text-secondary-900 mb-4 pb-2 border-b border-secondary-100">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} />
                <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                <div className="sm:col-span-2">
                  <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section>
              <h2 className="text-xl font-bold text-secondary-900 mb-4 pb-2 border-b border-secondary-100">Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <InputField label="Street Address" name="address" value={formData.address} onChange={handleInputChange} />
                </div>
                <InputField label="City" name="city" value={formData.city} onChange={handleInputChange} />
                <InputField label="ZIP / Postal Code" name="zipCode" value={formData.zipCode} onChange={handleInputChange} />
              </div>
            </section>

            {/* Payment Details (Mock) */}
            <section>
              <div className="flex items-center mb-4 pb-2 border-b border-secondary-100">
                <h2 className="text-xl font-bold text-secondary-900 mr-2">Payment Details</h2>
                <FiLock className="text-secondary-400" />
              </div>
              <div className="bg-secondary-50 p-4 rounded-lg mb-4 text-sm text-secondary-600 flex items-start">
                <FiCheckCircle className="text-emerald-500 mt-0.5 mr-2 shrink-0" />
                This is a demo checkout. Payment fields are not processed — your order is placed through the E-Comus API.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <InputField label="Card Number" name="cardNumber" placeholder="0000 0000 0000 0000" required={false} value={formData.cardNumber} onChange={handleInputChange} />
                </div>
                <InputField label="Expiry Date" name="expiryDate" placeholder="MM/YY" required={false} value={formData.expiryDate} onChange={handleInputChange} />
                <InputField label="CVV" name="cvv" placeholder="123" required={false} value={formData.cvv} onChange={handleInputChange} />
              </div>
            </section>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full text-lg h-14"
              isLoading={placeOrderMutation.isPending}
            >
              <FiLock className="w-5 h-5 mr-2" /> Place Order - {formatCurrency(total)}
            </Button>
          </form>
        </div>

        {/* Order Summary (Smaller version) */}
        <div className="lg:w-1/3">
          <div className="bg-secondary-50 rounded-2xl p-6 border border-secondary-200 sticky top-24">
            <h2 className="text-lg font-bold text-secondary-900 mb-4">In your cart</h2>
            
            <ul className="divide-y divide-secondary-200 mb-6 max-h-96 overflow-y-auto pr-2 scrollbar-hide">
              {items.map((item, index) => {
                const product = item.product || item;
                const qty = item.quantity || 1;
                return (
                  <li key={index} className="py-3 flex justify-between">
                    <div className="flex">
                      <div className="relative">
                        <img src={product.thumbnail || product.image} alt={product.title} className="w-12 h-12 object-contain bg-white rounded border border-secondary-200" />
                        <span className="absolute -top-2 -right-2 bg-secondary-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-secondary-50">{qty}</span>
                      </div>
                      <span className="ml-3 text-sm font-medium text-secondary-900 line-clamp-2 pr-2">{product.title}</span>
                    </div>
                    <span className="text-sm font-bold text-secondary-900 shrink-0">{formatCurrency(product.price * qty)}</span>
                  </li>
                );
              })}
            </ul>
            
            <div className="space-y-2 border-t border-secondary-200 pt-4 mb-4">
              <div className="flex justify-between text-sm text-secondary-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-secondary-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-secondary-200 pt-4">
              <span className="text-base font-bold text-secondary-900">Total</span>
              <span className="text-xl font-bold text-secondary-900">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
