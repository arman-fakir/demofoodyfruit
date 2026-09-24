import React from 'react';
import { BUSINESS_CONFIG } from '../config/business';
import { PRODUCTS } from '../config/products';

export const StructuredData: React.FC = () => {
  // 1. FoodEstablishment / LocalBusiness Schema
  const businessSchema = {
    '@context': 'https://schema.org',
    '@type': 'FoodEstablishment',
    name: BUSINESS_CONFIG.brandName,
    description: BUSINESS_CONFIG.seo.metaDescription,
    telephone: BUSINESS_CONFIG.phone,
    url: typeof window !== 'undefined' ? window.location.origin : BUSINESS_CONFIG.seo.canonicalUrl,
    currenciesAccepted: BUSINESS_CONFIG.currencyCode,
    paymentAccepted: 'Cash on Delivery',
    servesCuisine: 'Fresh Fruit Juice, Detox Drinks',
  };

  // 2. Product list Schema
  const productSchemas = (PRODUCTS || []).map((product) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${product.title} (${product.englishTitle})`,
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: BUSINESS_CONFIG.brandName,
    },
    offers: {
      '@type': 'Offer',
      price: (product.price || 0).toString(),
      priceCurrency: BUSINESS_CONFIG.currencyCode,
      availability: product.availability
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
      />
      {(productSchemas || []).map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
};
