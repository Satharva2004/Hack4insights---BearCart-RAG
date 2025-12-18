import { DollarSign, Package, TrendingUp, BarChart3 } from 'lucide-react';
import KpiCard from '../KpiCard';
import RevenueChart from '../charts/RevenueChart';
import OrdersChart from '../charts/OrdersChart';
import ProductPieChart from '../charts/ProductPieChart';
import { formatCurrency, formatNumber } from '@/utils/dataCleaners';

const RevenueSection = ({ metrics, revenueByMonth, ordersByProduct }) => {
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
        <RevenueChart data={revenueByMonth} />
        <OrdersChart data={revenueByMonth} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductPieChart 
          data={ordersByProduct} 
          title="Orders by Product" 
          dataKey="orders"
        />
        <ProductPieChart 
          data={ordersByProduct} 
          title="Revenue by Product" 
          dataKey="revenue"
        />
      </div>
    </div>
  );
};

export default RevenueSection;