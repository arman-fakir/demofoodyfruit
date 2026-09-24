# Foody Rahat — Fresh Juice Store

A Bengali, mobile-first fresh juice storefront with cart, full-screen checkout, order tracking, and a protected admin dashboard.

## Features

- Product selection with quantity controls and cart drawer
- Responsive, full-screen checkout (Cash on Delivery and WhatsApp order option)
- Server-side order creation and price calculation
- Customer order tracking
- Separate admin dashboard at `/admin`
- Admin order search, status update, delete, courier note, WhatsApp message, and CSV export
- Protected admin sessions: server-side, expiring `httpOnly` cookies and login rate limiting
- Central business settings and product catalog

## Local setup

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open the store at [http://localhost:3000](http://localhost:3000).

Useful commands:

```bash
npm run lint
npm run build
```

## Customer order flow

1. Select one or more products from the product grid.
2. Open **কার্ট** from the header or mobile bar.
3. Adjust quantities or remove items in the cart drawer.
4. Select **চেকআউটে যান** to open the full-screen checkout.
5. Enter delivery details and confirm the order.

## Admin setup

The admin page is intentionally separate from the public store:

```text
http://localhost:3000/admin
```

Create a `.env` file in the project root with an `ADMIN_PASSWORD_HASH`. Generate a salted hash for your password:

```powershell
node -e "const c=require('crypto');const salt=c.randomBytes(16).toString('hex');const password=process.argv[1];console.log('scrypt:'+salt+':'+c.scryptSync(password,salt,64).toString('hex'))" "YOUR_STRONG_PASSWORD"
```

Then add the generated value to `.env`:

```env
ADMIN_PASSWORD_HASH="scrypt:YOUR_GENERATED_SALT:YOUR_GENERATED_HASH"
```

Restart `npm run dev` after changing `.env`. Never commit `.env`; it is already ignored by Git.

## Data storage

Local development currently stores orders in `orders-db.json`. This is suitable for one local server only. For a deployed, multi-instance production site, migrate order storage and admin sessions to MongoDB/Redis.

## Deployment

This project has both a frontend and Express API server. Deploy the backend where Node/Express is supported (for example Render or Railway). A static-only Netlify deployment will not run `server.ts` or the admin/order APIs without converting them to serverless functions.

You can use platform-provided URLs without buying a custom domain.

## Main files

```text
server.ts                         # Express API, orders, and admin session security
src/App.tsx                       # Storefront, cart, and checkout state
src/components/CartDrawer.tsx     # Side cart UI
src/components/OrderForm.tsx      # Full-screen checkout UI
src/components/AdminPortalModal.tsx # Admin dashboard UI
src/config/business.ts            # Brand/contact/delivery configuration
src/config/products.ts            # Product catalog and prices
orders-db.json                    # Local order data
```

## Customization

- Update phone, WhatsApp, delivery charge, and social links in `src/config/business.ts`.
- Update product name, price, image, and availability in `src/config/products.ts`.
- Replace the brand image in `src/assets/images/` and update its import in `src/config/business.ts`.

## License

Apache-2.0
