import RouteGuard from "@/components/auth/RouteGuard";
import SalonRegisterClient from "./SalonRegisterClient";
export const metadata = { title: "List Your Salon – Mumbai GlamHub" };
const ALLOWED_ROLES: ("customer" | "salon_owner" | "admin")[] = ["customer", "salon_owner", "admin"];

export default function Page() {
  return (
    <RouteGuard requireAuth requiredRole={ALLOWED_ROLES}>
      <SalonRegisterClient />
    </RouteGuard>
  );
}
