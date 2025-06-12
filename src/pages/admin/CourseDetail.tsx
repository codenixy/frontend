import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Users, Clock, DollarSign, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const CourseDetail = () => {
  const { courseId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [courseStatus, setCourseStatus] = useState<string>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        // Fetch course details
        const courseRes = await fetch(`${SERVER_URL}/api/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const courseData = await courseRes.json();
        if (!courseData.course) {
          setCourse(null);
          setLoading(false);
          return;
        }
        setCourse(courseData.course);
        setCourseStatus(
          courseData.course.isApproved
            ? 'approved'
            : 'pending'
        );

        // Fetch enrollments for this course (admin/educator route)
        const enrollmentsRes = await fetch(`${SERVER_URL}/api/enrollments/by-course?courseId=${courseId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const enrollmentsData = await enrollmentsRes.json();
        setEnrolledStudents(
          Array.isArray(enrollmentsData.enrollments)
            ? enrollmentsData.enrollments
            : []
        );
      } catch (err) {
        toast({ title: "Failed to fetch course data", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId, toast]);

  const handleApprove = async () => {
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
        setCourseStatus('approved');
        toast({
          title: "Course approved!",
          description: "The course is now available for enrollment.",
        });
      } else {
        toast({ title: "Failed to approve course", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to approve course", variant: "destructive" });
    }
  };

  const handleReject = async () => {
    if (!window.confirm("Are you sure you want to reject (delete) this course? This action cannot be undone.")) return;
    try {
      const res = await fetch(`${SERVER_URL}/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.ok) {
        toast({
          title: "Course rejected & deleted",
          description: "The course has been removed from the platform.",
          variant: "destructive",
        });
        navigate('/admin/courses');
      } else {
        toast({ title: "Failed to reject/delete course", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to reject/delete course", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;
    try {
      const res = await fetch(`${SERVER_URL}/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.ok) {
        toast({
          title: "Course deleted",
          description: "The course has been permanently deleted.",
          variant: "destructive",
        });
        navigate('/admin/courses');
      } else {
        toast({ title: "Failed to delete course", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to delete course", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Course not found</h2>
          <Button 
            onClick={() => navigate('/admin/courses')}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
          >
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

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
            <Link to="/admin/courses">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Link>
          </Button>
          
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-64 h-40 object-cover rounded-lg border border-white/20"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
                      <p className="text-slate-300 mb-4">{course.description}</p>
                      <p className="text-lg text-cyan-400">by {course.educatorId?.name || course.instructor}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Badge className={courseStatus === 'approved' 
                        ? "bg-green-500/20 text-green-400 border-green-500/30" 
                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      }>
                        {courseStatus}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                      <Users className="w-5 h-5 mx-auto text-purple-400 mb-1" />
                      <div className="text-2xl font-bold text-white">{course.students}</div>
                      <div className="text-sm text-slate-400">Students</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                      <Clock className="w-5 h-5 mx-auto text-cyan-400 mb-1" />
                      <div className="text-2xl font-bold text-white">{course.duration}</div>
                      <div className="text-sm text-slate-400">Duration</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                      <DollarSign className="w-5 h-5 mx-auto text-green-400 mb-1" />
                      <div className="text-2xl font-bold text-white">${course.price}</div>
                      <div className="text-sm text-slate-400">Price</div>
                    </div>
                  </div>

                  {courseStatus === 'pending' && (
                    <div className="flex space-x-3">
                      <Button 
                        onClick={handleApprove} 
                        className="flex items-center bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Course
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleReject} 
                        className="flex items-center bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Course
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleDelete} 
                        className="flex items-center border-white/20 text-white hover:bg-white/10"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Delete Course
                      </Button>
                    </div>
                  )}
                  {courseStatus !== 'pending' && (
                    <div className="flex space-x-3 mt-4">
                      <Button 
                        variant="outline" 
                        onClick={handleDelete} 
                        className="flex items-center border-white/20 text-white hover:bg-white/10"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Delete Course
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Course Modules */}
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-cyan-400" />
                Course Modules ({course.modules?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {course.modules && course.modules.length > 0 ? (
                  course.modules.map((module: any, index: number) => (
                    <div key={module.id || module._id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-cyan-400/30 transition-all duration-300">
                      <h3 className="font-semibold text-white mb-2">
                        Module {index + 1}: {module.title}
                      </h3>
                      <p className="text-slate-300 mb-3">{module.description}</p>
                      <div className="text-sm text-cyan-400">
                        {module.videos?.length || 0} videos
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-cyan-400" />
                    </div>
                    <p className="text-slate-300">No modules added yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enrolled Students */}
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-400" />
                Enrolled Students ({enrolledStudents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {enrolledStudents.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/20">
                        <TableHead className="text-slate-300">Student</TableHead>
                        <TableHead className="text-slate-300">Progress</TableHead>
                        <TableHead className="text-slate-300">Enrolled</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrolledStudents.map((enrollment: any) => (
                        <TableRow key={enrollment._id} className="border-white/10 hover:bg-white/5">
                          <TableCell className="text-white">
                            <div>
                              <div className="font-medium">{enrollment.studentId?.name}</div>
                              <div className="text-sm text-slate-400">{enrollment.studentId?.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-slate-700 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full" 
                                  style={{ width: `${enrollment.progress || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-cyan-400">{enrollment.progress || 0}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-slate-400">
                            {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : ''}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-slate-300">No students enrolled yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;