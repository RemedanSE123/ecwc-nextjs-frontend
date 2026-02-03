import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="inline-flex p-4 rounded-full bg-amber-100 dark:bg-amber-900/20 mb-4">
          <FileQuestion className="w-10 h-10 text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page not found</h2>
        <p className="text-sm text-muted-foreground mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href="/">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
