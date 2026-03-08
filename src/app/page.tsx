import Link from "next/link";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import { categories } from "@/lib/constants";
import { SearchFilter } from "@/components/search-filter";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5Qzk2QjAiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoLTZWMzRoNnpNMzYgMjR2Nmgtc1YyNGg2ek0yNiAzNHY2aC02VjM0aDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
              <Sparkles className="h-4 w-4" />
              50+ Free Online Tools
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
              All-in-One{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Online Tools
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              PDF converter, image compressor, developer utilities, AI writing tools, and more.
              100% free, no sign-up required. Works right in your browser.
            </p>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="mx-auto -mt-8 max-w-2xl px-4 sm:px-6">
        <SearchFilter />
      </section>

      {/* Categories */}
      <section id="all-tools" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.slug} id={cat.slug}>
                <div className="mb-6 flex items-center gap-3">
                  <div className={`rounded-lg bg-muted p-2 ${cat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{cat.name}</h2>
                    <p className="text-sm text-muted-foreground">{cat.description}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {cat.tools.map((tool) => (
                    <Link
                      key={tool.slug}
                      href={`/tools/${cat.slug}/${tool.slug}`}
                      className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
                    >
                      <h3 className="font-semibold group-hover:text-primary">{tool.name}</h3>
                      <p className="mt-1.5 text-sm text-muted-foreground">{tool.description}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        Open tool <ArrowRight className="h-3 w-3" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-muted/50 py-16">
        <div className="mx-auto max-w-3xl text-center px-4">
          <h2 className="text-2xl font-bold">Free Tools, Zero Hassle</h2>
          <p className="mt-3 text-muted-foreground">
            All tools work directly in your browser. No installation, no sign-up, no limits.
            Your files never leave your device for client-side tools.
          </p>
        </div>
      </section>
    </>
  );
}
