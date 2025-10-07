import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-2xl font-bold text-foreground">SubNet</span>
        </Link>
        <Link href="/create">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer">Create Agent</Button>
        </Link>
      </div>
    </header>
  )
}
