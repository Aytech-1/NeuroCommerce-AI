import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center dark:bg-slate-950">
      <Container size="sm" className="space-y-6">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-3xl font-extrabold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
          404
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto dark:text-slate-400">
          The page or resource you are looking for does not exist or has been relocated within the platform.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/">
            <Button className="gap-2">
              <Home className="h-4 w-4" />
              Return Home
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Browse Catalog
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
