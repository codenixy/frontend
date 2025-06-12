import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CourseCard from '@/components/CourseCard';
import { BookOpen, Users, Award, CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const Landing = () => {
  const { user } = useAuth();

  // State for stats and featured courses
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    successRate: 95
  });
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    // Fetch stats from backend
    const fetchStats = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/stats`);
        const data = await res.json();
        if (res.ok) {
          setStats({
            students: data.students || 0,
            courses: data.courses || 0,
            successRate: data.successRate || 95
          });
        }
      } catch {
        // fallback to default
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    // Fetch featured courses from backend (first 3 approved courses)
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const res = await fetch(`${SERVER_URL}/api/courses`);
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setFeaturedCourses(data.slice(0, 3));
        }
      } catch {
        setFeaturedCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  🚀 New courses added weekly
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Learn Without
                  <span className="text-blue-600"> Limits</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Join thousands of learners worldwide. Access premium courses, 
                  learn from industry experts, and advance your career with our 
                  comprehensive learning platform.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8 py-3" asChild>
                  <Link to="/courses">Explore Courses</Link>
                </Button>
                {!user && (
                  <Button variant="outline" size="lg" className="text-lg px-8 py-3" asChild>
                    <Link to="/signup">Start Learning Free</Link>
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.students > 1000 ? `${(stats.students/1000).toFixed(1)}K+` : stats.students}
                  </div>
                  <div className="text-gray-600">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.courses > 0 ? `${stats.courses}+` : '0'}
                  </div>
                  <div className="text-gray-600">Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.successRate}%
                  </div>
                  <div className="text-gray-600">Success Rate</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=600&h=600&fit=crop" 
                alt="Student learning online"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Certificate Ready</div>
                    <div className="text-sm text-gray-600">Earn industry credentials</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Why Choose Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <BookOpen className="w-10 h-10 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Expert Instructors</h3>
                <p className="text-gray-600">Learn from industry leaders and top educators with real-world experience.</p>
              </div>
            </div>
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Verified Certificates</h3>
                <p className="text-gray-600">Earn certificates to showcase your skills and boost your career prospects.</p>
              </div>
            </div>
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <Shield className="w-10 h-10 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Lifetime Access</h3>
                <p className="text-gray-600">Access your courses anytime, anywhere, and learn at your own pace.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Featured Courses</h2>
            <Button variant="outline" asChild>
              <Link to="/courses">View All</Link>
            </Button>
          </div>
          {loadingCourses ? (
            <div className="text-center py-12 text-lg text-gray-500">Loading courses...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {featuredCourses.map((course) => (
                <CourseCard
                  key={course._id || course.id}
                  course={course}
                  viewDetailsLink={`/courses/${course._id || course.id}`}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Get Started Free CTA (only if not logged in) */}
      {!user && (
        <section className="py-16 bg-blue-50">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to start learning?</h2>
            <p className="text-lg text-gray-700 mb-8">
              Sign up for free and unlock access to all our courses and resources.
            </p>
            <Button size="lg" className="text-lg px-10 py-4" asChild>
              <Link to="/signup">Get Started Free</Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Landing;
