import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DB_FILE = path.resolve(process.cwd(), 'orders-db.json');
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const ADMIN_SESSION_COOKIE = 'foody_rahat_admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const LOGIN_WINDOW_MS = 1000 * 60 * 15;
const MAX_LOGIN_ATTEMPTS = 5;
const adminSessions = new Map<string, number>();
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

// Seed sample orders if database file doesn't exist
const INITIAL_ORDERS = [
  {
    id: 'FR-73004143',
    customerName: 'মোঃ আরমান',
    phone: '01571509532',
    address: 'মিরপুর-১০, রোড ৪, ব্লক-সি, ঢাকা',
    deliveryArea: 'inside_dhaka',
    deliveryAreaLabel: 'ঢাকার ভেতরে',
    items: [
      {
        productId: 'dragon-fruit-juice',
        productTitle: 'ফ্রেশ ড্রাগন ফ্রুট জুস',
        englishTitle: 'Fresh Dragon Fruit Juice',
        unitPrice: 150,
        quantity: 2,
        subtotal: 300,
      },
      {
        productId: 'orange-malta-juice',
        productTitle: 'ফ্রেশ অরেঞ্জ / মাল্টা জুস',
        englishTitle: 'Fresh Orange Malta Juice',
        unitPrice: 130,
        quantity: 1,
        subtotal: 130,
      },
    ],
    subtotal: 430,
    deliveryCharge: 60,
    grandTotal: 490,
    specialNotes: 'অফিসের ঠিকানায় দুপুর ১২টার মধ্যে ডেলিভারি দিলে ভালো হয়।',
    status: 'CONFIRMED',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'FR-01025469',
    customerName: 'তানভীর আহমেদ',
    phone: '01711223344',
    address: 'উত্তরা সেক্টর ৭, রোড ১৩, ঢাকা',
    deliveryArea: 'inside_dhaka',
    deliveryAreaLabel: 'ঢাকার ভেতরে',
    items: [
      {
        productId: 'orange-malta-juice',
        productTitle: 'ফ্রেশ অরেঞ্জ / মাল্টা জুস',
        englishTitle: 'Fresh Orange Malta Juice',
        unitPrice: 130,
        quantity: 2,
        subtotal: 260,
      },
    ],
    subtotal: 260,
    deliveryCharge: 60,
    grandTotal: 320,
    specialNotes: 'প্যাকিং ভালো করবেন যেন জুস পড়ে না যায়।',
    status: 'PROCESSING',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

function readServerOrders(): any[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading orders-db.json:', err);
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_ORDERS, null, 2), 'utf-8');
  return INITIAL_ORDERS;
}

function writeServerOrders(orders: any[]): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing orders-db.json:', err);
  }
}

// Ensure DB file exists
readServerOrders();

app.use(express.json());

function parseCookies(cookieHeader = ''): Record<string, string> {
  return cookieHeader.split(';').reduce<Record<string, string>>((cookies, part) => {
    const separatorIndex = part.indexOf('=');
    if (separatorIndex > 0) {
      cookies[part.slice(0, separatorIndex).trim()] = decodeURIComponent(part.slice(separatorIndex + 1).trim());
    }
    return cookies;
  }, {});
}

function verifyAdminPassword(password: string): boolean {
  if (!ADMIN_PASSWORD_HASH) return false;
  const [algorithm, salt, expectedHash] = ADMIN_PASSWORD_HASH.split(':');
  if (algorithm !== 'scrypt' || !salt || !expectedHash) return false;
  const derivedHash = crypto.scryptSync(password, salt, 64).toString('hex');
  const derivedBuffer = Buffer.from(derivedHash, 'hex');
  const expectedBuffer = Buffer.from(expectedHash, 'hex');
  return expectedBuffer.length === derivedBuffer.length && crypto.timingSafeEqual(derivedBuffer, expectedBuffer);
}

function getSessionToken(req: express.Request): string | undefined {
  return parseCookies(req.headers.cookie)[ADMIN_SESSION_COOKIE];
}

function setAdminSessionCookie(res: express.Response, token: string): void {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${ADMIN_SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_MS / 1000}${secure}`);
}

function clearAdminSessionCookie(res: express.Response): void {
  res.setHeader('Set-Cookie', `${ADMIN_SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`);
}

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), brand: 'Foody Rahat' });
});

// 2. Public Tracking endpoint: returns only specific order with privacy masking
app.get('/api/orders/track', (req, res) => {
  const query = (req.query.orderId as string || req.query.id as string || req.query.phone as string || '').trim();
  if (!query) {
    return res.status(400).json({ success: false, message: 'অনুগ্রহ করে অর্ডার আইডি অথবা ফোন নম্বর দিন' });
  }

  const orders = readServerOrders();
  const cleanSearch = query.toLowerCase().replace(/[^a-z0-9]/g, '');

  const matched = orders.find((o) => {
    const cleanId = (o.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanPhone = (o.phone || '').replace(/[^0-9]/g, '');
    return cleanId === cleanSearch || cleanId.includes(cleanSearch) || (cleanPhone && cleanPhone === cleanSearch);
  });

  if (!matched) {
    return res.status(404).json({ success: false, message: 'এই আইডির কোনো অর্ডার খুঁজে পাওয়া যায়নি।' });
  }

  const rawPhone = matched.phone || '';
  const maskedPhone =
    rawPhone.length >= 8
      ? `${rawPhone.slice(0, 3)}****${rawPhone.slice(-4)}`
      : rawPhone;

  return res.json({
    success: true,
    order: {
      id: matched.id,
      customerName: matched.customerName,
      maskedPhone,
      deliveryAreaLabel: matched.deliveryAreaLabel || 'ঢাকার ভেতরে',
      items: (matched.items || []).map((i: any) => ({
        productTitle: i.productTitle,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        subtotal: i.subtotal,
      })),
      subtotal: matched.subtotal,
      deliveryCharge: matched.deliveryCharge,
      grandTotal: matched.grandTotal,
      status: matched.status,
      createdAt: matched.createdAt,
    },
  });
});

// 3. Public: Submit New Order with Server-Side Validation and Persistence
app.post('/api/orders', (req, res) => {
  try {
    const { formData, items } = req.body;
    if (!formData || !formData.customerName || !formData.phone || !formData.address) {
      return res.status(400).json({ success: false, message: 'সকল প্রয়োজনীয় তথ্য প্রদান করুন' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'কমপক্ষে একটি ফ্রেশ জুস নির্বাচন করুন' });
    }

    // Authoritative Server-side Pricing
    const priceMap: Record<string, { title: string; price: number; en: string }> = {
      'dragon-fruit-juice': { title: 'ফ্রেশ ড্রাগন ফ্রুট জুস', price: 150, en: 'Fresh Dragon Fruit Juice' },
      'orange-malta-juice': { title: 'ফ্রেশ অরেঞ্জ / মাল্টা জুস', price: 130, en: 'Fresh Orange Malta Juice' },
      'mango-juice': { title: 'প্রিমিয়াম ম্যাঙ্গো জুস', price: 140, en: 'Premium Mango Juice' },
      'watermelon-juice': { title: 'ঠান্ডা তরমুজের জুস', price: 100, en: 'Chilled Watermelon Juice' },
      'pineapple-juice': { title: 'ফ্রেশ আনারস জুস', price: 120, en: 'Fresh Pineapple Juice' },
      'pomegranate-juice': { title: 'ন্যাচারাল বেদানা / ডালিম জুস', price: 220, en: 'Natural Pomegranate Juice' },
      'papaya-juice': { title: 'ফ্রেশ পেঁপে জুস', price: 110, en: 'Fresh Papaya Juice' },
      'green-apple-juice': { title: 'গ্রিন অ্যাপল ডিটক্স জুস', price: 180, en: 'Green Apple Detox Juice' },
    };

    let subtotal = 0;
    const orderItems = [];

    for (const it of items) {
      const p = priceMap[it.productId];
      const qty = Number(it.quantity) || 0;
      if (p && qty > 0) {
        const itemSubtotal = p.price * qty;
        subtotal += itemSubtotal;
        orderItems.push({
          productId: it.productId,
          productTitle: p.title,
          englishTitle: p.en,
          unitPrice: p.price,
          quantity: qty,
          subtotal: itemSubtotal,
        });
      }
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'সঠিক পণ্য নির্বাচন করুন' });
    }

    const deliveryCharge = formData.deliveryArea === 'outside_dhaka' ? 120 : 60;
    const grandTotal = subtotal + deliveryCharge;
    const orderId = `FR-${Date.now().toString().slice(-4)}${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      id: orderId,
      customerName: formData.customerName.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      deliveryArea: formData.deliveryArea,
      deliveryAreaLabel: formData.deliveryArea === 'outside_dhaka' ? 'ঢাকার বাইরে' : 'ঢাকার ভেতরে',
      items: orderItems,
      subtotal,
      deliveryCharge,
      grandTotal,
      specialNotes: formData.specialNotes?.trim() || '',
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };

    const existingOrders = readServerOrders();
    existingOrders.unshift(newOrder);
    writeServerOrders(existingOrders);

    return res.json({
      success: true,
      orderId,
      message: 'অর্ডার সফলভাবে ডাটাবেজে গ্রহণ করা হয়েছে',
      order: newOrder,
    });
  } catch (err) {
    console.error('Order processing error:', err);
    return res.status(500).json({ success: false, message: 'সার্ভারে অভ্যন্তরীণ ত্রুটি হয়েছে' });
  }
});

// 4. Admin authentication: password hash, rate limiting, and httpOnly session cookie.
app.post('/api/admin/login', (req, res) => {
  if (!ADMIN_PASSWORD_HASH) {
    console.error('ADMIN_PASSWORD_HASH is not configured. Admin login is disabled.');
    return res.status(503).json({ success: false, message: 'অ্যাডমিন লগইন এখনও কনফিগার করা হয়নি।' });
  }

  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const attempt = loginAttempts.get(clientIp);
  if (attempt && attempt.resetAt > now && attempt.count >= MAX_LOGIN_ATTEMPTS) {
    return res.status(429).json({ success: false, message: 'অনেকবার ভুল চেষ্টা হয়েছে। ১৫ মিনিট পরে আবার চেষ্টা করুন।' });
  }

  const { pin } = req.body || {};
  if (typeof pin === 'string' && verifyAdminPassword(pin)) {
    loginAttempts.delete(clientIp);
    const sessionToken = crypto.randomBytes(32).toString('hex');
    adminSessions.set(sessionToken, now + SESSION_TTL_MS);
    setAdminSessionCookie(res, sessionToken);
    return res.json({ success: true, message: 'মার্চেন্ট অ্যাডমিন লগইন সফল হয়েছে' });
  }

  loginAttempts.set(clientIp, {
    count: attempt && attempt.resetAt > now ? attempt.count + 1 : 1,
    resetAt: now + LOGIN_WINDOW_MS,
  });
  return res.status(401).json({ success: false, message: 'ভুল সিকিউরিটি পিন (PIN)' });
});

app.post('/api/admin/logout', (req, res) => {
  const token = getSessionToken(req);
  if (token) adminSessions.delete(token);
  clearAdminSessionCookie(res);
  return res.json({ success: true });
});

// Admin authorization is enforced by a server-only, expiring session.
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = getSessionToken(req);
  const expiresAt = token ? adminSessions.get(token) : undefined;
  if (token && expiresAt && expiresAt > Date.now()) {
    return next();
  }
  if (token) adminSessions.delete(token);
  return res.status(403).json({ success: false, message: 'অননুমোদিত এক্সেস! অ্যাডমিন লগইন প্রয়োজন।' });
};

app.get('/api/admin/session', requireAdmin, (_req, res) => {
  return res.json({ success: true });
});

// 5. Admin: Get all orders & metrics
app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const orders = readServerOrders();
  res.json({ success: true, orders });
});

// 5b. Admin / Google Sheets Export CSV Endpoint
app.get('/api/admin/orders/export-csv', requireAdmin, (req, res) => {
  try {
    const { status } = req.query;
    let orders = readServerOrders();
    if (status && typeof status === 'string' && status !== 'ALL') {
      orders = orders.filter((o) => o.status === status);
    }

    const headers = [
      'অর্ডার আইডি',
      'তারিখ ও সময়',
      'গ্রাহকের নাম',
      'মোবাইল নম্বর',
      'ডেলিভারি ঠিকানা',
      'ডেলিভারি এলাকা',
      'অর্ডারকৃত পণ্যসমূহ',
      'মোট বোতল',
      'পণ্য বিল (৳)',
      'ডেলিভারি চার্জ (৳)',
      'সর্বমোট বিল (৳)',
      'অর্ডার স্ট্যাটাস',
      'গ্রাহকের বিশেষ নোট',
    ];

    const escapeCell = (val: any) => {
      if (val === undefined || val === null) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    };

    const rows = orders.map((o: any) => {
      const itemsStr = (o.items || []).map((i: any) => `${i.productTitle} x ${i.quantity}`).join(' | ');
      const bottles = (o.items || []).reduce((sum: number, i: any) => sum + (i.quantity || 0), 0);
      return [
        escapeCell(o.id),
        escapeCell(o.createdAt),
        escapeCell(o.customerName),
        escapeCell(o.phone),
        escapeCell(o.address),
        escapeCell(o.deliveryAreaLabel),
        escapeCell(itemsStr),
        escapeCell(bottles),
        escapeCell(o.subtotal || 0),
        escapeCell(o.deliveryCharge || 0),
        escapeCell(o.grandTotal || 0),
        escapeCell(o.status),
        escapeCell(o.specialNotes || ''),
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.map((h) => `"${h}"`).join(','), ...rows].join('\r\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="foody-rahat-orders-${Date.now()}.csv"`);
    return res.send(csvContent);
  } catch (err) {
    console.error('CSV export error:', err);
    return res.status(500).send('Error generating Google Sheets CSV');
  }
});

// 6. Admin: Update order status
app.patch('/api/admin/orders/:id/status', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const orders = readServerOrders();
  const order = orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি' });
  }

  order.status = status;
  writeServerOrders(orders);
  return res.json({ success: true, message: 'স্ট্যাটাস আপডেট সফল হয়েছে' });
});

// 7. Admin: Delete order
app.delete('/api/admin/orders/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const orders = readServerOrders();
  const filtered = orders.filter((o) => o.id !== id);
  writeServerOrders(filtered);
  return res.json({ success: true, message: 'অর্ডার মুছে ফেলা হয়েছে' });
});

// ----------------------------------------------------
// FRONTEND INTEGRATION: Mount Vite in Dev or Serve Static Dist in Prod
// ----------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    // Bind to all interfaces, but show a browser-valid local URL.
    console.log(`[Foody Rahat Full-Stack Server] running on http://localhost:${PORT}`);
  });
}

startServer();
