"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { nowTs } from "@/lib/firestoreHelpers";

interface DashboardStats {
  trainers: number;
  exercises: number;
  myPlans: number;
  users: number;
  entries: number;
}

type GoalRing = {
  id?: string;
  uid?: string;
  label: string;
  value: number;
  unit: string;
  tone: string;
};

type KanbanColumns = {
  warmup: string[];
  main: string[];
  accessory: string[];
  cooldown: string[];
};

type Announcement = {
  id?: string;
  title: string;
  desc: string;
  bg: string;
};

type ClassTimelineItem = {
  id?: string;
  time: string;
  title: string;
  coach: string;
  capacity: number;
  total: number;
  status: "ongoing" | "next" | "upcoming";
};

type Transformation = {
  id?: string;
  uid?: string;
  name: string;
  type: "weight loss" | "strength" | "general fitness";
  before: string;
  after: string;
};

type Nutrition = {
  id?: string;
  uid?: string;
  targetFill: number;
  protein: number;
  carbs: number;
  fats: number;
};

type HealthSnapshot = {
  id?: string;
  uid?: string;
  sleepHours: number;
  hydrationLiters: number;
  injury: string;
  energy: string;
  recovery: string;
};

type Spotlight = {
  id?: string;
  uid?: string;
  name: string;
  image: string;
  streakDays: number;
  completionPct: number;
};

type Coach = {
  name: string;
  clients: number;
  retention: string;
  rating: string;
  perf: string;
};

type Achievement = {
  id: string;
  uid: string;
  label: string;
  unlocked: boolean;
  updatedAt?: unknown;
};

type ExerciseCard = {
  id: string;
  name: string;
  muscles: string;
  level: string;
  image: string;
};

const defaultAnnouncements: Announcement[] = [
  {
    title: "March Beast Challenge",
    desc: "Complete 18 sessions this month and unlock premium gym merch.",
    bg: "https://images.unsplash.com/photo-1517963628607-235ccdd5476d?auto=format&fit=crop&w=1600&q=80"
  },
  {
    title: "Strength Camp Week",
    desc: "Powerlifting-focused trainer blocks now open for registrations.",
    bg: "https://images.unsplash.com/photo-1570829460005-c840387bb1ca?auto=format&fit=crop&w=1600&q=80"
  },
  {
    title: "Summer Cut Offer",
    desc: "20% off on nutrition coaching plans till March 20.",
    bg: "https://images.unsplash.com/photo-1517130038641-a774d04afb3c?auto=format&fit=crop&w=1600&q=80"
  }
];

const defaultClassTimeline: ClassTimelineItem[] = [
  { time: "06:00", title: "HIIT Burner", coach: "Aarya", capacity: 18, total: 20, status: "ongoing" },
  { time: "07:30", title: "Strength Base", coach: "Rohit", capacity: 14, total: 20, status: "next" },
  { time: "09:00", title: "Mobility Core", coach: "Sonia", capacity: 11, total: 20, status: "upcoming" },
  { time: "18:00", title: "Athletic Conditioning", coach: "Kabir", capacity: 19, total: 22, status: "upcoming" }
];

const defaultTransformations: Transformation[] = [
  {
    name: "Riya",
    type: "weight loss",
    before: "https://images.unsplash.com/photo-1518310952931-b1de897abd40?auto=format&fit=crop&w=900&q=80",
    after: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Aman",
    type: "strength",
    before: "https://images.unsplash.com/photo-1604480132736-44c188fe4d20?auto=format&fit=crop&w=900&q=80",
    after: "https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Nina",
    type: "general fitness",
    before: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80",
    after: "https://images.unsplash.com/photo-1596357395217-80de13130e92?auto=format&fit=crop&w=900&q=80"
  }
];

const defaultHeatmapValues = [
  0, 1, 2, 3, 1, 0, 2, 1, 2, 4, 1, 0, 2, 3, 4, 2, 1, 0, 3, 4, 2, 1, 0, 2, 3, 2, 1, 0, 1, 2, 4, 3, 2, 1, 0
];

const defaultGoalRings: GoalRing[] = [
  { label: "Weight", value: 72, unit: "kg", tone: "#3ce6d5" },
  { label: "Body Fat", value: 18, unit: "%", tone: "#8efb5b" },
  { label: "Strength PR", value: 140, unit: "kg", tone: "#ffc857" },
  { label: "Consistency", value: 84, unit: "%", tone: "#ff7f50" }
];

const defaultNutrition: Nutrition = {
  targetFill: 78,
  protein: 30,
  carbs: 46,
  fats: 24
};

const defaultCoaches: Coach[] = [
  { name: "Rohit Verma", clients: 54, retention: "92%", rating: "4.9", perf: "+18%" },
  { name: "Sonia Iyer", clients: 47, retention: "90%", rating: "4.8", perf: "+15%" },
  { name: "Kabir Khan", clients: 39, retention: "88%", rating: "4.7", perf: "+11%" }
];

const defaultMasonryPhotos = [
  "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1584380931214-dbb5b72e7fd0?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?auto=format&fit=crop&w=1000&q=80"
];

const defaultExerciseCards: ExerciseCard[] = [
  {
    id: "default-squat",
    name: "Barbell Back Squat",
    muscles: "Quads / Glutes",
    level: "advanced",
    image: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "default-press",
    name: "Incline Dumbbell Press",
    muscles: "Chest / Shoulders",
    level: "intermediate",
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "default-kb-swing",
    name: "Kettlebell Swing",
    muscles: "Posterior Chain",
    level: "beginner",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80"
  }
];

const defaultCommandItems = [
  { label: "Go to Profile", href: "/profile" },
  { label: "Open Workout Plan", href: "/plans/workout" },
  { label: "Open Diet Plan", href: "/plans/diet" },
  { label: "Manage Trainers", href: "/trainers" },
  { label: "Open Data Entry", href: "/data-entry" },
  { label: "Explore Exercises", href: "/exercises" }
] as const;

const defaultHealthSnapshot: HealthSnapshot = {
  sleepHours: 7.4,
  hydrationLiters: 2.8,
  injury: "None",
  energy: "High",
  recovery: "Good"
};

const defaultSpotlight: Spotlight = {
  name: "Brad Fit",
  image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=600&q=80",
  streakDays: 16,
  completionPct: 85
};

const defaultKanban: KanbanColumns = {
  warmup: ["Jump Rope 5 min", "Dynamic Hip Openers"],
  main: ["Back Squat 5x5", "Bench Press 4x8"],
  accessory: ["Walking Lunges", "Cable Row"],
  cooldown: ["Hamstring Stretch", "Breathing Drill"]
};

const defaultAchievements = ["7-Day Streak", "100 Sessions", "5kg PR", "First Marathon"];

function ProgressCircle({ value, label, unit, tone }: GoalRing) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="app-card p-4 text-center">
      <div
        className="mx-auto grid h-24 w-24 place-items-center rounded-full"
        style={{
          background: `conic-gradient(${tone} ${pct * 3.6}deg, rgba(255,255,255,0.12) 0deg)`
        }}
      >
        <div className="grid h-16 w-16 place-items-center rounded-full bg-slate-950 text-white">
          <span className="text-sm font-semibold">{value}</span>
          <span className="text-[10px] uppercase text-slate-400">{unit}</span>
        </div>
      </div>
      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-cyan-300">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { authUser, appUser } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({ trainers: 0, exercises: 0, myPlans: 0, users: 0, entries: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [announcementIdx, setAnnouncementIdx] = useState(0);
  const [galleryFilter, setGalleryFilter] = useState<"all" | "weight loss" | "strength" | "general fitness">("all");
  const [compareSlider, setCompareSlider] = useState(50);
  const [macroFill, setMacroFill] = useState(0);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [drag, setDrag] = useState<{ from: keyof KanbanColumns; item: string } | null>(null);
  const [actionStatus, setActionStatus] = useState("");
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");

  const [announcements, setAnnouncements] = useState<Announcement[]>(defaultAnnouncements);
  const [classTimeline, setClassTimeline] = useState<ClassTimelineItem[]>(defaultClassTimeline);
  const [transformations, setTransformations] = useState<Transformation[]>(defaultTransformations);
  const [heatmapValues, setHeatmapValues] = useState<number[]>(defaultHeatmapValues);
  const [goalRings, setGoalRings] = useState<GoalRing[]>(defaultGoalRings);
  const [exerciseCards, setExerciseCards] = useState<ExerciseCard[]>(defaultExerciseCards);
  const [addedExercises, setAddedExercises] = useState<string[]>([]);
  const [nutrition, setNutrition] = useState<Nutrition>(defaultNutrition);
  const [coaches, setCoaches] = useState<Coach[]>(defaultCoaches);
  const [masonryPhotos, setMasonryPhotos] = useState<string[]>(defaultMasonryPhotos);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [healthSnapshot, setHealthSnapshot] = useState<HealthSnapshot>(defaultHealthSnapshot);
  const [spotlight, setSpotlight] = useState<Spotlight>(defaultSpotlight);
  const [kanban, setKanban] = useState<KanbanColumns>(defaultKanban);

  useEffect(() => {
    const load = async () => {
      if (!authUser) return;
      setLoading(true);
      setError("");
      try {
        const [trainersRes, exercisesRes, myPlansRes, entriesRes, usersRes] = await Promise.allSettled([
          getDocs(collection(db, "trainers")),
          getDocs(collection(db, "exercises")),
          getDocs(query(collection(db, "plans"), where("uid", "==", authUser.uid))),
          getDocs(query(collection(db, "entries"), where("uid", "==", authUser.uid))),
          appUser?.role === "admin" ? getDocs(collection(db, "users")) : Promise.resolve(null)
        ]);

        const entryDocs = entriesRes.status === "fulfilled" ? entriesRes.value.docs : [];

        setStats({
          trainers: trainersRes.status === "fulfilled" ? trainersRes.value.size : 0,
          exercises: exercisesRes.status === "fulfilled" ? exercisesRes.value.size : 0,
          myPlans: myPlansRes.status === "fulfilled" ? myPlansRes.value.size : 0,
          entries: entryDocs.length,
          users: usersRes.status === "fulfilled" && usersRes.value ? usersRes.value.size : 0
        });

        if (entryDocs.length > 0) {
          const days = Array.from({ length: 35 }, () => 0);
          entryDocs.forEach((d) => {
            const data = d.data() as { date?: string };
            if (!data.date) return;
            const idx = Math.min(Math.max(Number.parseInt(data.date.slice(-2), 10) % 35, 0), 34);
            days[idx] = Math.min(days[idx] + 1, 4);
          });
          setHeatmapValues(days);
        }

        if ([trainersRes, exercisesRes, myPlansRes, entriesRes].some((result) => result.status === "rejected")) {
          setError("Some dashboard data could not be loaded. Check Firestore rules deployment.");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authUser, appUser?.role]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!authUser) return;
      try {
        const [
          announcementsRes,
          timelineRes,
          transformationsRes,
          nutritionRes,
          photosRes,
          goalsRes,
          achievementsRes,
          healthRes,
          spotlightRes,
          selectedExercisesRes,
          trainersRes,
          exercisesRes
        ] = await Promise.allSettled([
          getDocs(collection(db, "dashboardAnnouncements")),
          getDocs(collection(db, "dashboardClassTimeline")),
          getDocs(collection(db, "dashboardTransformations")),
          getDocs(query(collection(db, "dashboardNutrition"), where("uid", "==", authUser.uid))),
          getDocs(collection(db, "dashboardPhotos")),
          getDocs(query(collection(db, "dashboardGoalRings"), where("uid", "==", authUser.uid))),
          getDocs(query(collection(db, "dashboardAchievements"), where("uid", "==", authUser.uid))),
          getDocs(query(collection(db, "dashboardHealthSnapshots"), where("uid", "==", authUser.uid))),
          getDocs(query(collection(db, "dashboardSpotlights"), where("uid", "==", authUser.uid))),
          getDocs(query(collection(db, "dashboardExerciseSelections"), where("uid", "==", authUser.uid))),
          getDocs(collection(db, "trainers")),
          getDocs(collection(db, "exercises"))
        ]);

      if (announcementsRes.status === "fulfilled" && announcementsRes.value.size > 0) {
        setAnnouncements(announcementsRes.value.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Announcement, "id">) })));
      }

      if (timelineRes.status === "fulfilled" && timelineRes.value.size > 0) {
        setClassTimeline(timelineRes.value.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ClassTimelineItem, "id">) })));
      }

      if (transformationsRes.status === "fulfilled" && transformationsRes.value.size > 0) {
        setTransformations(
          transformationsRes.value.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Transformation, "id">) }))
        );
      }

      if (nutritionRes.status === "fulfilled" && nutritionRes.value.size > 0) {
        const nutritionDoc = nutritionRes.value.docs[0].data() as Nutrition;
        setNutrition({
          targetFill: nutritionDoc.targetFill ?? defaultNutrition.targetFill,
          protein: nutritionDoc.protein ?? defaultNutrition.protein,
          carbs: nutritionDoc.carbs ?? defaultNutrition.carbs,
          fats: nutritionDoc.fats ?? defaultNutrition.fats
        });
      }

      if (photosRes.status === "fulfilled" && photosRes.value.size > 0) {
        setMasonryPhotos(
          photosRes.value.docs
            .map((d) => (d.data() as { image?: string }).image)
            .filter((img): img is string => Boolean(img))
        );
      }

      if (goalsRes.status === "fulfilled" && goalsRes.value.size > 0) {
        setGoalRings(goalsRes.value.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<GoalRing, "id">) })));
      }

      if (achievementsRes.status === "fulfilled" && achievementsRes.value.size > 0) {
        setAchievements(achievementsRes.value.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Achievement, "id">) })));
      } else {
        const fallbackAchievements = defaultAchievements.map((label, idx) => ({
          id: `local-${idx}`,
          uid: authUser.uid,
          label,
          unlocked: idx === 0
        }));
        setAchievements(fallbackAchievements);
      }

      if (healthRes.status === "fulfilled" && healthRes.value.size > 0) {
        setHealthSnapshot(healthRes.value.docs[0].data() as HealthSnapshot);
      }

      if (spotlightRes.status === "fulfilled" && spotlightRes.value.size > 0) {
        setSpotlight(spotlightRes.value.docs[0].data() as Spotlight);
      }

      if (selectedExercisesRes.status === "fulfilled") {
        setAddedExercises(
          selectedExercisesRes.value.docs
            .map((d) => (d.data() as { exerciseName?: string }).exerciseName)
            .filter((name): name is string => Boolean(name))
        );
      }

      if (trainersRes.status === "fulfilled" && trainersRes.value.size > 0) {
        const trainerRows = trainersRes.value.docs.map((d) => d.data() as Record<string, unknown>);
        setCoaches(
          trainerRows.slice(0, 5).map((t, idx) => ({
            name: typeof t.name === "string" ? t.name : `Coach ${idx + 1}`,
            clients: typeof t.activeClients === "number" ? t.activeClients : 25 + idx * 6,
            retention: typeof t.retention === "string" ? t.retention : `${88 + idx}%`,
            rating: typeof t.rating === "string" ? t.rating : (4.6 + idx * 0.1).toFixed(1),
            perf: typeof t.monthlyPerformance === "string" ? t.monthlyPerformance : `+${10 + idx * 3}%`
          }))
        );
      }

      if (exercisesRes.status === "fulfilled" && exercisesRes.value.size > 0) {
        setExerciseCards(
          exercisesRes.value.docs.slice(0, 6).map((d) => {
            const ex = d.data() as Record<string, unknown>;
            return {
              id: d.id,
              name: typeof ex.name === "string" ? ex.name : "Exercise",
              muscles: typeof ex.muscleGroup === "string" ? ex.muscleGroup : "Full Body",
              level: typeof ex.difficulty === "string" ? ex.difficulty : "intermediate",
              image:
                typeof ex.imageUrl === "string" && ex.imageUrl
                  ? ex.imageUrl
                  : "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=900&q=80"
            };
          })
        );
      }

        try {
          const boardSnap = await getDoc(doc(db, "dashboardKanbanBoards", authUser.uid));
          if (boardSnap.exists()) {
            const board = boardSnap.data() as { columns?: KanbanColumns };
            if (board.columns) setKanban(board.columns);
          }
        } catch {
          // keep default kanban layout when board access is blocked
        }
      } catch {
        setActionStatus("Some dashboard backend collections are blocked by Firestore rules.");
      }
    };

    loadDashboardData();
  }, [authUser]);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIdx((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setMacroFill((prev) => (prev >= nutrition.targetFill ? nutrition.targetFill : prev + 2));
    }, 40);
    return () => clearInterval(timer);
  }, [nutrition.targetFill]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setCommandOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const transformationFiltered = useMemo(() => {
    if (galleryFilter === "all") return transformations;
    return transformations.filter((item) => item.type === galleryFilter);
  }, [galleryFilter, transformations]);

  const filteredCommands = useMemo(() => {
    const q = commandQuery.trim().toLowerCase();
    if (!q) return defaultCommandItems;
    return defaultCommandItems.filter((item) => item.label.toLowerCase().includes(q));
  }, [commandQuery]);

  const onDropCard = async (to: keyof KanbanColumns) => {
    if (!drag || !authUser) return;
    if (drag.from === to) return;

    const next = {
      ...kanban,
      [drag.from]: kanban[drag.from].filter((card) => card !== drag.item),
      [to]: [...kanban[to], drag.item]
    };
    setKanban(next);
    setDrag(null);

    try {
      await setDoc(
        doc(db, "dashboardKanbanBoards", authUser.uid),
        {
          uid: authUser.uid,
          columns: next,
          updatedAt: nowTs()
        },
        { merge: true }
      );
    } catch {
      setActionStatus("Cannot save kanban update. Check Firestore rules.");
    }
  };

  const addExerciseToPlan = async (exercise: ExerciseCard) => {
    if (!authUser) return;
    if (addedExercises.includes(exercise.name)) return;

    try {
      await addDoc(collection(db, "dashboardExerciseSelections"), {
        uid: authUser.uid,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        createdAt: nowTs()
      });
      setAddedExercises((prev) => [...prev, exercise.name]);
    } catch {
      setActionStatus("Cannot add exercise selection. Check Firestore rules.");
    }
  };

  const unlockNextBadge = async () => {
    if (!authUser) return;
    const nextLocked = achievements.find((badge) => !badge.unlocked);
    if (!nextLocked) return;

    try {
      if (nextLocked.id.startsWith("local-")) {
        const docRef = doc(collection(db, "dashboardAchievements"));
        await setDoc(docRef, {
          uid: authUser.uid,
          label: nextLocked.label,
          unlocked: true,
          updatedAt: nowTs()
        });
        setAchievements((prev) => prev.map((badge) => (badge.id === nextLocked.id ? { ...badge, unlocked: true } : badge)));
        return;
      }

      await updateDoc(doc(db, "dashboardAchievements", nextLocked.id), {
        unlocked: true,
        updatedAt: nowTs()
      });
      setAchievements((prev) => prev.map((badge) => (badge.id === nextLocked.id ? { ...badge, unlocked: true } : badge)));
    } catch {
      setActionStatus("Cannot unlock badge. Check Firestore rules.");
    }
  };

  const logAction = async (action: string) => {
    if (!authUser) return;
    try {
      await addDoc(collection(db, "dashboardActionLogs"), {
        uid: authUser.uid,
        action,
        createdAt: nowTs()
      });
      setActionStatus(`${action} logged to Firestore.`);
      setTimeout(() => setActionStatus(""), 1500);
    } catch {
      setActionStatus("Cannot log action. Check Firestore rules.");
    }
  };

  const sendSpotlightMessage = async () => {
    if (!authUser) return;
    if (!messageText.trim()) {
      setActionStatus("Please write a message first.");
      return;
    }
    try {
      await addDoc(collection(db, "dashboardActionLogs"), {
        uid: authUser.uid,
        action: "Spotlight Message",
        target: spotlight.name,
        message: messageText.trim(),
        createdAt: nowTs()
      });
      setActionStatus("Message sent.");
      setMessageText("");
      setMessageModalOpen(false);
      setTimeout(() => setActionStatus(""), 1500);
    } catch {
      setActionStatus("Cannot send message. Check Firestore rules.");
    }
  };

  const assignPlanToSpotlight = async () => {
    if (!authUser) return;
    try {
      await addDoc(collection(db, "dashboardActionLogs"), {
        uid: authUser.uid,
        action: "Assign Plan",
        target: spotlight.name,
        createdAt: nowTs()
      });
    } catch {
      // Continue navigation even if logging fails
    }
    router.push("/plans/workout");
  };

  const currentAnnouncement = announcements[announcementIdx] ?? defaultAnnouncements[0];

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="page-title mb-0">Dashboard</h2>
          <button className="subtle-btn" onClick={() => setCommandOpen(true)}>
            Cmd/Ctrl + K
          </button>
        </div>
        {error && <p className="mb-4 text-sm text-amber-300">{error}</p>}
        {actionStatus && <p className="mb-4 text-sm text-emerald-300">{actionStatus}</p>}

        <section className="app-card relative mb-6 overflow-hidden p-6">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(110deg, rgba(4,10,18,0.78), rgba(4,10,18,0.62)), url('${currentAnnouncement.bg}')`
            }}
          />
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Announcements Carousel</p>
            <h3 className="mt-2 text-3xl text-white sm:text-4xl">{currentAnnouncement.title}</h3>
            <p className="mt-2 max-w-2xl text-slate-200">{currentAnnouncement.desc}</p>
          </div>
        </section>

        {loading ? (
          <p className="text-sm text-slate-300">Loading dashboard...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="app-card p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Trainers</p>
              <p className="mt-2 text-3xl font-semibold text-white">{stats.trainers}</p>
            </div>
            <div className="app-card p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Exercises</p>
              <p className="mt-2 text-3xl font-semibold text-white">{stats.exercises}</p>
            </div>
            <div className="app-card p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">My Plans</p>
              <p className="mt-2 text-3xl font-semibold text-white">{stats.myPlans}</p>
            </div>
            <div className="app-card p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Data Entries</p>
              <p className="mt-2 text-3xl font-semibold text-white">{stats.entries}</p>
            </div>
            {appUser?.role === "admin" && (
              <div className="app-card p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Users</p>
                <p className="mt-2 text-3xl font-semibold text-white">{stats.users}</p>
              </div>
            )}
          </div>
        )}

        <section className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_1fr]">
          <article className="app-card p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Member Spotlight</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-[140px_1fr]">
              <div className="relative mx-auto h-32 w-32">
                <div className="h-full w-full rounded-full bg-cover bg-center" style={{ backgroundImage: `url('${spotlight.image}')` }} />
                <div
                  className="absolute -inset-2 rounded-full"
                  style={{
                    background: `conic-gradient(#3ce6d5 ${Math.min(spotlight.completionPct, 100) * 3.6}deg, rgba(255,255,255,0.15) 0deg)`,
                    zIndex: -1
                  }}
                />
              </div>
              <div>
                <h3 className="text-2xl text-white">{spotlight.name}</h3>
                <p className="text-sm text-slate-300">
                  Attendance streak: {spotlight.streakDays} days • Goal completion: {spotlight.completionPct}%
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <button className="accent-btn" onClick={() => setMessageModalOpen(true)}>
                    Message
                  </button>
                  <button className="subtle-btn" onClick={assignPlanToSpotlight}>
                    Assign Plan
                  </button>
                  <button className="subtle-btn" onClick={() => router.push("/profile")}>
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          </article>

          <article className="app-card p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Client Health Snapshot</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                `Sleep ${healthSnapshot.sleepHours}h`,
                `Hydration ${healthSnapshot.hydrationLiters}L`,
                `Injury: ${healthSnapshot.injury}`,
                `Energy: ${healthSnapshot.energy}`,
                `Recovery: ${healthSnapshot.recovery}`
              ].map((item) => (
                <span key={item} className="rounded-full border border-cyan-300/35 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
                  {item}
                </span>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <article className="app-card p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Today&apos;s Class Timeline</p>
            <div className="mt-4 space-y-3">
              {classTimeline.map((slot, idx) => {
                const pct = Math.round((slot.capacity / slot.total) * 100);
                return (
                  <div key={slot.id ?? `${slot.time}-${idx}`} className="rounded-xl border border-white/15 bg-slate-900/40 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-white">
                        {slot.time} • {slot.title}
                      </p>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${
                          slot.status === "ongoing"
                            ? "bg-lime-300/20 text-lime-200"
                            : slot.status === "next"
                              ? "bg-cyan-300/20 text-cyan-100"
                              : "bg-white/10 text-slate-200"
                        }`}
                      >
                        {slot.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-300">Coach: {slot.coach}</p>
                    <div className="mt-2 h-2 rounded-full bg-white/10">
                      <div className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-lime-300" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {slot.capacity}/{slot.total} seats filled
                    </p>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="app-card p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Goal Progress Rings</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {goalRings.map((ring, idx) => (
                <ProgressCircle key={ring.id ?? `${ring.label}-${idx}`} {...ring} />
              ))}
            </div>
          </article>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <article className="app-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Transformation Gallery</p>
              <div className="flex flex-wrap gap-2">
                {(["all", "weight loss", "strength", "general fitness"] as const).map((f) => (
                  <button
                    key={f}
                    className={galleryFilter === f ? "accent-btn" : "subtle-btn"}
                    onClick={() => setGalleryFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {transformationFiltered.map((item, idx) => (
                <div key={item.id ?? `${item.name}-${idx}`} className="overflow-hidden rounded-xl border border-white/20">
                  <div className="relative h-48 bg-black">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${item.after}')` }} />
                    <div
                      className="absolute inset-y-0 left-0 bg-cover bg-center"
                      style={{ width: `${compareSlider}%`, backgroundImage: `url('${item.before}')` }}
                    />
                    <div className="absolute inset-y-0" style={{ left: `${compareSlider}%`, width: 2, background: "#fff" }} />
                  </div>
                  <div className="bg-slate-950/60 p-3">
                    <p className="text-sm font-semibold text-white">{item.name}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-300">{item.type}</p>
                  </div>
                </div>
              ))}
            </div>
            <input
              className="mt-4 w-full"
              type="range"
              min={10}
              max={90}
              value={compareSlider}
              onChange={(e) => setCompareSlider(Number(e.target.value))}
            />
          </article>

          <article className="app-card p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Workout Heatmap</p>
            <div className="mt-4 grid grid-cols-7 gap-1">
              {heatmapValues.map((value, idx) => (
                <div
                  key={idx}
                  className="h-6 rounded"
                  style={{
                    background:
                      value === 0
                        ? "rgba(255,255,255,0.08)"
                        : value === 1
                          ? "rgba(60,230,213,0.35)"
                          : value === 2
                            ? "rgba(60,230,213,0.55)"
                            : value === 3
                              ? "rgba(177,255,79,0.65)"
                              : "rgba(177,255,79,0.9)"
                  }}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
              <span>Low</span>
              <span>High</span>
            </div>
          </article>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <article className="app-card p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Exercise Library Cards</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {exerciseCards.map((exercise) => (
                <div key={exercise.id} className="overflow-hidden rounded-2xl border border-white/20 bg-slate-900/45">
                  <div className="h-36 bg-cover bg-center" style={{ backgroundImage: `url('${exercise.image}')` }} />
                  <div className="p-3">
                    <p className="font-medium text-white">{exercise.name}</p>
                    <p className="mt-1 text-xs text-slate-300">{exercise.muscles}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-cyan-300/15 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-100">
                        {exercise.level}
                      </span>
                      <button
                        className={addedExercises.includes(exercise.name) ? "subtle-btn" : "accent-btn"}
                        onClick={() => addExerciseToPlan(exercise)}
                      >
                        {addedExercises.includes(exercise.name) ? "Added" : "Add to plan"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="app-card p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Nutrition Macro Wheel</p>
            <div className="mt-4 grid place-items-center">
              <div
                className="grid h-40 w-40 place-items-center rounded-full"
                style={{
                  background: `conic-gradient(#3ce6d5 0 ${nutrition.protein * 3.6}deg, #b1ff4f ${nutrition.protein * 3.6}deg ${(nutrition.protein + nutrition.carbs) * 3.6}deg, #ffc857 ${(nutrition.protein + nutrition.carbs) * 3.6}deg ${macroFill * 3.6}deg, rgba(255,255,255,0.12) 0deg)`
                }}
              >
                <div className="grid h-24 w-24 place-items-center rounded-full bg-slate-950 text-white">
                  <p className="text-lg font-semibold">{macroFill}%</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">target</p>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-1 text-xs text-slate-200">
              <p>Protein: {nutrition.protein}%</p>
              <p>Carbs: {nutrition.carbs}%</p>
              <p>Fats: {nutrition.fats}%</p>
            </div>
          </article>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_1.15fr]">
          <article className="app-card p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Coach Leaderboard</p>
            <div className="mt-4 space-y-2">
              {coaches.map((coach, idx) => (
                <div key={coach.name} className="rounded-xl border border-white/15 bg-slate-900/40 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-white">
                      #{idx + 1} {coach.name}
                    </p>
                    <span className="text-sm text-lime-200">{coach.perf}</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Clients: {coach.clients} • Retention: {coach.retention} • Rating: {coach.rating}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="app-card p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Plan Builder Kanban</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {(Object.keys(kanban) as (keyof KanbanColumns)[]).map((col) => (
                <div
                  key={col}
                  className="rounded-xl border border-white/15 bg-slate-900/40 p-3"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDropCard(col)}
                >
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] text-cyan-300">{col}</p>
                  <div className="space-y-2">
                    {kanban[col].map((item) => (
                      <div
                        key={item}
                        className="cursor-move rounded-lg border border-white/20 bg-slate-900/70 px-2 py-2 text-xs text-slate-100"
                        draggable
                        onDragStart={() => setDrag({ from: col, item })}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <article className="app-card p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Achievement Badges</p>
              <button className="subtle-btn" onClick={unlockNextBadge}>
                Simulate Unlock
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {achievements.map((badge) => (
                <div
                  key={badge.id}
                  className={`rounded-xl border p-3 text-center text-xs uppercase tracking-[0.18em] ${
                    badge.unlocked
                      ? "animate-pulse border-lime-300/40 bg-lime-300/10 text-lime-100"
                      : "border-white/15 bg-white/5 text-slate-300"
                  }`}
                >
                  {badge.label}
                </div>
              ))}
            </div>
          </article>

          <article className="app-card p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Photo Masonry Feed</p>
            <div className="mt-4 columns-2 gap-3 md:columns-3">
              {masonryPhotos.map((url, idx) => (
                <div key={`${url}-${idx}`} className="mb-3 break-inside-avoid overflow-hidden rounded-xl border border-white/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Gym vibe ${idx + 1}`} className="h-auto w-full" />
                </div>
              ))}
            </div>
          </article>
        </section>

        <div className="fixed right-4 bottom-4 z-40 flex flex-col gap-2">
          {["Add Member", "Log Entry", "Create Plan", "Broadcast Message"].map((action, idx) => (
            <button key={action} className={idx === 0 ? "accent-btn" : "subtle-btn"} onClick={() => logAction(action)}>
              {action}
            </button>
          ))}
        </div>

        {commandOpen && (
          <div className="fixed inset-0 z-50 grid place-items-start bg-slate-950/70 p-4 pt-24" onClick={() => setCommandOpen(false)}>
            <div className="app-card w-full max-w-xl p-4" onClick={(e) => e.stopPropagation()}>
              <input
                autoFocus
                placeholder="Search command..."
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
              />
              <div className="mt-3 space-y-2">
                {filteredCommands.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block rounded-lg border border-white/15 px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
                    onClick={() => setCommandOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                {filteredCommands.length === 0 && <p className="text-sm text-slate-300">No command found.</p>}
              </div>
            </div>
          </div>
        )}

        {messageModalOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4" onClick={() => setMessageModalOpen(false)}>
            <div className="app-card w-full max-w-lg p-4" onClick={(e) => e.stopPropagation()}>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Message Member</p>
              <h3 className="mt-2 text-xl text-white">Send to {spotlight.name}</h3>
              <textarea
                className="mt-3"
                rows={5}
                placeholder="Write your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <div className="mt-3 flex justify-end gap-2">
                <button className="subtle-btn" onClick={() => setMessageModalOpen(false)}>
                  Cancel
                </button>
                <button className="accent-btn" onClick={sendSpotlightMessage}>
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
