"use client";

import AdminSettingsPanel from "./AdminSettingsPanel";
import ProfitReport from "./ProfitReport";
import AdminCustomersPanel from "./AdminCustomersPanel";
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
  const { updating, updateStatus, saveShipment, deleteOrder } =
    useAdminOrderActions({
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
    <main className="group/admin text-[#20211e] [&_h1]:font-[inherit] [&_h2]:font-[inherit] [&_h3]:font-[inherit] [&_table_th]:px-3 [&_table_th]:py-3.5 [&_table_th]:bg-[#f6f5f2] [&_table_th]:font-medium [&_table_td]:px-3 [&_table_td]:py-[18px] [&_table_tbody_tr:hover]:bg-[#f4f1e9] [&_summary]:list-inside [&_summary:focus-visible]:outline-2 [&_summary:focus-visible]:outline-[#b66b4d] [&_summary:focus-visible]:outline-offset-5 [&_summary:focus-visible]:rounded [&_input:focus-visible]:outline-2 [&_input:focus-visible]:outline-[#b66b4d] [&_input:focus-visible]:outline-offset-3 [&_select:focus-visible]:outline-2 [&_select:focus-visible]:outline-[#b66b4d] [&_select:focus-visible]:outline-offset-3 [&_textarea:focus-visible]:outline-2 [&_textarea:focus-visible]:outline-[#b66b4d] [&_textarea:focus-visible]:outline-offset-3 min-h-screen bg-[#F6F5F2]">
      <AdminNavigation tab={tab} setTab={setTab} connection={connection} />
      <div className="min-h-screen px-4 pb-16 pt-7 sm:px-7 lg:ml-64 lg:px-10 lg:pt-10 xl:px-12">
        <div className="mx-auto max-w-7xl">
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
          {tab === "Settings" && <AdminSettingsPanel />}
          {tab === "Profit" && <ProfitReport products={products} />}
          {tab === "Customers" && (
            <AdminCustomersPanel
              orders={orders}
              onOpenOrder={setSelectedOrderId}
            />
          )}
          {tab === "Overview" && (
            <AdminOverview
              products={products}
              orders={orders}
              catalogError={catalogError}
              onManageProducts={() => {
                setStockOnly(false);
                setTab("Products");
              }}
              onManageStock={manageStock}
              onViewOrders={viewNewOrders}
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
              onDelete={deleteOrder}
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
      </div>
      {selectedOrder && (
        <AdminOrderDetails
          key={selectedOrder.id}
          order={selectedOrder}
          onClose={() => setSelectedOrderId(null)}
          onStatusChange={updateStatus}
          onShipmentSave={saveShipment}
          onDelete={deleteOrder}
          onResolved={resolveOrder}
          updating={updating !== null}
          error={error}
        />
      )}
    </main>
  );
}
