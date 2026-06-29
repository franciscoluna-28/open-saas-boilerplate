import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  ShieldCheck,
  Database,
  CloudUpload,
  Mail,
  Palette,
  Container,
  ArrowRight,
  GitMerge,
  Sparkles,
  Gauge,
  Puzzle,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Auth",
    description: "Email/password, social login, 2FA, rate limiting, and session management with Better Auth.",
  },
  {
    icon: Database,
    title: "Database",
    description: "Type-safe queries with Drizzle ORM, PostgreSQL, and auto-generated migrations out of the box.",
  },
  {
    icon: CloudUpload,
    title: "File Uploads",
    description: "S3-compatible storage with MinIO in dev and any S3 provider in production. Signed URLs included.",
  },
  {
    icon: Mail,
    title: "Email",
    description: "Transactional emails with Resend — password resets, welcome emails, and more, ready to go.",
  },
  {
    icon: Palette,
    title: "UI Kit",
    description: "shadcn/ui components with dark mode, Tailwind CSS v4, and full theming via next-themes.",
  },
  {
    icon: Container,
    title: "Local Dev",
    description: "PostgreSQL + MinIO via Docker Compose. One command to spin up everything you need.",
  },
];

const perks = [
  { icon: Gauge, text: "Production-ready from day one" },
  { icon: Puzzle, text: "Modular architecture — use what you need" },
  { icon: Sparkles, text: "Built by a founding engineer who's shipped SaaS" },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold">
            <Rocket className="size-5 text-primary" />
            <span>next-saas</span>
          </div>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <Badge variant="secondary" className="mb-4 gap-1.5">
          <Sparkles className="size-3" />
          SaaS Starter Template
        </Badge>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Ship your SaaS faster.
          <br />
          <span className="text-muted-foreground">Without the boilerplate.</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          A production-ready Next.js starter built by a founding engineer who&apos;s been through the
          startup cycle. Auth, database, file uploads, emails — everything you need to launch.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/register">
              Start Building
              <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a
              href="https://github.com/your-org/next-saas"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitMerge className="mr-1.5 size-4" />
              GitHub
            </a>
          </Button>
        </div>

        {/* Perks */}
        <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3">
          {perks.map((perk) => (
            <div key={perk.text} className="flex items-center gap-2 text-sm text-muted-foreground">
              <perk.icon className="size-4 text-primary" />
              {perk.text}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Everything you need to ship</h2>
            <p className="mt-2 text-muted-foreground">
              No more wiring up auth, storage, and databases from scratch.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border bg-card p-6 transition-colors hover:bg-muted/50"
              >
                <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="mb-1.5 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Badge className="mb-4 gap-1.5" variant="secondary">
            <Rocket className="size-3" />
            Get started in minutes
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight">Ready to launch?</h2>
          <p className="mt-2 text-muted-foreground">
            Clone the repo, run one command, and you&apos;ve got a fully functional SaaS app with
            auth, database, and file uploads.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/register">
                Create your account
                <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-sm text-muted-foreground">
          <span>next-saas</span>
          <span>Built by a founding engineer for founders.</span>
        </div>
      </footer>
    </div>
  );
}
