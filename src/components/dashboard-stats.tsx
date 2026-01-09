import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Users, Building2, Wrench, AlertCircle, Building } from "lucide-react";
import { getTenants, getProperties, getMaintenanceRequests } from "@/lib/data";

export async function DashboardStats() {
  const tenants = await getTenants();
  const properties = await getProperties();
  const maintenanceRequests = await getMaintenanceRequests();

  const totalTenants = tenants.length;
  const totalProperties = properties.length;
  const pendingMaintenance = maintenanceRequests.filter(r => r.status !== 'Completed').length;
  const overdueRents = tenants.filter(t => t.lease && t.lease.paymentStatus === 'Overdue').length;
  const occupiedUnits = properties.reduce((count, property) => {
    return count + property.units.filter(unit => unit.status === 'rented').length;
  }, 0);

  const stats = [
    { title: "Total Tenants", value: totalTenants, icon: Users, color: "text-blue-500" },
    { title: "Properties Managed", value: totalProperties, icon: Building2, color: "text-green-500" },
    { title: "Occupied Units", value: occupiedUnits, icon: Building, color: "text-purple-500" },
    { title: "Pending Maintenance", value: pendingMaintenance, icon: Wrench, color: "text-yellow-500" },
    { title: "Overdue Rents", value: overdueRents, icon: AlertCircle, color: "text-red-500" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {/* Additional context if needed */}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
