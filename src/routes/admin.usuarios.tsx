import { createFileRoute } from "@tanstack/react-router";

import { AdminUsersPanel } from "@/components/AdminUsersPanel";

export const Route = createFileRoute("/admin/usuarios")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  return <AdminUsersPanel />;
}
