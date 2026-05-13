// ===================================================
//  URBAN KICKS — products.js
//  Loads products from the backend API.
//  Falls back to the hardcoded list only when the
//  backend is completely unreachable.
// ===================================================

// 👇 Change this to your actual deployed backend URL
const API_URL = "https://derick-urban-kicks-backend.onrender.com";

// Global products array — populated at runtime
let products = [];

// --------------------------------------------------
//  loadProductsFromAPI
//  Called on page load (from script.js)
// --------------------------------------------------
async function loadProductsFromAPI() {
  try {
    const res = await fetch(`${API_URL}/api/products`);
    if (!res.ok) throw new Error("API returned " + res.status);

    const apiProducts = await res.json();

    if (Array.isArray(apiProducts) && apiProducts.length > 0) {
      // Map backend fields → frontend fields
      products = apiProducts.map(p => ({
        id:          p.id,
        name:        p.name,
        brand:       p.brand  || "",
        price:       `KES ${Number(p.price).toLocaleString()}`,
        rawPrice:    p.price,                      // keeps a clean number for cart math
        sizes:       p.sizes && p.sizes.length > 0 ? p.sizes : [38, 39, 40, 41, 42, 43],
        image:       p.images && p.images.length > 0 ? p.images[0] : "images/placeholder.jpg",
        images:      p.images || [],
        gender:      p.gender      || "Unisex",
        category:    p.category    || "Kicks",
        new:         p.new         || false,
        discount:    p.discount    || null,
        stock:       p.stock       ?? 0,
        description: p.description || ""
      }));
    } else {
      // Backend is running but has no products yet
      console.warn("Backend has no products — using local fallback list");
      products = FALLBACK_PRODUCTS;
    }

  } catch (err) {
    // Backend is offline (e.g. Render cold-start / no internet)
    console.warn("Could not reach backend, using local products:", err.message);
    products = FALLBACK_PRODUCTS;
  }

  // Tell script.js to render whatever we loaded
  if (typeof renderProducts === "function") renderProducts();
}


// --------------------------------------------------
//  FALLBACK PRODUCTS
//  These show when the backend is completely offline.
//  Once your backend is seeded, you won't see these
//  in production — but they keep the site usable
//  during development / cold starts.
// --------------------------------------------------
const FALLBACK_PRODUCTS = [
  {
    name: "Asics Gel Contend Black & White",
    price: "KES 2,600", rawPrice: 2600,
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    image: "images/Asics-Gel-Contend-black and white.jpg",
    gender: "Men", category: "Kicks", new: true, discount: 50
  },
  {
    name: "Asics Gel Contend Black",
    price: "KES 2,600", rawPrice: 2600,
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    image: "images/Asics-Gel-contend-Black.jpg",
    gender: "Men", category: "Kicks"
  },
  {
    name: "Asics Gel Contend White",
    price: "KES 2,600", rawPrice: 2600,
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    image: "images/Asics-Gel-Contend-White.jpg",
    gender: "Men", category: "Kicks"
  },
  {
    name: "Asics PowerGel",
    price: "KES 2,600", rawPrice: 2600,
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    image: "images/Asics-powergel-.jpg",
    gender: "Men", category: "Kicks"
  },
  {
    name: "Beige Three Buckle Footbed Sandals",
    price: "KES 2,000", rawPrice: 2000,
    sizes: [36, 37, 38, 39, 40],
    image: "images/beige-three-buckle-footbed-sandals.jpg",
    gender: "Women", category: "Kicks"
  },
  {
    name: "Black Adidas Superstar",
    price: "KES 3,200", rawPrice: 3200,
    sizes: [40, 41, 42, 43, 44],
    image: "images/black-adidas-superstar.jpg",
    gender: "Men", category: "Kicks"
  },
  {
    name: "Black Gladiator Sandals",
    price: "KES 2,300", rawPrice: 2300,
    sizes: [36, 37, 38, 39],
    image: "images/black-gladiator-sandals.jpg",
    gender: "Women", category: "Kicks"
  },
  {
    name: "Black Leather Criss Cross Sandals",
    price: "KES 2,000", rawPrice: 2000,
    sizes: [36, 37, 38, 39],
    image: "images/black-leather-criss-cross-sandals.jpg",
    gender: "Women", category: "Kicks"
  },
  {
    name: "Black Timberland Low Top",
    price: "KES 3,200", rawPrice: 3200,
    sizes: [40, 41, 42, 43, 44],
    image: "images/black-timberland-low-top.jpg",
    gender: "Men", category: "Kicks"
  },
  {
    name: "Blue Men's Canvas",
    price: "KES 2,200", rawPrice: 2200,
    sizes: [40, 41, 42, 43],
    image: "images/Blue-men's-canvas.jpg",
    gender: "Men", category: "Kicks"
  },
  {
    name: "Converse Chuck Taylor Black",
    price: "KES 1,300", rawPrice: 1300,
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    image: "images/converse-chunk-tylor-black.jpg",
    gender: "Unisex", category: "Kicks"
  },
  {
    name: "Converse Chuck Taylor White",
    price: "KES 1,300", rawPrice: 1300,
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    image: "images/converse-chunk-tylor-white.jpg",
    gender: "Unisex", category: "Kicks"
  },
  {
    name: "Black & White 3-Piece Pajamas",
    price: "KES 1,700", rawPrice: 1700,
    image: "images/Black-and-white-3piece-pajamas.jpg",
    gender: "Women", category: "threads",
    sizes: ["S", "M", "L", "XL"]
  },
  {
    name: "Brown & White 3-Piece Pajamas",
    price: "KES 2,500", rawPrice: 2500,
    image: "images/brown-and-white-3piece-pajamas.jpg",
    gender: "Women", category: "threads",
    sizes: ["S", "M", "L", "XL"], new: true
  },
  {
    name: "Red Gemstone Jewelry Set with Watch",
    price: "KES 2,500", rawPrice: 2500,
    image: "images/red-gemstone-set.jpg",
    gender: "Women", category: "jewelry",
    sizes: ["Standard"]
  },
  {
    name: "Green Heart Chandelier Jewelry Set with Watch",
    price: "KES 2,500", rawPrice: 2500,
    image: "images/green-heart-chandelier.jpg",
    gender: "Women", category: "jewelry",
    sizes: ["Standard"], new: true
  }
];
