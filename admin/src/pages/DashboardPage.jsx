import { useQuery } from '@tanstack/react-query';
import { getDashboardKPIs } from '../api/dashboard';
import { getOrders } from '../api/orders';
import {
  ShoppingCart,
  Clock,
  TrendingUp,
  Package,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';

// eslint-disable-next-line no-unused-vars
function StatCard({ title, value, icon: Icon, color, subtitle }) {
  const colorClasses = {
    amber: 'bg-amber-50 text-amber-700',
    green: 'bg-green-50 text-green-700',
    blue: 'bg-blue-50 text-blue-700',
    red: 'bg-red-50 text-red-700',
    purple: 'bg-purple-50 text-purple-700',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function RecentOrders({ orders }) {
  const statusColors = {
    PENDING_CONFIRMATION: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PREPARING: 'bg-purple-100 text-purple-800',
    OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <span className="font-mono text-sm text-amber-700">{order.orderNo}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {order.customer?.fullName || 'Guest'}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      statusColors[order.status]
                    }`}
                  >
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-right font-medium">
                  {order.pricing?.grandTotal?.toFixed(2)} AED
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: getDashboardKPIs,
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: () => getOrders({ limit: 5, sort: '-createdAt' }),
    refetchInterval: 60000,
  });

  if (kpisLoading || ordersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  const stats = kpis?.data || {};
  const orders = ordersData?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="Orders Today"
          value={stats.ordersToday || 0}
          icon={ShoppingCart}
          color="amber"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders || 0}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Revenue Today"
          value={`${(stats.revenueToday || 0).toFixed(2)} AED`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Revenue This Month"
          value={`${(stats.revenueMonth || 0).toFixed(2)} AED`}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStock || 0}
          icon={stats.lowStock > 0 ? AlertTriangle : Package}
          color={stats.lowStock > 0 ? 'red' : 'green'}
        />
      </div>

      <RecentOrders orders={orders} />
    </div>
  );
}
