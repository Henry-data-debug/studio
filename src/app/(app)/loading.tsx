import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4 w-fit">
                    <Loader className="h-8 w-8 text-primary animate-spin"/>
                </div>
                <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Please wait while we load the page content.
                </p>
            </CardContent>
        </Card>
    </div>
  )
}
