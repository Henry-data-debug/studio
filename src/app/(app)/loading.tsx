
import { Loader } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <Loader className="h-8 w-8 animate-spin text-primary"/>
    </div>
  )
}
