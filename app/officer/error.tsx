"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {error.message ||
              "An unexpected error occurred while loading team members."}
          </p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/dashboard")}
          >
            Go to Dashboard
          </Button>
          <Button onClick={() => reset()}>Try Again</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
