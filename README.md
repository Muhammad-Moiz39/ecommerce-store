# SHOP.CO — Clean Vanilla E-commerce Project

A merged, responsive storefront built with **HTML, CSS, JavaScript, and JSON**. No React, build step, or CSS framework is required.

## Project structure

- `index.html` — home page
- `category.html` — product catalog, category/price/size filters, sorting, pagination and search
- `product.html?id=1` — product detail page with color, size, quantity and add-to-cart controls
- `cart.html` — persistent cart, quantity controls, remove item, promo codes and totals
- `styles.css` — shared responsive styles and reusable component classes
- `app.js` — shared storefront behavior
- `data.json` — single source of truth for product data
- `assets/` — deduplicated image assets

## Run locally

Because product data is loaded using `fetch()`, do **not** open the HTML files directly using `file://`.

1. Open this folder in VS Code.
2. Install/use the **Live Server** extension.
3. Right-click `index.html` and choose **Open with Live Server**.

You can also run a local static server from this folder with Python:

```bash
python -m http.server 5500
```

Then visit `http://localhost:5500`.

## Customize products

Edit `data.json`. Each product supports this format:

```json
{
  "id": 1,
  "name": "Product name",
  "category": "T-shirts",
  "price": 145,
  "oldPrice": 160,
  "rating": 4.5,
  "image": "assets/gradient.png",
  "description": "Short product description.",
  "colors": ["#111111", "#FFFFFF"],
  "sizes": ["S", "M", "L", "XL"]
}
```

Add an image to `assets/` and set its relative path in `image`. Products on the home page, catalog, related-products area, and product details are generated from this JSON file.

## Features

- Shared navigation, announcement banner, newsletter area, and reusable product cards
- Responsive layout for desktop, tablet and mobile
- Product catalog with category, size, price range and sort controls
- Search by product name or category
- Product detail page with color/size selection and quantity
- Cart saved in `localStorage`, including quantities and variants
- Promo codes `SHOP20` and `SHOP30`
- Cart subtotal, discount, delivery fee and grand total
- Demo checkout notice (real payments/orders require a backend and payment provider)

**Note:** This is a front-end demo store. Cart data is stored in the current browser; no real payment, user account, inventory API or order submission is connected.
