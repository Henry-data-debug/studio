import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

export default function ClientsPage() {
  return (
    <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4 w-fit">
                    <Briefcase className="h-8 w-8 text-primary"/>
                </div>
                <CardTitle>Client Property Management</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    This feature is under development. This section will be used to manage properties for clients who have signed a tenancy agreement.
                </p>
            </CardContent>
        </Card>
    </div>
  )
}
