const axios = require('axios');

const API_URL = 'https://e-commas-apis-production-e0f8.up.railway.app/api';
const ELECTRONICS_CATEGORY_ID = '6a40217b52deb9cfee038763';
const FASHION_CATEGORY_ID = '6a41247952deb9cfee038765';

const newProducts = [
  { name: 'MacBook Pro 16-inch', price: 2499.99, stock: 10, brand: 'Apple', description: 'M3 Max chip, 32GB RAM, 1TB SSD.' },
  { name: 'Samsung Galaxy S24 Ultra', price: 1299.99, stock: 25, brand: 'Samsung', description: 'Titanium frame, AI features, 256GB.' },
  { name: 'Nintendo Switch OLED', price: 349.99, stock: 40, brand: 'Nintendo', description: '7-inch OLED screen, 64GB internal storage.' },
  { name: 'Bose QuietComfort Ultra', price: 429.00, stock: 15, brand: 'Bose', description: 'Spatial audio and world-class noise cancellation.' },
  { name: 'Dell XPS 13 Plus', price: 1399.00, stock: 12, brand: 'Dell', description: '13.4-inch OLED touch display, Intel Core i7.' },
  { name: 'Sony PlayStation 5', price: 499.99, stock: 8, brand: 'Sony', description: 'Disc edition, 4K gaming, DualSense controller.' },
  { name: 'Xbox Series X', price: 499.99, stock: 14, brand: 'Microsoft', description: '1TB SSD, 120fps gaming, True 4K.' },
  { name: 'Logitech MX Master 3S', price: 99.99, stock: 50, brand: 'Logitech', description: 'Ergonomic wireless mouse with 8K DPI.' },
  { name: 'Apple Watch Series 9', price: 399.00, stock: 30, brand: 'Apple', description: 'Always-On Retina display, Blood Oxygen app.' },
  { name: 'LG C3 OLED 55-inch TV', price: 1299.99, stock: 5, brand: 'LG', description: '4K Smart TV, 120Hz refresh rate.' },
  { name: 'GoPro HERO12 Black', price: 399.99, stock: 20, brand: 'GoPro', description: 'Waterproof action camera with 5.3K60 HDR video.' },
  { name: 'Kindle Paperwhite', price: 139.99, stock: 45, brand: 'Amazon', description: '6.8-inch display, adjustable warm light, waterproof.' },
  { name: 'Keychron Q1 Pro', price: 199.00, stock: 18, brand: 'Keychron', description: 'Wireless custom mechanical keyboard.' },
  { name: 'Dyson V15 Detect', price: 749.99, stock: 7, brand: 'Dyson', description: 'Cordless vacuum cleaner with laser illumination.' },
  { name: 'DJI Mini 4 Pro', price: 759.00, stock: 11, brand: 'DJI', description: 'Lightweight drone with omnidirectional obstacle sensing.' },
  { name: 'Sonos Era 300', price: 449.00, stock: 22, brand: 'Sonos', description: 'Premium smart speaker with Dolby Atmos.' }
];

async function seed() {
  console.log(`Starting to seed ${newProducts.length} products to the API...`);
  
  for (const p of newProducts) {
    try {
      await axios.post(`${API_URL}/products`, {
        ...p,
        categoryId: ELECTRONICS_CATEGORY_ID
      });
      console.log(`✅ Created: ${p.name}`);
    } catch (err) {
      console.error(`❌ Failed: ${p.name}`, err.response?.data || err.message);
    }
  }
  
  console.log('Seeding complete!');
}

seed();
