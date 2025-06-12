import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Users, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const MyCourses = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch courses for current educator from backend
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
        setMyCourses(data.courses || data); // support both {courses: [...]} and [...]
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

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const res = await fetch(`${SERVER_URL}/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete course');
      setMyCourses(myCourses.filter(course => course._id !== courseId && course.id !== courseId));
      toast({
        title: "Course deleted",
        description: "The course has been removed successfully.",
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete course.',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">My Courses</h1>
            <p className="text-gray-600">Manage your published courses</p>
          </div>
          <Button asChild>
            <Link to="/educator/add-course">
              <Plus className="w-4 h-4 mr-2" />
              Create New Course
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myCourses.length}</div>
              <p className="text-xs text-muted-foreground">Published courses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {myCourses.reduce((acc, course) => acc + (course.students || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">Across all courses</p>
            </CardContent>
          </Card>
        </div>

        {/* Course Grid */}
        {myCourses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((course) => (
              <Card key={course._id || course.id} className="overflow-hidden">
                <div className="relative">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <Badge 
                    className={`absolute top-2 right-2 ${course.isApproved ? 'bg-green-500' : 'bg-yellow-500'}`}
                  >
                    {course.isApproved ? 'Approved' : 'Pending Review'}
                  </Badge>
                </div>
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                  <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {course.students || 0}
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      ${course.price}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link to={`/educator/courses/${course._id || course.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link to={`/educator/courses/${course._id || course.id}/edit`}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteCourse(course._id || course.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No courses yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start sharing your knowledge by creating your first course
              </p>
              <Button asChild>
                <Link to="/educator/add-course">
                  Create Your First Course
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
