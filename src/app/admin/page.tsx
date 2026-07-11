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
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "Products",
    value: products.length.toString(),
    change: "+2",
    up: true,
    icon: Package,
    color: "bg-green-50 text-green-600",
  },
  {
    label: "Customers",
    value: "1,284",
    change: "-3.1%",
    up: false,
    icon: Users,
    color: "bg-purple-50 text-purple-600",
  },
];

const recentOrders = [
  { id: "#ORD-001", customer: "Sarah Chen", product: "Nordic Linen Sofa", amount: "$1,299", status: "Delivered" },
  { id: "#ORD-002", customer: "Marcus Lee", product: "Marble Coffee Table", amount: "$649", status: "Shipped" },
  { id: "#ORD-003", customer: "Emma Wilson", product: "Japandi Bed Frame", amount: "$899", status: "Processing" },
  { id: "#ORD-004", customer: "David Park", product: "Bouclé Accent Chair", amount: "$549", status: "Pending" },
  { id: "#ORD-005", customer: "Olivia Torres", product: "Walnut Dining Table", amount: "$1,849", status: "Delivered" },
];

const statusColors: Record<string, string> = {
  Delivered: "bg-green-100 text-green-700",
  Shipped: "bg-blue-100 text-blue-700",
  Processing: "bg-amber-100 text-amber-700",
  Pending: "bg-stone-100 text-stone-600",
  Cancelled: "bg-red-100 text-red-700",
};

const topProducts = products
  .sort((a, b) => b.reviewCount - a.reviewCount)
  .slice(0, 5);

export default function AdminDashboard() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-widest text-amber-600 mb-1">Dashboard</p>
        <h1 className="text-2xl font-semibold text-stone-900">Overview</h1>
        <p className="text-sm text-stone-500 mt-0.5">Welcome back. Here's what's happening.</p>
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
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${up ? "text-green-600" : "text-red-500"}`}>
              {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
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
            <button className="text-xs text-amber-600 hover:underline font-medium">View all</button>
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
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
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
            <Eye className="h-4 w-4 text-stone-400" />
          </div>
          <div className="divide-y divide-stone-50">
            {topProducts.map((product, i) => (
              <div key={product.id} className="flex items-center gap-3 px-6 py-4">
                <span className="text-xs font-semibold text-stone-400 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 truncate">{product.name}</p>
                  <p className="text-xs text-stone-400">{product.reviewCount} reviews</p>
                </div>
                <p className="text-sm font-semibold text-stone-900">${product.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
