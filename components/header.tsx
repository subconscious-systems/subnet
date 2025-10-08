import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-foreground text-2xl font-bold">SubNet</span>
        </Link>
        <Link href="/create">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer">
            Create Agent
          </Button>
        </Link>
      </div>
    </header>
  );
}
