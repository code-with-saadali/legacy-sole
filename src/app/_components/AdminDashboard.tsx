"use client";

import DeliverySettings from "./DeliverySettings";
import CouponManager from "./CouponManager";
import ReviewModeration from "./ReviewModeration";
import CustomerRequests from "./CustomerRequests";
import { useState } from "react";
import { useCatalog } from "./CatalogProvider";
import AdminNavigation, { type AdminTab } from "./AdminNavigation";
import AdminHeader from "./AdminHeader";
import AdminOrderNotifications from "./AdminOrderNotifications";
import AdminOverview from "./AdminOverview";
import AdminOrdersPanel from "./AdminOrdersPanel";
import AdminProductsPanel from "./AdminProductsPanel";
import AdminOrderDetails from "./AdminOrderDetails";
import useAdminOrders from "../_hooks/useAdminOrders";
import useAdminOrderActions from "../_hooks/useAdminOrderActions";
import type { Order } from "../_data/orders";

export default function AdminDashboard() {
  const [tab, setTab] = useState<AdminTab>("Overview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [stockOnly, setStockOnly] = useState(false);
  const { products, refresh, connection, error: catalogError } = useCatalog();
  const {
    orders,
    setOrders,
    newOrderIds,
    setNewOrderIds,
    soundOn,
    toggleSound,
    error,
    setError,
  } = useAdminOrders();
  const { updating, updateStatus, saveShipment } = useAdminOrderActions({
    orders,
    setOrders,
    setError,
  });
  const selectedOrder = orders.find((order) => order.id === selectedOrderId);

  const viewNewOrders = () => {
    setTab("Orders");
    setStatusFilter("All");
    setSearch("");
    setNewOrderIds([]);
  };

  const manageStock = () => {
    setStockOnly(true);
    setTab("Products");
  };

  const resolveOrder = (resolved: Order) => {
    setOrders((current) =>
      current.map((order) => (order.id === resolved.id ? resolved : order)),
    );
    void refresh();
  };

  return (
    <main className="admin-workspace min-h-screen bg-[#F4F1E9]">
      <AdminNavigation tab={tab} setTab={setTab} connection={connection} />
      <div className="min-h-screen px-5 pb-24 pt-10 lg:ml-64 lg:px-10 lg:pt-16 xl:px-14">
        <AdminHeader tab={tab} />
        <AdminOrderNotifications
          count={newOrderIds.length}
          soundOn={soundOn}
          onViewOrders={viewNewOrders}
          onToggleSound={() => void toggleSound()}
        />
        {(error || catalogError) && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {error || catalogError}
          </p>
        )}
        {tab === "Settings" && <div className="mt-8 space-y-6"><DeliverySettings/><CouponManager/></div>}
        {tab === "Customers" && <div className="mt-8 space-y-6"><CustomerRequests onOpenOrder={setSelectedOrderId}/><ReviewModeration/></div>}
        {tab === "Overview" && (
          <AdminOverview
            products={products}
            orders={orders}
            catalogError={catalogError}
            onManageProducts={() => setTab("Products")}
            onManageStock={manageStock}
            onViewOrders={() => setTab("Orders")}
            onOpenOrder={setSelectedOrderId}
          />
        )}
        {tab === "Orders" && (
          <AdminOrdersPanel
            orders={orders}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onOpenOrder={setSelectedOrderId}
            onStatusChange={updateStatus}
            updating={updating !== null}
          />
        )}
        {tab === "Products" && (
          <AdminProductsPanel
            products={products}
            stockOnly={stockOnly}
            setStockOnly={setStockOnly}
            onProductsChange={() => void refresh()}
          />
        )}
      </div>
      {selectedOrder && (
        <AdminOrderDetails
          key={selectedOrder.id}
          order={selectedOrder}
          onClose={() => setSelectedOrderId(null)}
          onStatusChange={updateStatus}
          onShipmentSave={saveShipment}
          onResolved={resolveOrder}
          updating={updating !== null}
          error={error}
        />
      )}
    </main>
  );
}
