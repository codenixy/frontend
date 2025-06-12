import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Users, BookOpen, GraduationCap, Eye, CheckCircle, Sparkles, Shield, Zap } from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalEducators: 0,
    totalCourses: 0,
    activeEducators: 0,
  });
  const [pendingCourses, setPendingCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const statsRes = await fetch(`${SERVER_URL}/api/stats`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const statsData = await statsRes.json();
        if (statsRes.ok) {
          setStats({
            totalStudents: statsData.students || 0,
            totalEducators: statsData.educators || 0,
            totalCourses: statsData.courses || 0,
            activeEducators: statsData.activeEducators || 0,
          });
        }

        const coursesRes = await fetch(`${SERVER_URL}/api/courses/admin/pending?limit=3`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const coursesData = await coursesRes.json();
        if (coursesRes.ok && Array.isArray(coursesData)) {
          setPendingCourses(coursesData);
        } else if (coursesRes.ok && Array.isArray(coursesData.courses)) {
          setPendingCourses(coursesData.courses);
        }
      } catch (err) {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleApprove = async (courseId: string) => {
    try {
      const res = await fetch(`${SERVER_URL}/api/courses/${courseId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ isApproved: true }),
      });
      if (res.ok) {
        setPendingCourses((prev) => prev.filter((c) => c._id !== courseId && c.id !== courseId));
      }
    } catch (err) {
      // Handle error
    }
  };

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
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-slate-300 mt-2 text-lg">
                    Overview of platform activity and management tools
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
                <CardTitle className="text-sm font-medium text-slate-300">Total Students</CardTitle>
                <div className="p-2 bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 rounded-lg">
                  <Users className="h-4 w-4 text-cyan-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.totalStudents}</div>
                <p className="text-xs text-slate-400">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-purple-400/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Total Educators</CardTitle>
                <div className="p-2 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-lg">
                  <GraduationCap className="h-4 w-4 text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.totalEducators}</div>
                <p className="text-xs text-slate-400">
                  {stats.activeEducators} active educators
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-yellow-400/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Total Courses</CardTitle>
                <div className="p-2 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-lg">
                  <BookOpen className="h-4 w-4 text-yellow-400" />
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
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-between bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-cyan-400/50 transition-all duration-300" asChild>
                  <Link to="/admin/students">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-cyan-400" />
                      Manage Students
                    </span>
                    <Eye className="w-4 h-4" />
                  </Link>
                </Button>
                <Button className="w-full justify-between bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-purple-400/50 transition-all duration-300" asChild>
                  <Link to="/admin/educators">
                    <span className="flex items-center">
                      <GraduationCap className="w-4 h-4 mr-2 text-purple-400" />
                      Manage Educators
                    </span>
                    <Eye className="w-4 h-4" />
                  </Link>
                </Button>
                <Button className="w-full justify-between bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-yellow-400/50 transition-all duration-300" asChild>
                  <Link to="/admin/courses">
                    <span className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-2 text-yellow-400" />
                      View Courses
                    </span>
                    <Eye className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Pending Courses */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-cyan-400" />
                  Pending Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
                      <p className="text-slate-300 mt-2">Loading...</p>
                    </div>
                  ) : pendingCourses.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-400" />
                      </div>
                      <p className="text-slate-300">No pending courses.</p>
                    </div>
                  ) : (
                    pendingCourses.map((course: any, idx: number) => (
                      <div key={course._id || idx} className="group">
                        <div className="flex items-start space-x-4 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 hover:border-cyan-400/30 transition-all duration-300">
                          <img
                            src={course.image || '/placeholder.png'}
                            alt={course.title}
                            className="w-20 h-16 object-cover rounded border border-white/20"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-white group-hover:text-cyan-400 transition-colors">
                              {course.title}
                            </h4>
                            <p className="text-slate-400 text-sm">
                              By {course.educatorId?.name || 'Unknown'}
                            </p>
                            <p className="text-slate-500 text-xs mt-1">
                              {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : ''}
                            </p>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/admin/courses/${course._id || course.id}`)}
                              className="border-white/20 text-white hover:bg-white/10"
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(course._id || course.id)}
                              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;