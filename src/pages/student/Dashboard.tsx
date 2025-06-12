import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Trophy, Clock, TrendingUp, Eye, Sparkles, Zap, Target } from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${SERVER_URL}/api/enrollments`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        if (res.ok && data.enrollments) {
          setEnrollments(data.enrollments);
        } else {
          setEnrollments([]);
        }
      } catch (err) {
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  const enrolledCourses = enrollments.map((enrollment) => {
    const course = enrollment.courseId;
    return { ...course, ...enrollment };
  });

  const stats = {
    totalCourses: enrollments.length,
    completedCourses: enrollments.filter(e => e.completed).length,
    inProgress: enrollments.filter(e => !e.completed).length,
    totalHours: enrollments.reduce((sum, e) => sum + (e.progress || 0) * ((e.courseId?.durationHours) || 1) / 100, 0)
  };

  const handleContinueLearning = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  const handleViewDetails = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center animate-glow">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    Welcome back, {user?.name}! 👋
                  </h1>
                  <p className="text-slate-300 mt-2 text-lg">
                    Continue your learning journey and achieve your goals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-cyan-400/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Total Courses</CardTitle>
                <div className="p-2 bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 rounded-lg">
                  <BookOpen className="h-4 w-4 text-cyan-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.totalCourses}</div>
                <p className="text-xs text-slate-400 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Enrolled courses
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-purple-400/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Completed</CardTitle>
                <div className="p-2 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-lg">
                  <Trophy className="h-4 w-4 text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.completedCourses}</div>
                <p className="text-xs text-slate-400 flex items-center mt-1">
                  <Target className="w-3 h-3 mr-1" />
                  Courses completed
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-yellow-400/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">In Progress</CardTitle>
                <div className="p-2 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-lg">
                  <Clock className="h-4 w-4 text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.inProgress}</div>
                <p className="text-xs text-slate-400 flex items-center mt-1">
                  <Zap className="w-3 h-3 mr-1" />
                  Active courses
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-green-400/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Study Hours</CardTitle>
                <div className="p-2 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{Math.round(stats.totalHours)}</div>
                <p className="text-xs text-slate-400 flex items-center mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  Estimated hours
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Current Courses */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <span className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-cyan-400" />
                    Continue Learning
                  </span>
                  <Button variant="outline" size="sm" asChild className="border-white/20 text-white hover:bg-white/10">
                    <Link to="/my-learning">View All</Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
                    <p className="text-slate-300 mt-2">Loading...</p>
                  </div>
                ) : (
                  <>
                    {enrolledCourses.slice(0, 3).map((course) => (
                      <div key={course._id || course.id} className="group">
                        <div className="flex items-center space-x-4 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 hover:border-cyan-400/30 transition-all duration-300">
                          <img 
                            src={course.image} 
                            alt={course.title}
                            className="w-16 h-16 rounded-lg object-cover border border-white/20"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white truncate group-hover:text-cyan-400 transition-colors">
                              {course.title}
                            </h3>
                            <p className="text-sm text-slate-400">
                              by {course.instructor || course.educatorId?.name}
                            </p>
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-300">Progress</span>
                                <span className="font-medium text-cyan-400">{course.progress || 0}%</span>
                              </div>
                              <div className="mt-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500"
                                  style={{ width: `${course.progress || 0}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            {course.completed ? (
                              <div className="flex gap-2">
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleViewDetails(course._id || course.id)}
                                  className="border-white/20 text-white hover:bg-white/10"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleContinueLearning(course._id || course.id)}
                                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
                                >
                                  Continue
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleViewDetails(course._id || course.id)}
                                  className="border-white/20 text-white hover:bg-white/10"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {enrolledCourses.length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="w-10 h-10 text-cyan-400" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">
                          No courses yet
                        </h3>
                        <p className="text-slate-400 mb-6">
                          Start your learning journey by enrolling in a course.
                        </p>
                        <Button asChild className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0">
                          <Link to="/courses">Browse Courses</Link>
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-cyan-400/50 transition-all duration-300" asChild>
                  <Link to="/courses">
                    <BookOpen className="w-4 h-4 mr-2 text-cyan-400" />
                    Browse Courses
                  </Link>
                </Button>
                <Button className="w-full justify-start bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-purple-400/50 transition-all duration-300" asChild>
                  <Link to="/my-learning">
                    <Clock className="w-4 h-4 mr-2 text-purple-400" />
                    My Learning
                  </Link>
                </Button>
                <Button className="w-full justify-start bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-yellow-400/50 transition-all duration-300" asChild>
                  <Link to="/student/profile">
                    <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
                    View Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Achievement Badge */}
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                  Achievement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-glow">
                    <Trophy className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h3 className="font-semibold mb-2 text-white">Learning Streak</h3>
                  <p className="text-sm text-slate-400">
                    You've been learning for 5 days in a row! Keep it up!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;