import { Exercise } from "@/types";

export const defaultExercises: Exercise[] = [
  {
    name: "Push-Up",
    muscleGroup: "chest",
    equipment: "bodyweight",
    difficulty: "beginner",
    instructions: "Keep body straight, lower chest, press up.",
    imageUrl: "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Bodyweight Squat",
    muscleGroup: "legs",
    equipment: "bodyweight",
    difficulty: "beginner",
    instructions: "Hip-width stance, sit back and down, stand up.",
    imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Bent-Over Row",
    muscleGroup: "back",
    equipment: "dumbbell",
    difficulty: "intermediate",
    instructions: "Hinge hips, pull dumbbells to lower ribs, control down.",
    imageUrl: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Dumbbell Shoulder Press",
    muscleGroup: "shoulders",
    equipment: "dumbbell",
    difficulty: "beginner",
    instructions: "Press overhead without arching lower back.",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Plank",
    muscleGroup: "core",
    equipment: "bodyweight",
    difficulty: "beginner",
    instructions: "Brace core and hold neutral spine.",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Bicep Curl",
    muscleGroup: "arms",
    equipment: "dumbbell",
    difficulty: "beginner",
    instructions: "Keep elbows close, curl and lower under control.",
    imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=80"
  }
];
