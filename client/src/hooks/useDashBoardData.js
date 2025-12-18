// import { useState, useEffect, useMemo } from 'react';
// import {
//   cleanOrdersData,
//   cleanOrderItemsData,
//   cleanRefundsData,
//   cleanProductsData,
//   cleanSessionsData,
//   cleanPageviewsData,
//   aggregateRevenueByMonth,
//   aggregateRevenueByYear,
//   calculateTotalRevenue,
//   calculateTotalRefunds,
//   calculateRefundRate,
//   calculateAOV,
//   getRefundsByProduct,
//   getOrdersByProduct,
//   cleanSessionsData,
// } from '@/utils/dataCleaners';

// // Import JSON data
// import ordersRaw from '../../public/data/orders.json';
// import orderItemsRaw from '../../public/data/order_items.json';
// import refundsRaw from '../../public/data/order_item_refunds.json';
// import productsRaw from '../../public/data/products.json';
// import sessionsRaw from '../../public/data/website_sessions.json';
// import pageviewsRaw from '../../public/data/website_pageviews.json';

// const useDashboardData = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Clean and process data
//   const processedData = useMemo(() => {
//     try {
//       const orders = cleanOrdersData(ordersRaw);
//       const orderItems = cleanOrderItemsData(orderItemsRaw);
//       const refunds = cleanRefundsData(refundsRaw);
//       const products = cleanProductsData(productsRaw);
//       const sessions = cleanSessionsData(sessionsRaw);
//       const pageviews = cleanPageviewsData(pageviewsRaw);

//       return { orders, orderItems, refunds, products, sessions, pageviews };
//     } catch (err) {
//       console.error('Error processing data:', err);
//       return { orders: [], orderItems: [], refunds: [], products: [], sessions: [], pageviews: [] };
//     }
//   }, []);

//   const { orders, orderItems, refunds, products, sessions, pageviews } = processedData;

//   // Calculate metrics
//   const metrics = useMemo(() => {
//     const totalRevenue = calculateTotalRevenue(orders);
//     const totalRefunds = calculateTotalRefunds(refunds);
    
//     return {
//       totalOrders: orders.length,
//       totalRevenue,
//       totalRefunds,
//       refundRate: calculateRefundRate(orders, refunds),
//       aov: calculateAOV(orders),
//       netRevenue: totalRevenue - totalRefunds,
//     };
//   }, [orders, refunds]);

//   // Aggregate data for charts
//   const revenueByMonth = useMemo(() => aggregateRevenueByMonth(orders), [orders]);
//   const revenueByYear = useMemo(() => aggregateRevenueByYear(orders), [orders]);
//   const refundsByProduct = useMemo(() => getRefundsByProduct(refunds, orderItems, products), [refunds, orderItems, products]);
//   const ordersByProduct = useMemo(() => getOrdersByProduct(orderItems, products), [orderItems, products]);

//   useEffect(() => {
//     // Simulate loading state
//     const timer = setTimeout(() => {
//       if (orders.length === 0) {
//         setError('Failed to load data');
//       }
//       setIsLoading(false);
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [orders.length]);

//   return {
//     orders,
//     orderItems,
//     refunds,
//     products,
//     sessions,
//     pageviews,
//     metrics,
//     revenueByMonth,
//     revenueByYear,
//     refundsByProduct,
//     ordersByProduct,
//     isLoading,
//     error,
//   };
// };

// export default useDashboardData;


import { useState, useEffect, useMemo } from 'react';
import {
  cleanOrdersData,
  cleanOrderItemsData,
  cleanRefundsData,
  cleanProductsData,
  cleanSessionsData,
  cleanPageviewsData,
  aggregateRevenueByMonth,
  aggregateRevenueByYear,
  calculateTotalRevenue,
  calculateTotalRefunds,
  calculateRefundRate,
  calculateAOV,
  getRefundsByProduct,
  getOrdersByProduct,
} from '@/utils/dataCleaners';

// Import JSON data
import ordersRaw from '../../public/data/orders.json';
import orderItemsRaw from '../../public/data/order_items.json';
import refundsRaw from '../../public/data/order_item_refunds.json';
import productsRaw from '../../public/data/products.json';
import sessionsRaw from '../../public/data/website_sessions.json';
import pageviewsRaw from '../../public/data/website_pageviews.json';

const useDashboardData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clean and process data with proper error handling
  const processedData = useMemo(() => {
    try {
      console.log('Processing data...');
      
      const orders = cleanOrdersData(ordersRaw);
      const orderItems = cleanOrderItemsData(orderItemsRaw);
      const refunds = cleanRefundsData(refundsRaw);
      const products = cleanProductsData(productsRaw);
      const sessions = cleanSessionsData(sessionsRaw);
      const pageviews = cleanPageviewsData(pageviewsRaw);

      console.log('Data processed successfully:', {
        orders: orders.length,
        orderItems: orderItems.length,
        refunds: refunds.length,
        products: products.length,
        sessions: sessions.length,
        pageviews: pageviews.length
      });

      return { orders, orderItems, refunds, products, sessions, pageviews };
    } catch (err) {
      console.error('Error processing data:', err);
      setError(err.message || 'Failed to process data');
      return { 
        orders: [], 
        orderItems: [], 
        refunds: [], 
        products: [], 
        sessions: [], 
        pageviews: [] 
      };
    }
  }, []); // Empty dependency array since raw data is static

  const { orders, orderItems, refunds, products, sessions, pageviews } = processedData;

  // Calculate metrics
  const metrics = useMemo(() => {
    try {
      const totalRevenue = calculateTotalRevenue(orders);
      const totalRefunds = calculateTotalRefunds(refunds);
      const refundRate = calculateRefundRate(orders, refunds);
      const aov = calculateAOV(orders);
      
      return {
        totalOrders: orders.length,
        totalRevenue,
        totalRefunds,
        refundRate,
        aov,
        netRevenue: totalRevenue - totalRefunds,
        totalSessions: sessions.length,
        totalPageviews: pageviews.length,
        totalProducts: products.length,
      };
    } catch (err) {
      console.error('Error calculating metrics:', err);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        totalRefunds: 0,
        refundRate: 0,
        aov: 0,
        netRevenue: 0,
        totalSessions: 0,
        totalPageviews: 0,
        totalProducts: 0,
      };
    }
  }, [orders, refunds, sessions, pageviews]);

  // Aggregate data for charts
  const revenueByMonth = useMemo(() => {
    try {
      return aggregateRevenueByMonth(orders);
    } catch (err) {
      console.error('Error aggregating revenue by month:', err);
      return [];
    }
  }, [orders]);

  const revenueByYear = useMemo(() => {
    try {
      return aggregateRevenueByYear(orders);
    } catch (err) {
      console.error('Error aggregating revenue by year:', err);
      return [];
    }
  }, [orders]);

  const refundsByProduct = useMemo(() => {
    try {
      return getRefundsByProduct(refunds, orderItems, products);
    } catch (err) {
      console.error('Error calculating refunds by product:', err);
      return [];
    }
  }, [refunds, orderItems, products]);

  const ordersByProduct = useMemo(() => {
    try {
      return getOrdersByProduct(orderItems, products);
    } catch (err) {
      console.error('Error calculating orders by product:', err);
      return [];
    }
  }, [orderItems, products]);

  useEffect(() => {
    // Simulate loading state and validate data
    const timer = setTimeout(() => {
      if (orders.length === 0 && ordersRaw.length > 0) {
        setError('Failed to load order data');
      } else if (sessions.length === 0 && sessionsRaw.length > 0) {
        setError('Failed to load session data');
      } else if (error) {
        // Error was already set during processing
      } else {
        setError(null);
      }
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [orders.length, sessions.length, error]);

  return {
    // Raw cleaned data
    orders,
    orderItems,
    refunds,
    products,
    sessions,
    pageviews,
    
    // Calculated metrics
    metrics,
    
    // Aggregated data for charts
    revenueByMonth,
    revenueByYear,
    refundsByProduct,
    ordersByProduct,
    
    // State
    isLoading,
    error,
  };
};

export default useDashboardData;