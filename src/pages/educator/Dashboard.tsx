import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Plus, Eye } from 'lucide-react';
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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Educator Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your courses and track your teaching success
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">
                Published courses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Across all courses
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
                <Button className="w-full justify-start" asChild>
                  <Link to="/educator/add-course">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Course
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/educator/courses">
                    <Eye className="w-4 h-4 mr-2" />
                    View My Courses
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/educator/students">
                    <Users className="w-4 h-4 mr-2" />
                    View Students
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* My Courses */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  My Courses
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/educator/courses">View All</Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {educatorCourses.length > 0 ? (
                  <div className="space-y-4">
                    {educatorCourses.slice(0, 2).map((course) => (
                      <div key={course._id || course.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <img 
                          src={course.image} 
                          alt={course.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {course.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span>{course.students || 0} students</span>
                            <span>${course.price}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/educator/courses/${course._id || course.id}`}>Manage</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No courses yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Create your first course to start teaching.
                    </p>
                    <Button asChild>
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
