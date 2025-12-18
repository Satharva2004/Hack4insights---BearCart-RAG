// Data cleaning utilities for handling messy JSON data

// Safe number parser with fallback
export const safeNumber = (value, fallback = 0) => {
    if (value === null || value === undefined || value === '') return fallback;
    const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
    return isNaN(parsed) ? fallback : parsed;
  };
  
  // Safe date parser
  export const safeDate = (value) => {
    if (!value) return null;
    const date = new Date(String(value));
    return isNaN(date.getTime()) ? null : date;
  };
  
  // Clean orders data
  export const cleanOrdersData = (rawData) => {
    if (!Array.isArray(rawData)) return [];
    
    return rawData
      .filter(item => item && typeof item === 'object')
      .map(item => {
        const obj = item;
        const createdAt = safeDate(obj.created_at);
        if (!createdAt) return null;
        
        return {
          order_id: safeNumber(obj.order_id),
          created_at: createdAt,
          website_session_id: safeNumber(obj.website_session_id),
          user_id: safeNumber(obj.user_id),
          primary_product_id: safeNumber(obj.primary_product_id),
          items_purchased: safeNumber(obj.items_purchased),
          price_usd: safeNumber(obj.price_usd),
          cogs_usd: safeNumber(obj.cogs_usd),
        };
      })
      .filter((item) => item !== null);
  };
  
  // Clean order items data
  export const cleanOrderItemsData = (rawData) => {
    if (!Array.isArray(rawData)) return [];
    
    return rawData
      .filter(item => item && typeof item === 'object')
      .map(item => {
        const obj = item;
        const createdAt = safeDate(obj.created_at);
        if (!createdAt) return null;
        
        return {
          order_item_id: safeNumber(obj.order_item_id),
          created_at: createdAt,
          order_id: safeNumber(obj.order_id),
          product_id: safeNumber(obj.product_id),
          is_primary_item: safeNumber(obj.is_primary_item) === 1,
          price_usd: safeNumber(obj.price_usd),
          cogs_usd: safeNumber(obj.cogs_usd),
        };
      })
      .filter((item) => item !== null);
  };
  
  // Clean refunds data
  export const cleanRefundsData = (rawData) => {
    if (!Array.isArray(rawData)) return [];
    
    return rawData
      .filter(item => item && typeof item === 'object')
      .map(item => {
        const obj = item;
        const createdAt = safeDate(obj.created_at);
        if (!createdAt) return null;
        
        return {
          order_item_refund_id: safeNumber(obj.order_item_refund_id),
          created_at: createdAt,
          order_item_id: safeNumber(obj.order_item_id),
          order_id: safeNumber(obj.order_id),
          refund_amount_usd: safeNumber(obj.refund_amount_usd),
        };
      })
      .filter((item) => item !== null);
  };
  
  // Clean products data
  export const cleanProductsData = (rawData) => {
    if (!Array.isArray(rawData)) return [];
    
    return rawData
      .filter(item => item && typeof item === 'object')
      .map(item => {
        const obj = item;
        const createdAt = safeDate(obj.created_at);
        if (!createdAt) return null;
        
        return {
          product_id: safeNumber(obj.product_id),
          created_at: createdAt,
          product_name: String(obj.product_name || 'Unknown Product'),
        };
      })
      .filter((item) => item !== null);
  };
  
  // Aggregate revenue by month
  export const aggregateRevenueByMonth = (orders) => {
    const grouped = new Map();
    
    orders.forEach(order => {
      const monthKey = `${order.created_at.getFullYear()}-${String(order.created_at.getMonth() + 1).padStart(2, '0')}`;
      const existing = grouped.get(monthKey) || { revenue: 0, orders: 0 };
      grouped.set(monthKey, {
        revenue: existing.revenue + order.price_usd,
        orders: existing.orders + 1,
      });
    });
    
    return Array.from(grouped.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };
  
  // Aggregate revenue by year
  export const aggregateRevenueByYear = (orders) => {
    const grouped = new Map();
    
    orders.forEach(order => {
      const year = order.created_at.getFullYear();
      const existing = grouped.get(year) || { revenue: 0, orders: 0 };
      grouped.set(year, {
        revenue: existing.revenue + order.price_usd,
        orders: existing.orders + 1,
      });
    });
    
    return Array.from(grouped.entries())
      .map(([year, data]) => ({ year, ...data }))
      .sort((a, b) => a.year - b.year);
  };
  
  // Calculate refund rate
  export const calculateRefundRate = (orders, refunds) => {
    if (orders.length === 0) return 0;
    return (refunds.length / orders.length) * 100;
  };
  
  // Calculate total revenue
  export const calculateTotalRevenue = (orders) => {
    return orders.reduce((sum, order) => sum + order.price_usd, 0);
  };
  
  // Calculate total refunds
  export const calculateTotalRefunds = (refunds) => {
    return refunds.reduce((sum, refund) => sum + refund.refund_amount_usd, 0);
  };
  
  // Calculate AOV (Average Order Value)
  export const calculateAOV = (orders) => {
    if (orders.length === 0) return 0;
    return calculateTotalRevenue(orders) / orders.length;
  };
  
  // Get refunds by product
  export const getRefundsByProduct = (refunds, orderItems, products) => {
    const refundOrderItemIds = new Set(refunds.map(r => r.order_item_id));
    
    const productRefunds = new Map();
    
    orderItems.forEach(item => {
      if (refundOrderItemIds.has(item.order_item_id)) {
        const refund = refunds.find(r => r.order_item_id === item.order_item_id);
        const existing = productRefunds.get(item.product_id) || { count: 0, amount: 0 };
        productRefunds.set(item.product_id, {
          count: existing.count + 1,
          amount: existing.amount + (refund?.refund_amount_usd || 0),
        });
      }
    });
    
    return Array.from(productRefunds.entries()).map(([productId, data]) => {
      const product = products.find(p => p.product_id === productId);
      return {
        product: product?.product_name || `Product ${productId}`,
        refunds: data.count,
        amount: data.amount,
      };
    });
  };
  
  // Get orders by product
  export const getOrdersByProduct = (orderItems, products) => {
    const productOrders = new Map();
    
    orderItems.filter(item => item.is_primary_item).forEach(item => {
      const existing = productOrders.get(item.product_id) || { count: 0, revenue: 0 };
      productOrders.set(item.product_id, {
        count: existing.count + 1,
        revenue: existing.revenue + item.price_usd,
      });
    });
    
    return Array.from(productOrders.entries()).map(([productId, data]) => {
      const product = products.find(p => p.product_id === productId);
      return {
        product: product?.product_name || `Product ${productId}`,
        orders: data.count,
        revenue: data.revenue,
      };
    });
  };
  
  // Format currency
  export const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Format percentage
  export const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };
  
  // Format large numbers
  export const formatNumber = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };