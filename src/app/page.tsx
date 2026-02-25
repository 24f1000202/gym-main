import Link from "next/link";

const features = [
  "Registration + Login (Firebase Auth)",
  "Dashboard + Data Entry CRUD",
  "Trainer and Exercise information",
  "Diet plan based on weight + height + goal",
  "Workout plan based on goal",
  "Admin panel with role-based control"
];

export default function LandingPage() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="app-card relative overflow-hidden p-8 sm:p-12">
          <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Gym Management Platform</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Run your gym with one clean dashboard.
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Fast MVP for member management, trainer/exercise catalogs, and intelligent diet/workout plans powered by
            Firebase Auth + Firestore.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="accent-btn inline-block">
              Start Free
            </Link>
            <Link href="/login" className="subtle-btn inline-block">
              Login
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature} className="app-card p-5">
              <p className="text-sm text-slate-200">{feature}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
