import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const StudentAnalytics = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // Fetch students
        const studentsRes = await fetch(`${SERVER_URL}/api/users/students`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const studentsData = await studentsRes.json();

        // Fetch all enrollments (admin route)
        const enrollmentsRes = await fetch(`${SERVER_URL}/api/enrollments/all`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const enrollmentsData = await enrollmentsRes.json();

        setStudents(Array.isArray(studentsData) ? studentsData : []);
        setEnrollments(Array.isArray(enrollmentsData.enrollments) ? enrollmentsData.enrollments : []);
      } catch (err) {
        setStudents([]);
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Helper: count enrollments and completions per student
  const getStudentStats = (studentId: string) => {
    const studentEnrollments = enrollments.filter(e => e.studentId?._id === studentId || e.studentId === studentId);
    const completedCourses = studentEnrollments.filter(e => e.progress === 100).length;
    return {
      enrolledCourses: studentEnrollments.length,
      completedCourses,
    };
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats for cards
  const totalCompletions = students.reduce((acc, student) => acc + getStudentStats(student._id).completedCourses, 0);
  const totalEnrollments = students.reduce((acc, student) => acc + getStudentStats(student._id).enrolledCourses, 0);
  const avgCompletionRate =
    students.length > 0
      ? Math.round(
          students.reduce(
            (acc, s) => acc + (getStudentStats(s._id).enrolledCourses
              ? (getStudentStats(s._id).completedCourses / getStudentStats(s._id).enrolledCourses) * 100
              : 0),
            0
          ) / students.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Student Analytics</h1>
          <p className="text-gray-600">Manage and view student progress and enrollments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.filter(s => s.isActive !== false).length}
              </div>
              <p className="text-xs text-muted-foreground">Currently learning</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Course Completions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalCompletions}
              </div>
              <p className="text-xs text-muted-foreground">Total completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {avgCompletionRate}%
              </div>
              <p className="text-xs text-muted-foreground">Platform average</p>
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
                  placeholder="Search students..."
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

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Students</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Enrolled Courses</TableHead>
                    <TableHead>Completed Courses</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => {
                    const stats = getStudentStats(student._id);
                    return (
                      <TableRow key={student._id || student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{stats.enrolledCourses}</TableCell>
                        <TableCell>{stats.completedCourses}</TableCell>
                        <TableCell>
                          {student.joinedAt
                            ? new Date(student.joinedAt).toLocaleDateString()
                            : ''}
                        </TableCell>
                        <TableCell>
                          <Badge variant={student.isActive !== false ? "default" : "secondary"}>
                            {student.isActive !== false ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/admin/students/${student._id || student.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentAnalytics;
