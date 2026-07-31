import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AdminLayout } from './layouts/AdminLayout';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { RecipesPage } from './pages/RecipesPage';
import { RecipeFormPage } from './pages/RecipeFormPage';
import { IngredientsPage } from './pages/IngredientsPage';
import { RecipeCategoriesPage } from './pages/RecipeCategoriesPage';
import { AllergensPage } from './pages/AllergensPage';
import { ExercisesPage } from './pages/ExercisesPage';
import { ExerciseFormPage } from './pages/ExerciseFormPage';
import { MuscleGroupsPage } from './pages/MuscleGroupsPage';
import { EquipmentPage } from './pages/EquipmentPage';
import { ExerciseCategoriesPage } from './pages/ExerciseCategoriesPage';
import { WorkoutTemplatesPage } from './pages/WorkoutTemplatesPage';
import { MealPlanTemplatesPage } from './pages/MealPlanTemplatesPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { ConfigPage } from './pages/ConfigPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SupportUsersPage } from './pages/SupportUsersPage';
import { AccountPage } from './pages/AccountPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FEDA] flex items-center justify-center text-xs font-bold text-slate-600">
        Carregando sessão do painel administrativo...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Rotas Protegidas do Painel Admin */}
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/recipes" element={<ProtectedRoute><RecipesPage /></ProtectedRoute>} />
        <Route path="/recipes/new" element={<ProtectedRoute><RecipeFormPage /></ProtectedRoute>} />
        <Route path="/recipes/edit/:id" element={<ProtectedRoute><RecipeFormPage /></ProtectedRoute>} />
        <Route path="/ingredients" element={<ProtectedRoute><IngredientsPage /></ProtectedRoute>} />
        <Route path="/recipe-categories" element={<ProtectedRoute><RecipeCategoriesPage /></ProtectedRoute>} />
        <Route path="/allergens" element={<ProtectedRoute><AllergensPage /></ProtectedRoute>} />

        <Route path="/exercises" element={<ProtectedRoute><ExercisesPage /></ProtectedRoute>} />
        <Route path="/exercises/new" element={<ProtectedRoute><ExerciseFormPage /></ProtectedRoute>} />
        <Route path="/exercises/edit/:id" element={<ProtectedRoute><ExerciseFormPage /></ProtectedRoute>} />
        <Route path="/muscle-groups" element={<ProtectedRoute><MuscleGroupsPage /></ProtectedRoute>} />
        <Route path="/equipment" element={<ProtectedRoute><EquipmentPage /></ProtectedRoute>} />
        <Route path="/exercise-categories" element={<ProtectedRoute><ExerciseCategoriesPage /></ProtectedRoute>} />

        <Route path="/workout-templates" element={<ProtectedRoute><WorkoutTemplatesPage /></ProtectedRoute>} />
        <Route path="/meal-plans" element={<ProtectedRoute><MealPlanTemplatesPage /></ProtectedRoute>} />
        <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
        <Route path="/announcements" element={<ProtectedRoute><AnnouncementsPage /></ProtectedRoute>} />
        <Route path="/config" element={<ProtectedRoute><ConfigPage /></ProtectedRoute>} />
        <Route path="/reviews" element={<ProtectedRoute><ReviewsPage /></ProtectedRoute>} />
        <Route path="/logs" element={<ProtectedRoute><AuditLogsPage /></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><SupportUsersPage /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
