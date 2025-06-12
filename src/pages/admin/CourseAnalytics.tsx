import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Search, Filter, Users, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const CourseAnalytics = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEnrollments, setTotalEnrollments] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch courses
        const res = await fetch(`${SERVER_URL}/api/courses`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : (Array.isArray(data.courses) ? data.courses : []));

        // Fetch stats for enrollments
        const statsRes = await fetch(`${SERVER_URL}/api/stats`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const statsData = await statsRes.json();
        setTotalEnrollments(statsData.Enrollments || statsData.enrollments || 0);
      } catch (err) {
        setCourses([]);
        setTotalEnrollments(0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCourses = courses.filter(course =>
    course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.educatorId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const approvedCourses = courses.filter(course => course.isApproved).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Course Analytics</h1>
          <p className="text-gray-600">Manage and view course performance and enrollments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.length}</div>
              <p className="text-xs text-muted-foreground">+3 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedCourses}</div>
              <p className="text-xs text-muted-foreground">Ready for enrollment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEnrollments}</div>
              <p className="text-xs text-muted-foreground">Across all courses</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Courses Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Title</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Enrollments</TableHead>
                    <TableHead>Modules</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course._id || course.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img 
                            src={course.image} 
                            alt={course.title}
                            className="w-12 h-8 object-cover rounded"
                          />
                          <div>
                            <div className="font-medium">{course.title}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {course.duration}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {course.educatorId?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {course.students || 0}
                        </div>
                      </TableCell>
                      <TableCell>{course.modules?.length || 0}</TableCell>
                      <TableCell>
                        ${course.price || 0}
                      </TableCell>
                      <TableCell>
                        <Badge variant={course.isApproved ? "default" : "secondary"}>
                          {course.isApproved ? 'Approved' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/courses/${course._id || course.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseAnalytics;
