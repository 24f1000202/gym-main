import { Exercise, GoalType } from "@/types";
import { defaultExercises } from "./defaultExercises";

interface DietInput {
  heightCm: number;
  weightKg: number;
  goal: GoalType;
  age?: number;
  gender?: string;
  activityLevel?: "low" | "medium" | "high";
}

interface WorkoutInput {
  goal: GoalType;
  difficulty: "beginner" | "intermediate" | "advanced";
  daysPerWeek: 3 | 4 | 5;
  exercises: Exercise[];
}

const activityMultipliers = {
  low: 1.35,
  medium: 1.5,
  high: 1.7
};

const goalAdjustment: Record<GoalType, number> = {
  bulk: 250,
  cut: -350,
  maintain: 0
};

const foodBank = {
  breakfast: [
    "Oats + whey + banana",
    "Poha + boiled eggs",
    "Greek yogurt + fruit + nuts",
    "Paneer sandwich + milk"
  ],
  lunch: [
    "Rice + chicken/tofu + salad",
    "Roti + dal + paneer + veggies",
    "Quinoa + fish/chickpeas + greens",
    "Khichdi + curd + cucumber"
  ],
  dinner: [
    "Lean protein + sweet potato + vegetables",
    "Roti + mixed veg + dal",
    "Grilled paneer/chicken + stir-fry veggies",
    "Rice + rajma + salad"
  ],
  snacks: [
    "Fruit + peanut butter",
    "Whey shake + almonds",
    "Roasted chana + buttermilk",
    "Sprouts chaat"
  ]
};

function rotatePick(items: string[], index: number) {
  return items[index % items.length];
}

function estimateBmr(input: DietInput) {
  const age = input.age ?? 25;
  const isFemale = input.gender?.toLowerCase().includes("f");
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * age;
  return Math.round(base + (isFemale ? -161 : 5));
}

export function generateDietPlan(input: DietInput) {
  const bmi = input.weightKg / Math.pow(input.heightCm / 100, 2);
  const bmr = estimateBmr(input);
  const activity = activityMultipliers[input.activityLevel ?? "medium"];

  let calories = Math.round(bmr * activity + goalAdjustment[input.goal]);
  calories = Math.max(1200, calories);

  const proteinFactor = input.goal === "bulk" ? 1.9 : input.goal === "cut" ? 2.1 : 1.7;
  const fatFactor = input.goal === "cut" ? 0.7 : 0.85;
  const proteinG = Math.round(input.weightKg * proteinFactor);
  const fatG = Math.round(input.weightKg * fatFactor);
  const carbsG = Math.max(0, Math.round((calories - (proteinG * 4 + fatG * 9)) / 4));

  const mealCalorieSplit = [0.26, 0.32, 0.3, 0.12];
  const macroFocus =
    input.goal === "bulk"
      ? "Add carbs around workout window for performance and recovery."
      : input.goal === "cut"
        ? "Keep protein high and use low-calorie high-fiber foods."
        : "Balance carbs/fats while keeping protein steady.";

  const sevenDayPlan = Array.from({ length: 7 }, (_, i) => ({
    day: `Day ${i + 1}`,
    meals: {
      breakfast: `${rotatePick(foodBank.breakfast, i)} (~${Math.round(calories * mealCalorieSplit[0])} kcal)`,
      lunch: `${rotatePick(foodBank.lunch, i + 1)} (~${Math.round(calories * mealCalorieSplit[1])} kcal)`,
      dinner: `${rotatePick(foodBank.dinner, i + 2)} (~${Math.round(calories * mealCalorieSplit[2])} kcal)`,
      snacks: `${rotatePick(foodBank.snacks, i + 3)} (~${Math.round(calories * mealCalorieSplit[3])} kcal)`
    },
    notes: `${macroFocus} Hydration target: ${Math.max(2.5, Number((input.weightKg * 0.035).toFixed(1)))} L/day.`
  }));

  return {
    summary: `${input.goal.toUpperCase()} diet: ~${calories} kcal/day, Protein ${proteinG}g, Fat ${fatG}g, Carbs ${carbsG}g`,
    metrics: { bmi: Number(bmi.toFixed(1)), bmr, calories, proteinG, fatG, carbsG },
    input,
    sevenDayPlan
  };
}

const musclePriority: Record<GoalType, string[]> = {
  bulk: ["chest", "back", "legs", "shoulders", "arms", "core"],
  cut: ["legs", "back", "chest", "core", "shoulders", "arms"],
  maintain: ["legs", "back", "chest", "shoulders", "core", "arms"]
};

function uniqueByName(exercises: Exercise[]) {
  return exercises.filter((item, index, arr) => arr.findIndex((a) => a.name === item.name) === index);
}

function findExercise(pool: Exercise[], muscle: string, difficulty: WorkoutInput["difficulty"], dayOffset: number) {
  const sameMuscle = pool.filter((e) => e.muscleGroup.toLowerCase() === muscle.toLowerCase());
  const byDifficulty = sameMuscle.filter((e) => e.difficulty === difficulty);
  const candidates = byDifficulty.length > 0 ? byDifficulty : sameMuscle;
  return candidates.length > 0 ? candidates[dayOffset % candidates.length] : null;
}

function buildDailyFocus(goal: GoalType, daysPerWeek: 3 | 4 | 5) {
  const ordered = musclePriority[goal];
  const slots = daysPerWeek * (goal === "cut" ? 3 : 4);
  return Array.from({ length: daysPerWeek }, (_, dayIndex) => {
    const start = (dayIndex * 2) % ordered.length;
    const muscles = Array.from({ length: goal === "cut" ? 3 : 4 }, (_, i) => ordered[(start + i) % ordered.length]);
    return { dayIndex, muscles };
  }).slice(0, Math.ceil(slots / (goal === "cut" ? 3 : 4)));
}

export function generateWorkoutPlan(input: WorkoutInput) {
  const pool = uniqueByName(input.exercises.length ? input.exercises : defaultExercises);
  const focusDays = buildDailyFocus(input.goal, input.daysPerWeek);

  const sets = input.goal === "bulk" ? (input.difficulty === "advanced" ? 5 : 4) : 3;
  const reps =
    input.goal === "bulk"
      ? "6-12"
      : input.goal === "cut"
        ? "10-15"
        : input.difficulty === "advanced"
          ? "6-10"
          : "8-12";

  const schedule = focusDays.map(({ dayIndex, muscles }, idx) => {
    const selected = muscles
      .map((muscle, mIndex) => findExercise(pool, muscle, input.difficulty, dayIndex + mIndex))
      .filter((e): e is Exercise => Boolean(e));

    const fallback = pool.slice(0, Math.max(4, 6 - selected.length));
    const exercises = uniqueByName([...selected, ...fallback]).slice(0, 6).map((exercise) => ({
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      sets,
      reps
    }));

    const cardioNote =
      input.goal === "cut"
        ? `+ ${20 + idx * 5} min cardio after training`
        : input.goal === "maintain"
          ? "+ 10-15 min light cardio or mobility"
          : "+ keep rest 90-120 sec for compound lifts";

    return {
      day: `Day ${idx + 1}`,
      title: `Focus: ${muscles.map((m) => m[0].toUpperCase() + m.slice(1)).join(" / ")}`,
      note: `${input.difficulty} intensity, progressive overload weekly ${cardioNote}`,
      exercises
    };
  });

  return {
    summary: `${input.goal.toUpperCase()} workout: ${input.daysPerWeek} days/week (${input.difficulty}) with adaptive exercise selection`,
    input: {
      goal: input.goal,
      difficulty: input.difficulty,
      daysPerWeek: input.daysPerWeek
    },
    schedule
  };
}
