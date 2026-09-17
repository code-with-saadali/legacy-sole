import type { Metadata } from "next";
import AdminAccess from "../_components/AdminAccess";
import AdminDashboard from "../_components/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard | Legacy Sole",
  description: "Legacy Sole store administration dashboard.",
};

export default function AdminPage() {
  return (
    <AdminAccess>
      <AdminDashboard />
    </AdminAccess>
  );
}
