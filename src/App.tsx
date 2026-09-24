/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { PRODUCTS, getProductById } from './config/products';
import { CartItem } from './types/product';
import { OrderRecord } from './types/order';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { WhyChooseUs } from './components/WhyChooseUs';
import { OrderForm } from './components/OrderForm';
import { Testimonials } from './components/Testimonials';
import { FacebookCTA } from './components/FacebookCTA';
import { Footer } from './components/Footer';
import { MobileOrderBar } from './components/MobileOrderBar';
import { CartDrawer } from './components/CartDrawer';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { CustomerOrderTrackModal } from './components/CustomerOrderTrackModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { StructuredData } from './components/StructuredData';

export default function App() {
  // Start with an empty cart; customers choose products explicitly.
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (!Array.isArray(PRODUCTS) || PRODUCTS.length === 0) {
      return [];
    }
    return PRODUCTS.map((product) => ({ product, quantity: 0 }));
  });

  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);
  const [orderModalSnapshot, setOrderModalSnapshot] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Public Customer Order Tracking Modal
  const [isCustomerTrackOpen, setIsCustomerTrackOpen] = useState<boolean>(false);
  const [customerTrackInitialId, setCustomerTrackInitialId] = useState<string>('FR-73004143');

  // Update item quantity
  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const existing = safePrev.find((item) => item?.product?.id === productId);
      if (existing) {
        return safePrev.map((item) =>
          item?.product?.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
        );
      }
      const product = getProductById(productId);
      if (product) {
        return [...safePrev, { product, quantity: Math.max(0, quantity) }];
      }
      return safePrev;
    });
  };

  // Remove item
  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) =>
      (Array.isArray(prev) ? prev : []).map((item) =>
        item?.product?.id === productId ? { ...item, quantity: 0 } : item
      )
    );
  };

  // Instant order click from product card: ensure at least 1 quantity
  const handleInstantOrder = (productId: string) => {
    setCartItems((prev) => {
      return (Array.isArray(prev) ? prev : []).map((item) => {
        if (item?.product?.id === productId) {
          return { ...item, quantity: item.quantity > 0 ? item.quantity : 1 };
        }
        return item;
      });
    });
  };

  // Order submission success
  const handleOrderSuccess = (order: OrderRecord) => {
    // Save snapshot of ordered items before clearing cart for the success modal
    setOrderModalSnapshot(
      Array.isArray(cartItems)
        ? cartItems.filter((item) => item && item.quantity > 0)
        : []
    );
    setConfirmedOrder(order);

    // CRITICAL: Empty the cart immediately upon order placement
    setCartItems((PRODUCTS || []).map((p) => ({ product: p, quantity: 0 })));
  };

  // Reset cart after order
  const handleResetOrder = () => {
    setCartItems((PRODUCTS || []).map((p) => ({ product: p, quantity: 0 })));
    setConfirmedOrder(null);
  };

  // Derived totals
  const totalCartItemsCount = useMemo(() => {
    return (cartItems || []).reduce((acc, item) => acc + (item?.quantity || 0), 0);
  }, [cartItems]);

  const totalCartAmount = useMemo(() => {
    return (cartItems || []).reduce(
      (acc, item) => acc + (item?.product?.price || 0) * (item?.quantity || 0),
      0
    );
  }, [cartItems]);

  // Admin is intentionally isolated from the public storefront.
  if (window.location.pathname === '/admin') {
    return (
      <AdminPortalModal
        isOpen={true}
        fullScreen={true}
        onClose={() => window.location.assign('/')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFDFB] text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      {/* Schema.org Structured Data */}
      <StructuredData />

      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* Sticky Responsive Header */}
      <Header
        totalCartItemsCount={totalCartItemsCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCustomerTracking={() => {
          setCustomerTrackInitialId('FR-73004143');
          setIsCustomerTrackOpen(true);
        }}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero />

        {/* Product Showcase */}
        <ProductGrid
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onInstantOrder={handleInstantOrder}
        />

        {/* Why Choose Us */}
        <WhyChooseUs />

        {/* Customer Reviews */}
        <Testimonials />

        {/* Social Proof CTA */}
        <FacebookCTA />
      </main>

      {/* Footer */}
      <Footer
        onOpenCustomerTracking={() => {
          setCustomerTrackInitialId('FR-73004143');
          setIsCustomerTrackOpen(true);
        }}
      />

      {/* Mobile Sticky Order Bar */}
      <MobileOrderBar
        totalItemsCount={totalCartItemsCount}
        totalAmount={totalCartAmount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        items={cartItems}
        totalAmount={totalCartAmount}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <OrderForm
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOrderSuccess={(order) => {
          setIsCheckoutOpen(false);
          handleOrderSuccess(order);
        }}
      />

      {/* Order Confirmation Modal */}
      {confirmedOrder && (
        <OrderSuccessModal
          order={confirmedOrder}
          cartItemsSnapshot={orderModalSnapshot}
          onResetOrder={handleResetOrder}
          onClose={() => setConfirmedOrder(null)}
          onTrackOrder={(orderId) => {
            setCustomerTrackInitialId(orderId);
            setIsCustomerTrackOpen(true);
          }}
        />
      )}

      {/* Safe Public Customer Order Tracking Modal (No Admin Controls) */}
      <CustomerOrderTrackModal
        isOpen={isCustomerTrackOpen}
        onClose={() => setIsCustomerTrackOpen(false)}
        initialOrderId={customerTrackInitialId}
      />

    </div>
  );
}
