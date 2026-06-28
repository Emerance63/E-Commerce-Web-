import { client } from './client';

export const ensureVariantForProduct = async (productId) => {
  const response = await client.get(`/products/${productId}`);
  const product = response.data?.data?.product || response.data?.data;
  const variants = product?.variants || [];

  if (variants.length > 0) return variants[0].id;

  const sku = `DEF-${productId.slice(-6)}-${Date.now().toString(36).slice(-4)}`.toUpperCase();
  const variantRes = await client.post(`/products/${productId}/variants`, {
    color: 'Default',
    sku,
    price: Number(product.price),
    stock: Number(product.stock) || 1,
  });

  const variant = variantRes.data?.data?.variant;
  if (!variant?.id) throw new Error('Could not create product variant');

  return variant.id;
};
