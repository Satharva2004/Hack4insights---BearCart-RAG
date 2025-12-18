import { Package, DollarSign, ShoppingCart, Calendar } from 'lucide-react';
import ProductPieChart from '../charts/ProductPieChart';
import ChartInsight from '../ChatInsight';
import AIRecommendations from '../AiRecommendation';
import { formatCurrency, formatNumber } from '@/utils/dataCleaners';
import {
  analyzeProductDistribution,
  analyzeProductRefundRate
} from '@/utils/insightEngine';

const ProductsSection = ({ products, ordersByProduct, refundsByProduct }) => {
  // Merge product data
  const productData = products.map(product => {
    const orderData = ordersByProduct.find(o => o.product === product.product_name) || { orders: 0, revenue: 0 };
    const refundData = refundsByProduct.find(r => r.product === product.product_name) || { refunds: 0, amount: 0 };
    
    return {
      ...product,
      orders: orderData.orders,
      revenue: orderData.revenue,
      refunds: refundData.refunds,
      refundAmount: refundData.amount,
      refundRate: orderData.orders > 0 ? (refundData.refunds / orderData.orders) * 100 : 0,
    };
  });

  // Generate insights
  const revenueDistributionInsight = analyzeProductDistribution(ordersByProduct, 'revenue');
  const orderDistributionInsight = analyzeProductDistribution(ordersByProduct, 'orders');
  const refundRateInsight = analyzeProductRefundRate(productData);

  // Calculate metrics for AI recommendations
  const totalRevenue = ordersByProduct.reduce((sum, p) => sum + (p.revenue || 0), 0);
  const totalOrders = ordersByProduct.reduce((sum, p) => sum + (p.orders || 0), 0);
  const totalRefunds = productData.reduce((sum, p) => sum + p.refunds, 0);
  const avgRefundRate = productData.length > 0 
    ? productData.reduce((sum, p) => sum + p.refundRate, 0) / productData.length 
    : 0;
  const topProduct = ordersByProduct.sort((a, b) => (b.revenue || 0) - (a.revenue || 0))[0];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-foreground">Products</h1>
        <p className="text-muted-foreground mt-1">Product performance and catalog overview</p>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {productData.map((product) => (
          <div key={product.product_id} className="glass-card-hover p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{product.product_name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Launched {new Date(product.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <ShoppingCart className="w-3 h-3" /> Orders
                </p>
                <p className="text-xl font-bold font-display text-foreground">{formatNumber(product.orders)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Revenue
                </p>
                <p className="text-xl font-bold font-display text-foreground">{formatCurrency(product.revenue)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Refunds</p>
                <p className="text-lg font-semibold text-destructive">{formatNumber(product.refunds)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Refund Rate</p>
                <p className={`text-lg font-semibold ${product.refundRate > 5 ? 'text-destructive' : 'text-success'}`}>
                  {product.refundRate.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Refund Rate Insight */}
      <ChartInsight type={refundRateInsight.type} message={refundRateInsight.message} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ProductPieChart 
            data={ordersByProduct} 
            title="Revenue Distribution" 
            dataKey="revenue"
          />
          <ChartInsight type={revenueDistributionInsight.type} message={revenueDistributionInsight.message} />
        </div>
        <div>
          <ProductPieChart 
            data={ordersByProduct} 
            title="Order Distribution" 
            dataKey="orders"
          />
          <ChartInsight type={orderDistributionInsight.type} message={orderDistributionInsight.message} />
        </div>
      </div>

      {/* AI-Powered Recommendations */}
      <AIRecommendations 
        sectionType="products"
        metrics={{
          totalProducts: products.length,
          totalRevenue: totalRevenue.toFixed(0),
          totalOrders: totalOrders,
          totalRefunds: totalRefunds,
          avgRefundRate: avgRefundRate.toFixed(1),
          topProduct: topProduct?.product,
          topProductRevenue: topProduct?.revenue?.toFixed(0),
          topProductPercent: topProduct && totalRevenue > 0 
            ? ((topProduct.revenue / totalRevenue) * 100).toFixed(0)
            : '0'
        }}
        insights={{
          revenueDistribution: revenueDistributionInsight,
          orderDistribution: orderDistributionInsight,
          refundRate: refundRateInsight
        }}
      />
    </div>
  );
};

export default ProductsSection;