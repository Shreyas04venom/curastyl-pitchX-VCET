import RouteGuard from "@/components/auth/RouteGuard";
import SalonOwnerDashboard from "./SalonOwnerDashboard";

export const metadata = { title: "Salon Owner Dashboard" };

const ALLOWED_ROLES: ("salon_owner" | "admin")[] = ["salon_owner", "admin"];

export default function Page() {
  return (
    <RouteGuard requiredRole={ALLOWED_ROLES}>
      <SalonOwnerDashboard />
    </RouteGuard>
  );
}
