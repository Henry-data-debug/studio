import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderArchive } from "lucide-react";

export default function DocumentsPage() {
  return (
    <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4 w-fit">
                    <FolderArchive className="h-8 w-8 text-primary"/>
                </div>
                <CardTitle>Document Storage</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    This feature is under development. Soon you'll be able to store and manage important documents like lease agreements and inspection reports here.
                </p>
            </CardContent>
        </Card>
    </div>
  )
}
