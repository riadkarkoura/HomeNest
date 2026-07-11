import type { Metadata } from "next";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
} from "lucide-react";
import { products } from "@/lib/products";

export const metadata: Metadata = { title: "Overview" };

const stats = [
  {
    label: "Total Revenue",
    value: "$48,230",
    change: "+12.5%",
    up: true,
    icon: TrendingUp,
    color: "bg-amber-50 text-amber-600",
  },
  {
    label: "Orders",
    value: "342",
    change: "+8.2%",
    up: true,
    icon: ShoppingCart,
    color: "bg-stone-100 text-stone-600",
  },
  {
    label: "Products",
    value: products.length.toString(),
    change: "+2",
    up: true,
    icon: Package,
    color: "bg-amber-100 text-amber-700",
  },
  {
    label: "Customers",
    value: "1,284",
    change: "-3.1%",
    up: false,
    icon: Users,
    color: "bg-stone-100 text-stone-700",
  },
];

const recentOrders = [
  {
    id: "#HN-20260711-0001",
    customer: "Sarah Chen",
    product: "Silicone Sink Splash Guard",
    amount: "$24.00",
    status: "Delivered",
  },
  {
    id: "#HN-20260711-0002",
    customer: "Marcus Lee",
    product: "Adjustable Shower Caddy",
    amount: "$34.00",
    status: "Shipped",
  },
  {
    id: "#HN-20260711-0003",
    customer: "Emma Wilson",
    product: "Under-Sink Pull-Out Rack",
    amount: "$58.00",
    status: "Processing",
  },
  {
    id: "#HN-20260711-0004",
    customer: "David Park",
    product: "Bamboo Drawer Organizer Set",
    amount: "$38.00",
    status: "Pending",
  },
  {
    id: "#HN-20260711-0005",
    customer: "Olivia Torres",
    product: "Foldable Storage Cube Set",
    amount: "$48.00",
    status: "Delivered",
  },
];

const statusColors: Record<string, string> = {
  Delivered: "bg-stone-900 text-white",
  Shipped: "bg-amber-100 text-amber-700",
  Processing: "bg-amber-50 text-amber-600",
  Pending: "bg-stone-100 text-stone-600",
  Cancelled: "bg-stone-200 text-stone-600",
};

const topProducts = [...products]
  .sort((a, b) => b.reviewCount - a.reviewCount)
  .slice(0, 5);

export default function AdminDashboard() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-widest text-amber-600 mb-1">Dashboard</p>
        <h1 className="text-2xl font-semibold text-stone-900">Overview</h1>
        <p className="text-sm text-stone-500 mt-0.5">Welcome back. Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map(({ label, value, change, up, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-stone-100">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-stone-500 font-medium">{label}</p>
              <div className={`p-2 rounded-xl ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-stone-900">{value}</p>
            <div
              className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                up ? "text-stone-700" : "text-stone-400"
              }`}
            >
              {up ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-amber-600" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {change} vs last month
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-stone-100">
            <h2 className="font-semibold text-stone-900">Recent Orders</h2>
            <button className="text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors">
              View all
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3 hidden md:table-cell">Product</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-stone-900">{order.id}</td>
                    <td className="px-6 py-4 text-sm text-stone-600">{order.customer}</td>
                    <td className="px-6 py-4 text-sm text-stone-500 hidden md:table-cell max-w-[160px] truncate">
                      {order.product}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-stone-900">{order.amount}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          statusColors[order.status]
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-stone-100">
            <h2 className="font-semibold text-stone-900">Top Products</h2>
            <Eye className="h-4 w-4 text-stone-400" aria-hidden="true" />
          </div>
          <div className="divide-y divide-stone-50">
            {topProducts.map((product, i) => (
              <div key={product.id} className="flex items-center gap-3 px-6 py-4">
                <span className="text-xs font-semibold text-stone-400 w-5 flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 truncate">{product.name}</p>
                  <p className="text-xs text-stone-400">{product.reviewCount} reviews</p>
                </div>
                <p className="text-sm font-semibold text-stone-900 flex-shrink-0">
                  ${product.price.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
