import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BedDouble } from "lucide-react";

export default function AirbnbPage() {
  return (
    <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4 w-fit">
                    <BedDouble className="h-8 w-8 text-primary"/>
                </div>
                <CardTitle>Airbnb Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    This feature is under development. This space will be used to monitor units used as Airbnb rentals.
                </p>
            </CardContent>
        </Card>
    </div>
  )
}
