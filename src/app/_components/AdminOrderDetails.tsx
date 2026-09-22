"use client";
import CustomSelect from "./CustomSelect";

import { useEffect, useRef, useState } from "react";
import {
  FiMapPin,
  FiMessageCircle,
  FiPackage,
  FiTruck,
  FiUser,
  FiX,
} from "react-icons/fi";
import ProductImage from "./ProductImage";
import type { Order } from "../_data/orders";
import { orderMessage, whatsappPhone } from "../_data/admin";
import AdminOrderPrint from "./AdminOrderPrint";
import AdminOrderResolution from "./AdminOrderResolution";

export default function AdminOrderDetails({
  order,
  onClose,
  onStatusChange,
  onShipmentSave,
  onResolved,
  updating,
  error,
}: {
  order: Order;
  onClose: () => void;
  onStatusChange: (id: string, status: Order["status"]) => Promise<void>;
  onShipmentSave: (
    id: string,
    courier: string,
    tracking: string,
    dispatch: boolean,
  ) => Promise<boolean>;
  onResolved: (order: Order) => void;
  updating: boolean;
  error: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const phone = whatsappPhone(order.customer.phone);
  const message = orderMessage(order);
  const [shipmentDraft, setShipmentDraft] = useState<{
    courier: string;
    tracking: string;
  } | null>(null);
  const [shipmentSaved, setShipmentSaved] = useState(false);
  const shipment = shipmentDraft ?? {
    courier: order.courier_name ?? "",
    tracking: order.tracking_number ?? "",
  };
  const saveShipment = async (dispatch: boolean) => {
    setShipmentSaved(false);
    if (
      await onShipmentSave(
        order.id,
        shipment.courier,
        shipment.tracking,
        dispatch,
      )
    ) {
      setShipmentDraft(null);
      setShipmentSaved(true);
    }
  };

  useEffect(() => {
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      data-lenis-prevent
      style={{ overscrollBehavior: "contain" }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      aria-labelledby="order-details-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_1.5rem)] max-w-4xl scrollbar-hidden overflow-y-auto rounded-[28px] border border-black/10 bg-[#F4F1E9] p-0 text-[#20211e] shadow-2xl backdrop:bg-black/45 backdrop:backdrop-blur-sm"
    >
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-black/10 bg-[#F4F1E9]/95 px-5 py-5 backdrop-blur-md sm:px-8">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#b66b4d]">
            Legacy Sole / Order details
          </p>
          <h2
            id="order-details-title"
            className="mt-2 break-all text-xl font-semibold sm:text-2xl"
          >
            {order.id}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span
              className={`admin-status-${order.status.toLowerCase()} rounded-full px-3 py-1 text-[11px] font-medium`}
            >
              {order.status}
            </span>
            <p className="text-xs text-black/50">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close order details"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-[#F8F6F1] transition-colors hover:bg-[#E9E2D7]"
        >
          <FiX size={18} />
        </button>
      </div>
      <div className="p-5 sm:p-8">
        <AdminOrderPrint order={order} />
        <AdminOrderResolution order={order} onResolved={onResolved} />
        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="min-w-0 rounded-[22px] border border-black/10 bg-[#F8F6F1] p-5">
            <h3 className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-black/50">
              <FiUser size={15} /> Customer
            </h3>
            <p className="mt-4 break-words text-base font-medium">
              {order.customer.name}
            </p>
            <p className="mt-2 break-all text-xs leading-6 text-black/60">
              {order.customer.email}
            </p>
            <p className="mt-1 break-words text-sm text-black/60">
              {order.customer.phone}
            </p>
          </div>
          <div className="min-w-0 rounded-[22px] border border-black/10 bg-[#F8F6F1] p-5">
            <h3 className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-black/50">
              <FiMapPin size={15} /> Delivery address
            </h3>
            <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7">
              {order.customer.address}
              <br />
              {order.customer.city} {order.customer.postalCode}
            </p>
          </div>
        </section>
        <section className="mt-5 overflow-hidden rounded-[22px] border border-black/10 bg-[#F8F6F1]">
          <h3 className="flex items-center gap-2 border-b border-black/10 px-5 py-4 text-sm font-semibold">
            <FiPackage size={16} /> Ordered products{" "}
            <span className="ml-auto text-xs font-normal text-black/45">
              {order.items.reduce((total, item) => total + item.quantity, 0)}{" "}
              items
            </span>
          </h3>
          <ul className="divide-y divide-black/10 px-5">
            {order.items.map((item, index) => (
              <li
                key={`${item.slug}-${item.size}-${index}`}
                className="flex items-start gap-3 py-5 sm:gap-4"
              >
                <div className="relative h-16 w-16 shrink-0 rounded-xl bg-[#E9E2D7] sm:h-20 sm:w-20">
                  <ProductImage
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-contain p-2"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-medium">
                      {item.name}
                    </p>
                    <p className="mt-2 break-words text-xs leading-5 text-black/55">
                      {item.size} · {item.color}
                    </p>
                    <p className="mt-1 text-xs text-black/45">
                      Qty {item.quantity} × Rs. {item.price.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/10 bg-[#E9E2D7] px-5 py-5">
            <span className="text-sm font-medium">Order total</span>
            <span className="text-xl font-semibold tracking-tight">
              Rs. {order.total.toLocaleString()}
            </span>
          </div>
        </section>
        <label className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-black/10 bg-[#F8F6F1] p-5 text-sm font-medium">
          Order status
          <CustomSelect
            label={`Status for order ${order.id}`}
            value={order.status}
            disabled={
              updating ||
              order.status === "Cancelled" ||
              order.status === "Returned"
            }
            onChange={(value) =>
              void onStatusChange(order.id, value as Order["status"])
            }
            options={[
              "Pending",
              "Confirmed",
              "Dispatched",
              "Delivered",
              ...(["Cancelled", "Returned"].includes(order.status)
                ? [order.status]
                : []),
            ].map((value) => ({ value, label: value }))}
          />
        </label>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void saveShipment(false);
          }}
          className="mt-5 rounded-[22px] border border-black/10 bg-[#F8F6F1] p-5"
        >
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <FiTruck size={16} /> Courier tracking
          </h3>
          <p className="mt-2 text-xs text-black/50">
            Save the courier and parcel reference for your customer.
          </p>
          <fieldset
            disabled={
              updating ||
              order.status === "Cancelled" ||
              order.status === "Returned"
            }
            className="mt-4 grid gap-4 disabled:opacity-60 sm:grid-cols-2"
          >
            <label className="admin-field">
              Courier name
              <input
                maxLength={80}
                value={shipment.courier}
                placeholder="e.g. TCS, Leopards"
                onChange={(event) => {
                  setShipmentSaved(false);
                  setShipmentDraft({
                    ...shipment,
                    courier: event.target.value,
                  });
                }}
              />
            </label>
            <label className="admin-field">
              Tracking number
              <input
                maxLength={100}
                value={shipment.tracking}
                placeholder="Parcel reference"
                onChange={(event) => {
                  setShipmentSaved(false);
                  setShipmentDraft({
                    ...shipment,
                    tracking: event.target.value,
                  });
                }}
              />
            </label>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <button
                type="submit"
                className="rounded-xl border border-black/15 px-4 py-3 text-xs"
              >
                {updating ? "Saving..." : "Save tracking"}
              </button>
              {order.status !== "Delivered" &&
                order.status !== "Dispatched" && (
                  <button
                    type="button"
                    onClick={() => void saveShipment(true)}
                    className="rounded-xl bg-[#20211e] px-4 py-3 text-xs text-white"
                  >
                    Save & mark dispatched
                  </button>
                )}
            </div>
          </fieldset>
          {shipmentSaved && (
            <p role="status" className="mt-3 text-xs text-[#20211e]">
              Tracking details saved.
            </p>
          )}
        </form>
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <section className="mt-5 rounded-[22px] border border-black/10 bg-[#E9E2D7] p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <FiMessageCircle /> Customer update
          </h3>
          <p className="mt-4 whitespace-pre-wrap break-words rounded-2xl border border-black/5 bg-[#F8F6F1] p-4 text-xs leading-6 text-black/65">
            {message}
          </p>
          {phone ? (
            <a
              href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#20211e] px-5 py-3 text-xs font-medium text-white transition-colors hover:bg-[#b66b4d]"
            >
              <FiMessageCircle /> Open WhatsApp draft
            </a>
          ) : (
            <p className="mt-4 text-xs text-amber-800">
              WhatsApp unavailable: this order needs a valid mobile number with
              country code.
            </p>
          )}
          <p className="mt-3 text-[11px] text-black/50">
            Review the draft in WhatsApp before sending.
          </p>
        </section>
      </div>
    </dialog>
  );
}
