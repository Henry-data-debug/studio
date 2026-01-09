import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import Link from "next/link";

export default function LeasesPage() {
  return (
    <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4 w-fit">
                    <FileText className="h-8 w-8 text-primary"/>
                </div>
                <CardTitle>Lease Tracking Integrated</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Lease information, including payment status and expiration dates, is available on the <Link href="/tenants" className="text-primary hover:underline">Tenants</Link> page.
                </p>
            </CardContent>
        </Card>
    </div>
  )
}
