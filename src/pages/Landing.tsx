import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CourseCard from '@/components/CourseCard';
import { BookOpen, Users, Award, CheckCircle, Shield, Zap, Star, TrendingUp } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-6">
                  <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 backdrop-blur-xl">
                    🚀 New courses added weekly
                  </Badge>
                  <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                    Learn Without
                    <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent block">
                      Limits
                    </span>
                  </h1>
                  <p className="text-xl text-cyan-200/80 leading-relaxed max-w-lg">
                    Join thousands of learners worldwide. Access premium courses, 
                    learn from industry experts, and advance your career with our 
                    comprehensive learning platform.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white border-0 transform hover:scale-105 transition-all duration-300" asChild>
                    <Link to="/courses">
                      <Zap className="w-5 h-5 mr-2" />
                      Explore Courses
                    </Link>
                  </Button>
                  {!user && (
                    <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-cyan-400/30 transform hover:scale-105 transition-all duration-300" asChild>
                      <Link to="/signup">Start Learning Free</Link>
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-6 pt-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      {stats.students > 1000 ? `${(stats.students/1000).toFixed(1)}K+` : stats.students}
                    </div>
                    <div className="text-cyan-200/60">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      {stats.courses > 0 ? `${stats.courses}+` : '0'}
                    </div>
                    <div className="text-cyan-200/60">Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      {stats.successRate}%
                    </div>
                    <div className="text-cyan-200/60">Success Rate</div>
                  </div>
                </div>
              </div>

              <div className="relative animate-fade-in">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=600&h=600&fit=crop" 
                    alt="Student learning online"
                    className="rounded-3xl shadow-2xl border border-cyan-400/20"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent rounded-3xl"></div>
                </div>
                
                <div className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/20">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Certificate Ready</div>
                      <div className="text-sm text-cyan-200/80">Earn industry credentials</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20 bg-white/5 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white mb-16 text-center">Why Choose Us?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center py-8 group">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center group-hover:bg-cyan-500/30 transition-all duration-300">
                    <BookOpen className="w-8 h-8 text-cyan-400" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-4 text-white">Expert Instructors</h3>
                  <p className="text-cyan-200/80">Learn from industry leaders and top educators with real-world experience.</p>
                </div>
              </div>
              <div className="text-center py-8 group">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center group-hover:bg-green-500/30 transition-all duration-300">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-4 text-white">Verified Certificates</h3>
                  <p className="text-cyan-200/80">Earn certificates to showcase your skills and boost your career prospects.</p>
                </div>
              </div>
              <div className="text-center py-8 group">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center group-hover:bg-purple-500/30 transition-all duration-300">
                    <Shield className="w-8 h-8 text-purple-400" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-4 text-white">Lifetime Access</h3>
                  <p className="text-cyan-200/80">Access your courses anytime, anywhere, and learn at your own pace.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Courses Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-16">
              <h2 className="text-4xl font-bold text-white">Featured Courses</h2>
              <Button variant="outline" className="bg-white/5 border-white/20 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/30" asChild>
                <Link to="/courses">View All</Link>
              </Button>
            </div>
            {loadingCourses ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg text-cyan-200/80">Loading courses...</p>
              </div>
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
          <section className="py-20 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-xl">
            <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
              <h2 className="text-4xl font-bold text-white mb-6">Ready to start learning?</h2>
              <p className="text-xl text-cyan-200/80 mb-10 max-w-2xl mx-auto">
                Sign up for free and unlock access to all our courses and resources.
              </p>
              <Button size="lg" className="text-xl px-12 py-6 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white border-0 transform hover:scale-105 transition-all duration-300" asChild>
                <Link to="/signup">
                  <Star className="w-6 h-6 mr-3" />
                  Get Started Free
                </Link>
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Landing;