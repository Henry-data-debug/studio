
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";

export default function TenantDashboardPage() {
  return (
    <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4 w-fit">
                    <Wrench className="h-8 w-8 text-primary"/>
                </div>
                <CardTitle>Welcome, Tenant</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    This is your dashboard. Soon you'll be able to submit maintenance requests and view your lease details here.
                </p>
            </CardContent>
        </Card>
    </div>
  )
}
