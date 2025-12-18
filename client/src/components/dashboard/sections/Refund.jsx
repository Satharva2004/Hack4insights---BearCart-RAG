import { RotateCcw, DollarSign, AlertTriangle, Package } from 'lucide-react';
import KpiCard from '../KpiCard';
import RefundChart from '../charts/RefundChart';
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/dataCleaners';

const RefundSection = ({ metrics, refundsByProduct, totalRefundCount }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-foreground">Refund Analysis</h1>
        <p className="text-muted-foreground mt-1">Track and analyze refund patterns</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Refunds"
          value={formatCurrency(metrics.totalRefunds)}
          change={-2.3}
          changeLabel="vs last period"
          trend="down"
          icon={<DollarSign className="w-4 h-4" />}
        />
        <KpiCard
          title="Refund Rate"
          value={formatPercentage(metrics.refundRate)}
          change={-0.5}
          changeLabel="vs last period"
          trend="up"
          icon={<RotateCcw className="w-4 h-4" />}
        />
        <KpiCard
          title="Refund Count"
          value={formatNumber(totalRefundCount)}
          change={-1.2}
          changeLabel="vs last period"
          trend="down"
          icon={<AlertTriangle className="w-4 h-4" />}
        />
        <KpiCard
          title="Avg Refund Value"
          value={formatCurrency(totalRefundCount > 0 ? metrics.totalRefunds / totalRefundCount : 0)}
          change={0.8}
          changeLabel="vs last period"
          trend="neutral"
          icon={<Package className="w-4 h-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RefundChart data={refundsByProduct} />
        
        {/* Top Refunded Products Table */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold font-display text-foreground mb-6">Top Refunded Products</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Product</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Refunds</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {refundsByProduct
                  .sort((a, b) => b.amount - a.amount)
                  .slice(0, 5)
                  .map((item, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4 text-sm text-foreground">{item.product}</td>
                      <td className="py-3 px-4 text-sm text-foreground text-right">{formatNumber(item.refunds)}</td>
                      <td className="py-3 px-4 text-sm text-destructive text-right">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundSection;