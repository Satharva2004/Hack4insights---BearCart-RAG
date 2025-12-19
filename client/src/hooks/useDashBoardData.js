import { useState, useEffect, useMemo } from "react";
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
} from "@/utils/dataCleaners";

// Import JSON data
import ordersRaw from "../../public/data/orders.json";
import orderItemsRaw from "../../public/data/order_items.json";
import refundsRaw from "../../public/data/order_item_refunds.json";
import productsRaw from "../../public/data/products.json";
import sessionsRaw from "../../public/data/website_sessions.json";
import pageviewsRaw from "../../public/data/website_pageviews.json";

const LIMIT_ROWS = 500; // Limit to 500 rows per dataset

const useDashboardData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clean and process data with proper error handling
  const processedData = useMemo(() => {
    try {
      console.log("Processing data...");

      // Limit raw data to first 500 rows
      const ordersLimited = Array.isArray(ordersRaw)
        ? ordersRaw.slice(0, LIMIT_ROWS)
        : [];
      const orderItemsLimited = Array.isArray(orderItemsRaw)
        ? orderItemsRaw.slice(0, LIMIT_ROWS)
        : [];
      const refundsLimited = Array.isArray(refundsRaw)
        ? refundsRaw.slice(0, LIMIT_ROWS)
        : [];
      const productsLimited = Array.isArray(productsRaw)
        ? productsRaw.slice(0, LIMIT_ROWS)
        : [];
      const sessionsLimited = Array.isArray(sessionsRaw)
        ? sessionsRaw.slice(0, LIMIT_ROWS)
        : [];
      const pageviewsLimited = Array.isArray(pageviewsRaw)
        ? pageviewsRaw.slice(0, LIMIT_ROWS)
        : [];

      console.log("Limited data counts:", {
        orders: ordersLimited.length,
        orderItems: orderItemsLimited.length,
        refunds: refundsLimited.length,
        products: productsLimited.length,
        sessions: sessionsLimited.length,
        pageviews: pageviewsLimited.length,
      });

      const orders = cleanOrdersData(ordersLimited);
      const orderItems = cleanOrderItemsData(orderItemsLimited);
      const refunds = cleanRefundsData(refundsLimited);
      const products = cleanProductsData(productsLimited);
      const sessions = cleanSessionsData(sessionsLimited);
      const pageviews = cleanPageviewsData(pageviewsLimited);

      console.log("Data processed successfully:", {
        orders: orders.length,
        orderItems: orderItems.length,
        refunds: refunds.length,
        products: products.length,
        sessions: sessions.length,
        pageviews: pageviews.length,
      });

      return { orders, orderItems, refunds, products, sessions, pageviews };
    } catch (err) {
      console.error("Error processing data:", err);
      setError(err.message || "Failed to process data");
      return {
        orders: [],
        orderItems: [],
        refunds: [],
        products: [],
        sessions: [],
        pageviews: [],
      };
    }
  }, []); // Empty dependency array since raw data is static

  const { orders, orderItems, refunds, products, sessions, pageviews } =
    processedData;

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
        limited: LIMIT_ROWS, // Add info about the limit
      };
    } catch (err) {
      console.error("Error calculating metrics:", err);
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
        limited: LIMIT_ROWS,
      };
    }
  }, [orders, refunds, sessions, pageviews]);

  // Aggregate data for charts
  const revenueByMonth = useMemo(() => {
    try {
      return aggregateRevenueByMonth(orders);
    } catch (err) {
      console.error("Error aggregating revenue by month:", err);
      return [];
    }
  }, [orders]);

  const revenueByYear = useMemo(() => {
    try {
      return aggregateRevenueByYear(orders);
    } catch (err) {
      console.error("Error aggregating revenue by year:", err);
      return [];
    }
  }, [orders]);

  const refundsByProduct = useMemo(() => {
    try {
      return getRefundsByProduct(refunds, orderItems, products);
    } catch (err) {
      console.error("Error calculating refunds by product:", err);
      return [];
    }
  }, [refunds, orderItems, products]);

  const ordersByProduct = useMemo(() => {
    try {
      return getOrdersByProduct(orderItems, products);
    } catch (err) {
      console.error("Error calculating orders by product:", err);
      return [];
    }
  }, [orderItems, products]);

  useEffect(() => {
    // Simulate loading state and validate data
    const timer = setTimeout(() => {
      // Check if we have data after limiting
      if (orders.length === 0 && ordersRaw.length > 0) {
        setError("Failed to load order data");
      } else if (sessions.length === 0 && sessionsRaw.length > 0) {
        setError("Failed to load session data");
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

    // Info about data limitation
    dataLimit: LIMIT_ROWS,
    isLimited: true, // Flag to indicate data is limited
  };
};

export default useDashboardData;
