import Link from "next/link";
import { Wrench } from "lucide-react";
import { categories } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
              <Wrench className="h-5 w-5 text-blue-600" />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Utilify</span>
            </Link>
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              Free online tools for everyone. No sign-up required.
            </p>
          </div>
          {categories.slice(0, 3).map((cat) => (
            <div key={cat.slug}>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{cat.name}</h3>
              <ul className="mt-3 space-y-2">
                {cat.tools.slice(0, 4).map((tool) => (
                  <li key={tool.slug}>
                    <Link
                      href={`/tools/${cat.slug}/${tool.slug}`}
                      className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    >
                      {tool.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-zinc-200 pt-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          &copy; {new Date().getFullYear()} Utilify. All rights reserved. Free online tools for productivity.
        </div>
      </div>
    </footer>
  );
}
