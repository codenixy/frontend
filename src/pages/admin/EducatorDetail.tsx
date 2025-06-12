import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, BookOpen, Users, Calendar, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const EducatorDetail = () => {
  const { educatorId } = useParams();
  const { toast } = useToast();

  const [educator, setEducator] = useState<any>(null);
  const [educatorCourses, setEducatorCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEducatorData = async () => {
      setLoading(true);
      try {
        // Fetch educator details
        const educatorRes = await fetch(`${SERVER_URL}/api/users/educators/${educatorId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const educatorData = await educatorRes.json();

        // Fetch educator's courses (as admin, use query param)
        const coursesRes = await fetch(
          `${SERVER_URL}/api/courses/educator/courses?educatorId=${educatorId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        const coursesData = await coursesRes.json();

        setEducator(educatorData);
        setEducatorCourses(Array.isArray(coursesData) ? coursesData : []);
      } catch (err) {
        toast({ title: "Failed to fetch educator data", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchEducatorData();
  }, [educatorId, toast]);

  const handleMakeInactive = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/users/educators/${educatorId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ isApproved: false }),
      });
      if (res.ok) {
        toast({ title: "Educator deactivated" });
        setEducator((prev: any) => ({ ...prev, isApproved: false }));
      } else {
        toast({ title: "Failed to deactivate educator", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to deactivate educator", variant: "destructive" });
    }
  };

  const handleRemoveEducator = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/users/educators/${educatorId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.ok) {
        toast({ title: "Educator removed", variant: "destructive" });
        // Optionally redirect to educators list
      } else {
        toast({ title: "Failed to remove educator", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to remove educator", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!educator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Educator not found.</h2>
          <Button 
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Calculate stats from courses
  const totalCourses = educatorCourses.length;
  const totalStudents = educatorCourses.reduce((sum, c) => sum + (c.students || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4 text-cyan-400 hover:text-cyan-300 hover:bg-white/5" 
            asChild
          >
            <Link to="/admin/educators">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Educators
            </Link>
          </Button>
          
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="w-20 h-20 border-2 border-cyan-400/50">
                      <AvatarImage src={educator.avatar || educator.profileImage} />
                      <AvatarFallback className="text-xl bg-gradient-to-br from-cyan-400 to-purple-500 text-white">
                        {educator.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                      {educator.name}
                    </h1>
                    <p className="text-slate-300 mb-4">{educator.email}</p>
                    <p className="text-slate-300 mb-4">{educator.bio}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-slate-400">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Joined {educator.createdAt ? new Date(educator.createdAt).toLocaleDateString() : ''}
                      </div>
                      <Badge className={educator.isApproved 
                        ? "bg-green-500/20 text-green-400 border-green-500/30" 
                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      }>
                        {educator.isApproved ? "active" : "inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Management Actions */}
                <div className="flex gap-2">
                  {educator.isApproved && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline"
                          className="border-orange-400/30 text-orange-400 hover:bg-orange-400/10"
                        >
                          Make Inactive
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-slate-800 border border-white/20 text-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Make Educator Inactive</AlertDialogTitle>
                          <AlertDialogDescription className="text-slate-300">
                            Are you sure you want to make {educator.name} inactive? This will prevent them from accessing educator features but won't delete their account.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0"
                            onClick={handleMakeInactive}
                          >
                            Make Inactive
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline"
                        className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                      >
                        Remove Educator
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-slate-800 border border-white/20 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Remove Educator</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-300">
                          Are you sure you want to permanently remove {educator.name} from the platform? This action cannot be undone and will delete all their data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0"
                          onClick={handleRemoveEducator}
                        >
                          Remove Permanently
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Stats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="group hover:scale-105 transition-all duration-300">
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-cyan-400/50 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Total Courses</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 rounded-lg">
                    <BookOpen className="h-4 w-4 text-cyan-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{totalCourses}</div>
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
                  <div className="text-3xl font-bold text-white">{totalStudents}</div>
                  <p className="text-xs text-slate-400">Across all courses</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Courses */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-cyan-400" />
                  Published Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {educatorCourses.map((course) => (
                    <div key={course._id || course.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-cyan-400/30 transition-all duration-300">
                      <div className="flex items-start space-x-4">
                        <img 
                          src={course.image}
                          alt={course.title}
                          className="w-24 h-20 object-cover rounded border border-white/20"
                        />
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-white">{course.title}</h3>
                              <p className="text-sm text-slate-300">{course.description}</p>
                            </div>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Published</Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                            <div>
                              <span className="text-slate-400">Students:</span>
                              <div className="font-medium text-white">{course.students || 0}</div>
                            </div>
                            <div>
                              <span className="text-slate-400">Price:</span>
                              <div className="font-medium text-cyan-400">${course.price || 0}</div>
                            </div>
                            <div>
                              <span className="text-slate-400">Duration:</span>
                              <div className="font-medium text-white">{course.duration || 'N/A'}</div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-4">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              asChild
                              className="border-white/20 text-white hover:bg-white/10"
                            >
                              <Link to={`/admin/courses/${course._id || course.id}`}>
                                View Details
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {educatorCourses.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-cyan-400" />
                      </div>
                      <p className="text-slate-300">No courses published yet</p>
                    </div>
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

export default EducatorDetail;