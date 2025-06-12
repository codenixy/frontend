import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import StudentDashboard from "./pages/student/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import EducatorDashboard from "./pages/educator/Dashboard";
import NotFound from "./pages/NotFound";
// import GoogleAuthCallback from "./pages/GoogleAuthCallback";
// Student Pages
import MyLearning from "./pages/student/MyLearning";
import CourseContent from "./pages/student/CourseContent";
import CoursePlayer from "./pages/student/CoursePlayer";
import Cart from "./pages/student/Cart";
import StudentProfile from "./pages/student/Profile";

// Admin Pages
import StudentAnalytics from "./pages/admin/StudentAnalytics";
import StudentDetail from "./pages/admin/StudentDetail";
import EducatorAnalytics from "./pages/admin/EducatorAnalytics";
import EducatorDetail from "./pages/admin/EducatorDetail";
import CourseAnalytics from "./pages/admin/CourseAnalytics";
import CourseDetail from "./pages/admin/CourseDetail";
import AdminProfile from "./pages/admin/Profile";
import AddEducator from "./pages/admin/AddEducator";

// Educator Pages
import AddCourse from "./pages/educator/AddCourse";
import MyCourses from "./pages/educator/MyCourses";
import AddModule from "./pages/educator/AddModule";
import AddVideo from "./pages/educator/AddVideo";
import EducatorCourseDetail from "./pages/educator/CourseDetail";
import EducatorStudentAnalytics from "./pages/educator/StudentAnalytics";
import EducatorProfile from "./pages/educator/Profile";
import EditCourse from "./pages/educator/EditCourse";
import EditModule from "./pages/educator/EditModule";
import EditVideo from "./pages/educator/EditVideo";
import ForgotPassword from "./pages/ForgotPassword";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // if (!allowedRoles.includes(user.role)) {
  //   return <Navigate to={`/${user.role}`} replace />;
  // }
  
  return <>{children}</>;
};

// Public Route (redirect if logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // if (user) {
  //   return <Navigate to={`/${user.role}`} replace />;
  // }
  
  return <>{children}</>;
};

const AppContent = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetails />} />
          {/* <Route path="/GoogleAuthCallback" element={<GoogleAuthCallback />} /> */}

          {/* Auth Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } />
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } />
          
          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/my-learning" element={
            <ProtectedRoute allowedRoles={['student']}>
              <MyLearning />
            </ProtectedRoute>
          } />
          <Route path="/course/:courseId" element={
            <ProtectedRoute allowedRoles={['student']}>
              <CourseContent />
            </ProtectedRoute>
          } />
          <Route path="/course/:courseId/video/:videoId" element={
            <ProtectedRoute allowedRoles={['student']}>
              <CoursePlayer />
            </ProtectedRoute>
          } />
          <Route path="/cart" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="/student/profile" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentProfile />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StudentAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/admin/students/:studentId" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StudentDetail />
            </ProtectedRoute>
          } />
          <Route path="/admin/educators" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <EducatorAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/admin/educators/add" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AddEducator />
            </ProtectedRoute>
          } />
          <Route path="/admin/educators/:educatorId" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <EducatorDetail />
            </ProtectedRoute>
          } />
          <Route path="/admin/courses" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CourseAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/admin/courses/:courseId" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CourseDetail />
            </ProtectedRoute>
          } />
          <Route path="/admin/profile" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminProfile />
            </ProtectedRoute>
          } />
          
          {/* Educator Routes */}
          <Route path="/educator" element={
            <ProtectedRoute allowedRoles={['educator']}>
              <EducatorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/educator/add-course" element={
            <ProtectedRoute allowedRoles={['educator']}>
              <AddCourse />
            </ProtectedRoute>
          } />
          <Route path="/educator/courses" element={
            <ProtectedRoute allowedRoles={['educator']}>
              <MyCourses />
            </ProtectedRoute>
          } />
          <Route path="/educator/courses/:courseId" element={
            <ProtectedRoute allowedRoles={['educator']}>
              <EducatorCourseDetail />
            </ProtectedRoute>
          } />
          <Route path="/educator/courses/:courseId/edit" element={
            <ProtectedRoute allowedRoles={['educator']}>
              <EditCourse />
            </ProtectedRoute>
          } />
          <Route path="/educator/courses/:courseId/modules/:moduleId/edit" element={
            <ProtectedRoute allowedRoles={['educator']}>
              <EditModule />
            </ProtectedRoute>
          } />
          <Route path="/educator/courses/:courseId/add-module" element={
            <ProtectedRoute allowedRoles={['educator']}>
              <AddModule />
            </ProtectedRoute>
          } />
          <Route path="/educator/courses/:courseId/modules/:moduleId/add-video" element={
            <ProtectedRoute allowedRoles={['educator']}>
              <AddVideo />
            </ProtectedRoute>
          } />
          <Route path="/educator/courses/:courseId/modules/:moduleId/videos/:videoId/edit" element={
            <ProtectedRoute allowedRoles={['educator']}>
              <EditVideo />
            </ProtectedRoute>
          } />
          <Route path="/educator/students" element={
            <ProtectedRoute allowedRoles={['educator']}>
              <EducatorStudentAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/educator/profile" element={
            <ProtectedRoute allowedRoles={['educator']}>
              <EducatorProfile />
            </ProtectedRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
        <AuthProvider>
      <BrowserRouter>
          <AppContent />
      </BrowserRouter>
        </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
