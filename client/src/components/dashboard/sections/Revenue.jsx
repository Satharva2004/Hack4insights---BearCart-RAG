import { DollarSign, Package, TrendingUp, BarChart3 } from 'lucide-react';
import KpiCard from '../KpiCard';
import RevenueChart from '../charts/RevenueChart';
import OrdersChart from '../charts/OrdersChart';
import ProductPieChart from '../charts/ProductPieChart';
import ChartInsight from '../ChatInsight';
import AIRecommendations from '../AiRecommendation';
import { formatCurrency, formatNumber } from '@/utils/dataCleaners';
import {
  analyzeRevenueTrends,
  analyzeOrderTrends,
  analyzeRevenueByProduct,
  analyzeProductDistribution
} from '@/utils/insightEngine';

const RevenueSection = ({ metrics, revenueByMonth, ordersByProduct }) => {
  // Generate insights
  const revenueTrendInsight = analyzeRevenueTrends(revenueByMonth);
  const orderTrendInsight = analyzeOrderTrends(revenueByMonth);
  const revenueByProductInsight = analyzeRevenueByProduct(ordersByProduct);
  const orderDistributionInsight = analyzeProductDistribution(ordersByProduct, 'orders');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-foreground">Revenue & Orders</h1>
        <p className="text-muted-foreground mt-1">Detailed revenue analysis and order metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          change={12.5}
          changeLabel="vs last period"
          trend="up"
          icon={<DollarSign className="w-4 h-4" />}
        />
        <KpiCard
          title="Net Revenue"
          value={formatCurrency(metrics.netRevenue)}
          change={10.2}
          changeLabel="vs last period"
          trend="up"
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <KpiCard
          title="Total Orders"
          value={formatNumber(metrics.totalOrders)}
          change={8.3}
          changeLabel="vs last period"
          trend="up"
          icon={<BarChart3 className="w-4 h-4" />}
        />
        <KpiCard
          title="Average Order Value"
          value={formatCurrency(metrics.aov)}
          change={2.1}
          changeLabel="vs last period"
          trend="up"
          icon={<Package className="w-4 h-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <RevenueChart data={revenueByMonth} />
          <ChartInsight type={revenueTrendInsight.type} message={revenueTrendInsight.message} />
        </div>
        <div>
          <OrdersChart data={revenueByMonth} />
          <ChartInsight type={orderTrendInsight.type} message={orderTrendInsight.message} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ProductPieChart 
            data={ordersByProduct} 
            title="Orders by Product" 
            dataKey="orders"
          />
          <ChartInsight type={orderDistributionInsight.type} message={orderDistributionInsight.message} />
        </div>
        <div>
          <ProductPieChart 
            data={ordersByProduct} 
            title="Revenue by Product" 
            dataKey="revenue"
          />
          <ChartInsight type={revenueByProductInsight.type} message={revenueByProductInsight.message} />
        </div>
      </div>

      {/* AI-Powered Recommendations */}
      <AIRecommendations 
        sectionType="revenue"
        metrics={{
          totalRevenue: metrics.totalRevenue.toFixed(0),
          netRevenue: metrics.netRevenue.toFixed(0),
          totalOrders: metrics.totalOrders,
          aov: metrics.aov.toFixed(2),
          topProduct: ordersByProduct.sort((a, b) => (b.revenue || 0) - (a.revenue || 0))[0]?.product,
          topProductRevenue: ordersByProduct.sort((a, b) => (b.revenue || 0) - (a.revenue || 0))[0]?.revenue?.toFixed(0)
        }}
        insights={{
          revenueTrend: revenueTrendInsight,
          orderTrend: orderTrendInsight,
          revenueByProduct: revenueByProductInsight
        }}
      />
    </div>
  );
};

export default RevenueSection;