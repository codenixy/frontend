import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const EducatorStudentAnalytics = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [studentsWithCourses, setStudentsWithCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${SERVER_URL}/api/educator/students`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.students)) {
          setStudentsWithCourses(data.students);
        } else {
          setStudentsWithCourses([]);
        }
      } catch (err) {
        setStudentsWithCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user]);

  const filteredStudents = studentsWithCourses.filter(student =>
    student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student?.courseName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStudents = studentsWithCourses.length;
  const completedStudents = studentsWithCourses.filter(s => s.completed).length;
  const averageProgress = totalStudents > 0 
    ? studentsWithCourses.reduce((acc, student) => acc + (student.progress || 0), 0) / totalStudents 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Students</h1>
          <p className="text-gray-600">Track your students' progress across your courses</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">Across all courses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedStudents}</div>
              <p className="text-xs text-muted-foreground">
                {totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(averageProgress)}%</div>
              <p className="text-xs text-muted-foreground">Student progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Learners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents - completedStudents}</div>
              <p className="text-xs text-muted-foreground">Currently learning</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>Student Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredStudents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enrolled Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={`${student.id}-${student.courseId}`}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        <div className="max-w-48">
                          <div className="truncate">{student.courseName}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-24">
                          <Progress value={student.progress} className="h-2" />
                          <span className="text-xs text-gray-500 mt-1">
                            {student.progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.completed ? "default" : "secondary"}>
                          {student.completed ? 'Completed' : 'In Progress'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {student.enrolledAt ? new Date(student.enrolledAt).toLocaleDateString() : ''}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/educator/students/${student.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  {searchTerm ? 'No students found matching your search.' : 'No students enrolled in your courses yet.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EducatorStudentAnalytics;
