import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, CheckCircle, ArrowRight, Eye, Sparkles, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const MyLearning = () => {
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
    return { ...enrollment, ...course };
  });

  const currentCourses = enrolledCourses.filter(course => !course.completed);
  const completedCourses = enrolledCourses.filter(course => course.completed);

  const handleContinueLearning = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  const handleReviewCourse = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  const handleViewDetails = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
                My Learning Journey
              </h1>
              <p className="text-slate-300 text-lg">Track your progress and continue learning</p>
            </div>
          </div>
        </div>

        {/* Current Courses */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <div className="p-2 bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 rounded-lg mr-3">
              <BookOpen className="w-6 h-6 text-cyan-400" />
            </div>
            Current Courses ({currentCourses.length})
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
                <p className="text-slate-300 mt-2">Loading...</p>
              </div>
            ) : currentCourses.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-10 h-10 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No current courses</h3>
                <p className="text-slate-400 mb-6">Start learning by enrolling in a course</p>
                <Button 
                  onClick={() => navigate('/courses')}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
                >
                  Browse Courses
                </Button>
              </div>
            ) : (
              currentCourses.map((course) => (
                <div key={course._id || course.id} className="group hover:scale-105 transition-all duration-300">
                  <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-cyan-400/50 transition-all duration-300 overflow-hidden">
                    <div className="relative">
                      <img 
                        src={course.image} 
                        alt={course.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <Badge className="absolute top-3 right-3 bg-cyan-500/20 text-cyan-400 border-cyan-500/30 backdrop-blur-sm">
                        In Progress
                      </Badge>
                    </div>

                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-white group-hover:text-cyan-400 transition-colors">
                        {course.title}
                      </CardTitle>
                      <p className="text-sm text-slate-400">by {course.instructor || course.educatorId?.name}</p>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-300">Progress</span>
                            <span className="text-cyan-400 font-medium">{course.progress || 0}%</span>
                          </div>
                          <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500"
                              style={{ width: `${course.progress || 0}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-slate-400">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {course.duration}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0" 
                            onClick={() => handleContinueLearning(course._id || course.id)}
                          >
                            Continue Learning
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>

                          <Button 
                            variant="outline"
                            onClick={() => handleViewDetails(course._id || course.id)}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed Courses */}
        <div>
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <div className="p-2 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-lg mr-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            Completed Courses ({completedCourses.length})
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto"></div>
                <p className="text-slate-300 mt-2">Loading...</p>
              </div>
            ) : completedCourses.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No completed courses</h3>
                <p className="text-slate-400 mb-6">Complete a course to see it here</p>
              </div>
            ) : (
              completedCourses.map((course) => (
                <div key={course._id || course.id} className="group hover:scale-105 transition-all duration-300">
                  <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-green-400/50 transition-all duration-300 overflow-hidden">
                    <div className="relative">
                      <img 
                        src={course.image} 
                        alt={course.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <Badge className="absolute top-3 right-3 bg-green-500/20 text-green-400 border-green-500/30 backdrop-blur-sm">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    </div>

                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-white group-hover:text-green-400 transition-colors">
                        {course.title}
                      </CardTitle>
                      <p className="text-sm text-slate-400">by {course.instructor || course.educatorId?.name}</p>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-slate-400">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {course.duration}
                          </div>
                          <div className="flex items-center text-green-400">
                            <Target className="w-4 h-4 mr-1" />
                            100%
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1 border-white/20 text-white hover:bg-white/10"
                            onClick={() => handleReviewCourse(course._id || course.id)}
                          >
                            Review Course
                          </Button>

                          <Button 
                            variant="outline"
                            onClick={() => handleViewDetails(course._id || course.id)}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyLearning;