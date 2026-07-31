export type AdminRole = 
  | 'superAdmin'
  | 'admin'
  | 'contentEditor'
  | 'nutritionReviewer'
  | 'exerciseReviewer'
  | 'support';

export type EditorialStatus = 
  | 'draft'
  | 'inReview'
  | 'changesRequested'
  | 'approved'
  | 'published'
  | 'archived';

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: AdminRole;
  photoURL?: string | null;
}

export interface MediaAsset {
  imageUrl?: string;
  imageAssetKey?: string;
  videoUrl?: string;
  videoAssetKey?: string;
  altText?: string;
  license?: string;
  source?: string;
}

// 1. Receitas
export interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  gramsEquivalent?: number;
  isOptional?: boolean;
  substitutions?: string;
  allergens?: string[];
}

export interface RecipeStep {
  stepNumber: number;
  title?: string;
  instruction: string;
  timeMinutes?: number;
  warningNotice?: string;
}

export interface RecipeNutrition {
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  fiber?: number;
  sodium?: number;
  saturatedFats?: number;
  estimated?: boolean;
  nutritionSource?: string;
  validationStatus?: 'unverified' | 'verified' | 'expertReviewed';
}

export interface Recipe {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  status: EditorialStatus;
  
  // Classificação
  categories: string[];
  goals: string[]; // Emagrecimento, Ganho Muscular, etc.
  diets: string[]; // Low Carb, Vegano, etc.
  mealTypes: string[]; // Café da manhã, Almoço, etc.
  tags: string[];
  difficulty: 'Fácil' | 'Médio' | 'Difícil' | 'Chef';
  cost: 'Baixo' | 'Médio' | 'Alto';
  energyDensity?: string;

  // Preparo
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  servings: number;

  // Listas
  ingredients: RecipeIngredient[];
  instructions: RecipeStep[];
  nutrition: RecipeNutrition;
  media: MediaAsset;

  // Revisão
  authorUid?: string;
  authorEmail?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;

  createdAt: string;
  updatedAt: string;
  version: number;
}

// 2. Ingredientes
export interface Ingredient {
  id: string;
  name: string;
  normalizedName: string;
  category: string;
  defaultUnit: string;
  nutrientsPer100g: {
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    fiber?: number;
    sodium?: number;
  };
  allergenIds: string[];
  source?: string;
  validationStatus: 'unverified' | 'verified';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// 3. Categorias de Receitas
export interface RecipeCategory {
  id: string;
  name: string;
  slug: string;
  iconName?: string;
  description?: string;
  targetGoal?: string;
  dietFilter?: string;
  order: number;
  active: boolean;
}

// 4. Alergênicos
export interface Allergen {
  id: string;
  name: string;
  code: string;
  description: string;
  iconName?: string;
  active: boolean;
}

// 5. Exercícios
export interface ExercisePrescription {
  metricType: 'reps' | 'time' | 'distance';
  suggestedSets: number;
  minReps?: number;
  maxReps?: number;
  durationSeconds?: number;
  restSeconds: number;
}

export interface ExerciseVariations {
  easierVersionId?: string;
  harderVersionId?: string;
  alternatives?: string[];
  equivalentIds?: string[];
}

export interface Exercise {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  status: EditorialStatus;

  // Classificação
  category: string;
  movementPattern: string;
  primaryMuscleGroup: string;
  secondaryMuscleGroups: string[];
  equipment: string[];
  location: ('Academia' | 'Em Casa' | 'Ao Ar Livre')[];
  goals: string[];
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  impact: 'Baixo' | 'Médio' | 'Alto';
  complexity: 'Simples' | 'Moderada' | 'Técnica';

  // Execução
  startingPosition: string;
  executionSteps: string[];
  breathingGuide: string;
  tempoGuide?: string;
  rangeOfMotion?: string;
  commonMistakes: string[];
  precautions: string[];
  stopConditions: string[];

  prescription: ExercisePrescription;
  variations?: ExerciseVariations;
  media: MediaAsset & { thumbnailUrl?: string };

  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;

  createdAt: string;
  updatedAt: string;
  version: number;
}

// 6. Grupos Musculares
export interface MuscleGroup {
  id: string;
  name: string;
  bodyRegion: 'Superior' | 'Inferior' | 'Core' | 'Corpo Inteiro';
  iconName?: string;
  order: number;
  active: boolean;
}

// 7. Equipamentos
export interface Equipment {
  id: string;
  name: string;
  category: 'Halteres/Anilhas' | 'Máquinas' | 'Acessórios' | 'Peso Corporal';
  location: 'Academia' | 'Em Casa' | 'Ambos';
  iconName?: string;
  active: boolean;
}

// 8. Categorias de Exercícios
export interface ExerciseCategory {
  id: string;
  name: string;
  description: string;
  suggestedLevel?: string;
  goal?: string;
  order: number;
  active: boolean;
}

// 9. Padrões de Movimento
export interface MovementPattern {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

// 10. Modelos de Treino
export interface WorkoutExerciseItem {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  repsText: string;
  durationSeconds?: number;
  restSeconds: number;
  effortRpe?: string;
  notes?: string;
}

export interface WorkoutSection {
  title: string; // Ex: Aquecimento, Bloco Principal
  exercises: WorkoutExerciseItem[];
}

export interface WorkoutDayPlan {
  dayName: string; // Ex: Dia 1 - Peito e Tríceps
  sections: WorkoutSection[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  goals: string[];
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  daysPerWeek: number;
  durationWeeks: number;
  location: 'Academia' | 'Em Casa' | 'Ambos';
  requiredEquipment: string[];
  lowImpactOnly: boolean;
  status: EditorialStatus;
  days: WorkoutDayPlan[];
  createdAt: string;
  updatedAt: string;
}

// 11. Modelos de Plano Alimentar
export interface MealItemOption {
  recipeId?: string;
  recipeName?: string;
  customText?: string;
  portionNotes?: string;
  isAlternative?: boolean;
}

export interface MealPlanMeal {
  name: string; // Ex: Café da Manhã
  suggestedTime: string; // Ex: 07:30
  options: MealItemOption[];
  notes?: string;
}

export interface MealPlanTemplate {
  id: string;
  name: string;
  goal: string;
  dietaryPattern: string;
  mealCount: number;
  days: {
    dayLabel: string;
    meals: MealPlanMeal[];
  }[];
  notes?: string;
  warnings?: string[];
  status: EditorialStatus;
  createdAt: string;
  updatedAt: string;
}

// 12. Conquistas
export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  criteria: string;
  type: 'Streak' | 'Treinos' | 'Receitas' | 'Hidratação' | 'Geral';
  order: number;
  active: boolean;
}

// 13. Onboarding
export interface OnboardingQuestion {
  id: string;
  questionKey: string;
  title: string;
  description?: string;
  options: {
    label: string;
    value: string;
    iconName?: string;
    associatedGoal?: string;
  }[];
  order: number;
  isRequired: boolean;
  active: boolean;
  supportColor?: string;
}

// 14. Avisos do Aplicativo
export interface AppAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'information' | 'warning' | 'maintenance' | 'update' | 'content';
  audience: 'all' | 'new_users' | 'active_subscribers';
  startAt: string;
  endAt?: string;
  active: boolean;
  priority: number;
  actionLabel?: string;
  actionRoute?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// 15. Configurações Públicas
export interface AppConfig {
  appName: string;
  currentTermsVersion: string;
  currentPrivacyVersion: string;
  minimumSupportedVersion: string;
  latestVersion: string;
  maintenanceMode: boolean;
  supportEmail: string;
  privacyUrl: string;
  termsUrl: string;
  featureFlags: {
    recipes: boolean;
    mealPlans: boolean;
    shoppingList: boolean;
    exercises: boolean;
    workoutPlans: boolean;
    achievements: boolean;
    reminders: boolean;
    evolutionPhotos: boolean;
    healthConnect: boolean;
    googleLogin: boolean;
  };
  updatedAt: string;
}

// 16. Revisões de Conteúdo
export interface ContentReview {
  id: string;
  contentType: 'recipe' | 'exercise' | 'workoutTemplate' | 'mealPlanTemplate';
  contentId: string;
  contentTitle: string;
  submittedBy: string;
  submittedAt: string;
  reviewerUid?: string;
  reviewerEmail?: string;
  reviewedAt?: string;
  status: 'pending' | 'approved' | 'rejected' | 'changesRequested';
  notes?: string;
}

// 17. Audit Logs
export interface AdminAuditLog {
  id: string;
  actorUid: string;
  actorEmail?: string;
  actorRole: AdminRole;
  action: string;
  resourceType: string;
  resourceId: string;
  summary: string;
  createdAt: string;
}

// 18. Histórico de Versão
export interface ContentVersion {
  id: string;
  contentType: string;
  contentId: string;
  version: number;
  snapshot: any;
  changedBy: string;
  changeReason: string;
  createdAt: string;
}

// Support User View
export interface UserSupportView {
  uid: string;
  name: string;
  email: string;
  accountStatus: 'active' | 'suspended' | 'pending';
  onboardingCompleted: boolean;
  createdAt: string;
  lastLoginAt: string;
  appVersion?: string;
  lastTechnicalError?: string;
}
