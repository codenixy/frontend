import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Users, BookOpen, GraduationCap, Eye, CheckCircle } from 'lucide-react';

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
        // Fetch stats from /api/stats
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

        // Fetch pending courses (latest 3)
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
        // Optionally handle error
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
      // Optionally handle error
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Overview of platform activity and management tools
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Educators</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEducators}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeEducators} active educators
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">
                Published courses
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-between" variant="outline" asChild>
                  <Link to="/admin/students">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Students
                    </span>
                    <Eye className="w-4 h-4" />
                  </Link>
                </Button>
                <Button className="w-full justify-between" variant="outline" asChild>
                  <Link to="/admin/educators">
                    <span className="flex items-center">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Manage Educators
                    </span>
                    <Eye className="w-4 h-4" />
                  </Link>
                </Button>
                <Button className="w-full justify-between" variant="outline" asChild>
                  <Link to="/admin/courses">
                    <span className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
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
            <Card>
              <CardHeader>
                <CardTitle>Pending Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div>Loading...</div>
                  ) : pendingCourses.length === 0 ? (
                    <div>No pending courses.</div>
                  ) : (
                    pendingCourses.map((course: any, idx: number) => (
                      <div key={course._id || idx} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <img
                          src={course.image || '/placeholder.png'}
                          alt={course.title}
                          className="w-20 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{course.title}</h4>
                          <p className="text-gray-600 text-sm">
                            By {course.educatorId?.name || 'Unknown'}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : ''}
                          </p>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/admin/courses/${course._id || course.id}`)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(course._id || course.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
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
