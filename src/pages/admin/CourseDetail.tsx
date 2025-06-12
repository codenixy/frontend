import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Users, Clock, DollarSign, CheckCircle, XCircle } from 'lucide-react';
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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" asChild>
            <Link to="/admin/courses">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Link>
          </Button>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-6">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-64 h-40 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                      <p className="text-gray-600 mb-4">{course.description}</p>
                      <p className="text-lg text-gray-700">by {course.educatorId?.name || course.instructor}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Badge variant={courseStatus === 'approved' ? "default" : "secondary"}>
                        {courseStatus}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <Users className="w-5 h-5 mx-auto text-gray-600 mb-1" />
                      <div className="text-2xl font-bold">{course.students}</div>
                      <div className="text-sm text-gray-500">Students</div>
                    </div>
                    <div className="text-center">
                      <Clock className="w-5 h-5 mx-auto text-gray-600 mb-1" />
                      <div className="text-2xl font-bold">{course.duration}</div>
                      <div className="text-sm text-gray-500">Duration</div>
                    </div>
                    <div className="text-center">
                      <DollarSign className="w-5 h-5 mx-auto text-green-600 mb-1" />
                      <div className="text-2xl font-bold">${course.price}</div>
                      <div className="text-sm text-gray-500">Price</div>
                    </div>
                  </div>

                  {courseStatus === 'pending' && (
                    <div className="flex space-x-3">
                      <Button onClick={handleApprove} className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Course
                      </Button>
                      <Button variant="destructive" onClick={handleReject} className="flex items-center">
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Course
                      </Button>
                      <Button variant="outline" onClick={handleDelete} className="flex items-center">
                        <XCircle className="w-4 h-4 mr-2" />
                        Delete Course
                      </Button>
                    </div>
                  )}
                  {courseStatus !== 'pending' && (
                    <div className="flex space-x-3 mt-4">
                      <Button variant="outline" onClick={handleDelete} className="flex items-center">
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
          <Card>
            <CardHeader>
              <CardTitle>Course Modules ({course.modules?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {course.modules && course.modules.length > 0 ? (
                  course.modules.map((module: any, index: number) => (
                    <div key={module.id || module._id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Module {index + 1}: {module.title}
                      </h3>
                      <p className="text-gray-600 mb-3">{module.description}</p>
                      <div className="text-sm text-gray-500">
                        {module.videos?.length || 0} videos
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No modules added yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enrolled Students */}
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Students ({enrolledStudents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {enrolledStudents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Enrolled</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrolledStudents.map((enrollment: any) => (
                      <TableRow key={enrollment._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{enrollment.studentId?.name}</div>
                            <div className="text-sm text-gray-500">{enrollment.studentId?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${enrollment.progress || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{enrollment.progress || 0}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : ''}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No students enrolled yet</p>
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
