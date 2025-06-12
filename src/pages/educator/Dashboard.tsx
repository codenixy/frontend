import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Plus, Eye, Sparkles, Target, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const EducatorDashboard = () => {
  const { toast } = useToast();
  const [educatorCourses, setEducatorCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/courses/my`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch courses');
        setEducatorCourses(data.courses || data);
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to fetch courses.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [toast]);

  const stats = {
    totalCourses: educatorCourses.length,
    totalStudents: educatorCourses.reduce((sum, course) => sum + (course.students || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
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
                    Educator Dashboard
                  </h1>
                  <p className="text-slate-300 mt-2 text-lg">
                    Manage your courses and track your teaching success
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-cyan-400/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">My Courses</CardTitle>
                <div className="p-2 bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 rounded-lg">
                  <BookOpen className="h-4 w-4 text-cyan-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.totalCourses}</div>
                <p className="text-xs text-slate-400">
                  Published courses
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-purple-400/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Total Students</CardTitle>
                <div className="p-2 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-lg">
                  <Users className="h-4 w-4 text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.totalStudents}</div>
                <p className="text-xs text-slate-400">
                  Across all courses
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="w-5 h-5 mr-2 text-yellow-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0" asChild>
                  <Link to="/educator/add-course">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Course
                  </Link>
                </Button>
                <Button className="w-full justify-start bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-cyan-400/50 transition-all duration-300" asChild>
                  <Link to="/educator/courses">
                    <Eye className="w-4 h-4 mr-2 text-cyan-400" />
                    View My Courses
                  </Link>
                </Button>
                <Button className="w-full justify-start bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-purple-400/50 transition-all duration-300" asChild>
                  <Link to="/educator/students">
                    <Users className="w-4 h-4 mr-2 text-purple-400" />
                    View Students
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* My Courses */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <span className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-cyan-400" />
                    My Courses
                  </span>
                  <Button variant="outline" size="sm" asChild className="border-white/20 text-white hover:bg-white/10">
                    <Link to="/educator/courses">View All</Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {educatorCourses.length > 0 ? (
                  <div className="space-y-4">
                    {educatorCourses.slice(0, 2).map((course) => (
                      <div key={course._id || course.id} className="group">
                        <div className="flex items-center space-x-4 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 hover:border-cyan-400/30 transition-all duration-300">
                          <img 
                            src={course.image} 
                            alt={course.title}
                            className="w-16 h-16 rounded-lg object-cover border border-white/20"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-white group-hover:text-cyan-400 transition-colors">
                              {course.title}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-slate-400 mt-1">
                              <span className="flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                {course.students || 0} students
                              </span>
                              <span className="text-cyan-400">${course.price}</span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" asChild className="border-white/20 text-white hover:bg-white/10">
                            <Link to={`/educator/courses/${course._id || course.id}`}>Manage</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-10 h-10 text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      No courses yet
                    </h3>
                    <p className="text-slate-400 mb-6">
                      Create your first course to start teaching.
                    </p>
                    <Button asChild className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0">
                      <Link to="/educator/add-course">Create Course</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducatorDashboard;