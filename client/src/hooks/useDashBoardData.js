import { useState, useEffect, useMemo } from 'react';
import {
  cleanOrdersData,
  cleanOrderItemsData,
  cleanRefundsData,
  cleanProductsData,
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

const useDashboardData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clean and process data
  const processedData = useMemo(() => {
    try {
      const orders = cleanOrdersData(ordersRaw);
      const orderItems = cleanOrderItemsData(orderItemsRaw);
      const refunds = cleanRefundsData(refundsRaw);
      const products = cleanProductsData(productsRaw);

      return { orders, orderItems, refunds, products };
    } catch (err) {
      console.error('Error processing data:', err);
      return { orders: [], orderItems: [], refunds: [], products: [] };
    }
  }, []);

  const { orders, orderItems, refunds, products } = processedData;

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalRevenue = calculateTotalRevenue(orders);
    const totalRefunds = calculateTotalRefunds(refunds);
    
    return {
      totalOrders: orders.length,
      totalRevenue,
      totalRefunds,
      refundRate: calculateRefundRate(orders, refunds),
      aov: calculateAOV(orders),
      netRevenue: totalRevenue - totalRefunds,
    };
  }, [orders, refunds]);

  // Aggregate data for charts
  const revenueByMonth = useMemo(() => aggregateRevenueByMonth(orders), [orders]);
  const revenueByYear = useMemo(() => aggregateRevenueByYear(orders), [orders]);
  const refundsByProduct = useMemo(() => getRefundsByProduct(refunds, orderItems, products), [refunds, orderItems, products]);
  const ordersByProduct = useMemo(() => getOrdersByProduct(orderItems, products), [orderItems, products]);

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      if (orders.length === 0) {
        setError('Failed to load data');
      }
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [orders.length]);

  return {
    orders,
    orderItems,
    refunds,
    products,
    metrics,
    revenueByMonth,
    revenueByYear,
    refundsByProduct,
    ordersByProduct,
    isLoading,
    error,
  };
};

export default useDashboardData;