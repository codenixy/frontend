import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Users, Eye, Sparkles, BookOpen } from 'lucide-react';
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center animate-glow">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    My Courses
                  </h1>
                  <p className="text-slate-300 text-lg">
                    Manage your published courses
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Button 
            asChild
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
          >
            <Link to="/educator/add-course">
              <Plus className="w-4 h-4 mr-2" />
              Create New Course
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-cyan-400/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Total Courses</CardTitle>
                <div className="p-2 bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 rounded-lg">
                  <BookOpen className="h-4 w-4 text-cyan-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{myCourses.length}</div>
                <p className="text-xs text-slate-400">Published courses</p>
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
                <div className="text-3xl font-bold text-white">
                  {myCourses.reduce((acc, course) => acc + (course.students || 0), 0)}
                </div>
                <p className="text-xs text-slate-400">Across all courses</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Course Grid */}
        {myCourses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((course) => (
              <div key={course._id || course.id} className="group hover:scale-105 transition-all duration-300">
                <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-cyan-400/30 transition-all duration-300 overflow-hidden">
                  <div className="relative">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <Badge 
                      className={course.isApproved 
                        ? "absolute top-2 right-2 bg-green-500/20 text-green-400 border-green-500/30" 
                        : "absolute top-2 right-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      }
                    >
                      {course.isApproved ? 'Approved' : 'Pending Review'}
                    </Badge>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white line-clamp-2 group-hover:text-cyan-400 transition-colors">
                      {course.title}
                    </CardTitle>
                    <p className="text-sm text-slate-300 line-clamp-2">{course.description}</p>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1 text-purple-400" />
                        {course.students || 0}
                      </div>
                      <div className="text-lg font-bold text-cyan-400">
                        ${course.price}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 border-white/20 text-white hover:bg-white/10" 
                        asChild
                      >
                        <Link to={`/educator/courses/${course._id || course.id}`}>
                          <Eye className="w-4 h-4 mr-1 text-cyan-400" />
                          View
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 border-white/20 text-white hover:bg-white/10" 
                        asChild
                      >
                        <Link to={`/educator/courses/${course._id || course.id}/edit`}>
                          <Edit className="w-4 h-4 mr-1 text-purple-400" />
                          Edit
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteCourse(course._id || course.id)}
                        className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardContent className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-12 h-12 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No courses yet
              </h3>
              <p className="text-slate-300 mb-6">
                Start sharing your knowledge by creating your first course
              </p>
              <Button 
                asChild
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
              >
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