import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, BookOpen, Award, Calendar, Clock, Sparkles, Target } from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const StudentDetail = () => {
  const { studentId } = useParams();
  const [student, setStudent] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      try {
        // Fetch student details
        const studentRes = await fetch(`${SERVER_URL}/api/users/students/${studentId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const studentData = await studentRes.json();
        setStudent(studentData);

        // Fetch enrollments for this student (admin/educator route)
        const enrollmentsRes = await fetch(`${SERVER_URL}/api/enrollments/by-student?studentId=${studentId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const enrollmentsData = await enrollmentsRes.json();
        setEnrollments(Array.isArray(enrollmentsData.enrollments) ? enrollmentsData.enrollments : []);
      } catch (err) {
        setStudent(null);
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Student not found</h2>
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

  // Prepare enrolled courses with course info and enrollment data
  const enrolledCourses = enrollments.map(enrollment => ({
    ...enrollment.courseId,
    ...enrollment,
  }));

  const completedCourses = enrolledCourses.filter(course => course.progress === 100);
  const averageProgress = enrolledCourses.length > 0
    ? enrolledCourses.reduce((acc, course) => acc + (course.progress || 0), 0) / enrolledCourses.length
    : 0;

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
            <Link to="/admin/students">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Students
            </Link>
          </Button>
          
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="w-20 h-20 border-2 border-cyan-400/50">
                    <AvatarImage src={student.profileImage || `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=150&h=150&fit=crop&crop=face`} />
                    <AvatarFallback className="text-xl bg-gradient-to-br from-cyan-400 to-purple-500 text-white">
                      {student.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {student.name}
                  </h1>
                  <p className="text-slate-300 mb-4">{student.email}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-slate-400">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Joined {student.joinedAt ? new Date(student.joinedAt).toLocaleDateString() : ''}
                    </div>
                    <Badge className={student.isActive !== false 
                      ? "bg-green-500/20 text-green-400 border-green-500/30" 
                      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    }>
                      {student.isActive !== false ? "Active" : "Inactive"}
                    </Badge>
                  </div>
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
                  <CardTitle className="text-sm font-medium text-slate-300">Enrolled Courses</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 rounded-lg">
                    <BookOpen className="h-4 w-4 text-cyan-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{enrolledCourses.length}</div>
                  <p className="text-xs text-slate-400">Total enrollments</p>
                </CardContent>
              </Card>
            </div>

            <div className="group hover:scale-105 transition-all duration-300">
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-green-400/50 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Completed</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-lg">
                    <Award className="h-4 w-4 text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{completedCourses.length}</div>
                  <p className="text-xs text-slate-400">
                    {enrolledCourses.length > 0 ? Math.round((completedCourses.length / enrolledCourses.length) * 100) : 0}% completion rate
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="group hover:scale-105 transition-all duration-300">
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-purple-400/50 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Avg. Progress</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-lg">
                    <Target className="h-4 w-4 text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{Math.round(averageProgress)}%</div>
                  <p className="text-xs text-slate-400">Across all courses</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Course Details */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-cyan-400" />
                  Course Enrollments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {enrolledCourses.map((course) => (
                    <div key={course._id || course.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-cyan-400/30 transition-all duration-300">
                      <div className="flex items-start space-x-4">
                        <img 
                          src={course.image} 
                          alt={course.title}
                          className="w-20 h-16 object-cover rounded border border-white/20"
                        />
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-white">{course.title}</h3>
                              <p className="text-sm text-slate-300">
                                by {course.educatorId?.name || course.instructor}
                              </p>
                            </div>
                            <Badge className={course.progress === 100 
                              ? "bg-green-500/20 text-green-400 border-green-500/30" 
                              : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                            }>
                              {course.progress === 100 ? 'Completed' : 'In Progress'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-300">Progress</span>
                              <span className="text-cyan-400">{course.progress || 0}%</span>
                            </div>
                            <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500"
                                style={{ width: `${course.progress || 0}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-3 text-sm text-slate-400">
                            <span>Enrolled: {course.enrolledAt ? new Date(course.enrolledAt).toLocaleDateString() : ''}</span>
                            {course.progress === 100 && (
                              <span className="text-green-400 font-medium">✓ Completed</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {enrolledCourses.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-cyan-400" />
                      </div>
                      <p className="text-slate-300">No course enrollments yet</p>
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

export default StudentDetail;