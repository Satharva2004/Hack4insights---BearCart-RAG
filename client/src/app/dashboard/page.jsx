'use client';

import { useState } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import OverviewSection from '../../components/dashboard/sections/Overview';
import RevenueSection from '../../components/dashboard/sections/Revenue';
import RefundSection from '../../components/dashboard/sections/Refund';
import ProductsSection from '../../components/dashboard/sections/Products';
import LoadingState from '../../components/dashboard/LoadingState';
import useDashboardData from '@/hooks/useDashBoardData';

const Index = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const {
    products,
    refunds,
    metrics,
    revenueByMonth,
    revenueByYear,
    refundsByProduct,
    ordersByProduct,
    isLoading,
    error,
  } = useDashboardData();

  const renderSection = () => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive text-lg font-semibold">Error loading data</p>
            <p className="text-muted-foreground mt-2">{error}</p>
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'overview':
        return (
          <OverviewSection
            metrics={metrics}
            revenueByMonth={revenueByMonth}
            revenueByYear={revenueByYear}
          />
        );
      case 'revenue':
        return (
          <RevenueSection
            metrics={metrics}
            revenueByMonth={revenueByMonth}
            ordersByProduct={ordersByProduct}
          />
        );
      case 'refunds':
        return (
          <RefundSection
            metrics={metrics}
            refundsByProduct={refundsByProduct}
            totalRefundCount={refunds.length}
          />
        );
      case 'products':
        return (
          <ProductsSection
            products={products}
            ordersByProduct={ordersByProduct}
            refundsByProduct={refundsByProduct}
          />
        );
      case 'traffic':
      case 'conversion':
        return (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center glass-card p-12">
              <p className="text-2xl font-display font-bold text-foreground mb-2">Coming Soon</p>
              <p className="text-muted-foreground">
                This section requires session data which is not available in the current dataset.
              </p>
            </div>
          </div>
        );
      default:
        return (
          <OverviewSection
            metrics={metrics}
            revenueByMonth={revenueByMonth}
            revenueByYear={revenueByYear}
          />
        );
    }
  };

  return (
    <DashboardLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      {renderSection()}
    </DashboardLayout>
  );
};

export default Index;