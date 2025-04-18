import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <Skeleton className="h-8 w-64 mx-auto" />
        </div>
        <div className="space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <Skeleton className="h-10 w-full rounded-t-md" />
            </div>
            <div>
              <Skeleton className="h-10 w-full rounded-b-md" />
            </div>
          </div>
          <div>
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="text-center">
            <Skeleton className="h-5 w-48 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
