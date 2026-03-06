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
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Gym Management Platform</p>
          <h1 className="text-glow mt-4 max-w-2xl text-5xl tracking-tight text-white sm:text-6xl">
            Complete Daily <span className="text-cyan-300">Workout</span> Control.
          </h1>
          <p className="mt-4 max-w-2xl text-slate-200">
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
          <div className="mt-8 photo-strip">
            <div
              className="photo-tile"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=80')"
              }}
            >
              <span>Push Day</span>
            </div>
            <div
              className="photo-tile"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80')"
              }}
            >
              <span>Functional</span>
            </div>
            <div
              className="photo-tile"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80')"
              }}
            >
              <span>Conditioning</span>
            </div>
            <div
              className="photo-tile"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80')"
              }}
            >
              <span>Core Work</span>
            </div>
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
