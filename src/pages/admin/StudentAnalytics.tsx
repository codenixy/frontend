import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Search, Filter, Users, Sparkles, Award, Target } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center animate-glow">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    Student Analytics
                  </h1>
                  <p className="text-slate-300 text-lg">
                    Manage and view student progress and enrollments
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-cyan-400/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Total Students</CardTitle>
                <div className="p-2 bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 rounded-lg">
                  <Users className="h-4 w-4 text-cyan-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{students.length}</div>
                <p className="text-xs text-slate-400">+12% from last month</p>
              </CardContent>
            </Card>
          </div>

          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-purple-400/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Active Students</CardTitle>
                <div className="p-2 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-lg">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {students.filter(s => s.isActive !== false).length}
                </div>
                <p className="text-xs text-slate-400">Currently learning</p>
              </CardContent>
            </Card>
          </div>

          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-green-400/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Course Completions</CardTitle>
                <div className="p-2 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-lg">
                  <Award className="h-4 w-4 text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {totalCompletions}
                </div>
                <p className="text-xs text-slate-400">Total completed</p>
              </CardContent>
            </Card>
          </div>

          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-yellow-400/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Avg. Completion Rate</CardTitle>
                <div className="p-2 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-lg">
                  <Target className="h-4 w-4 text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {avgCompletionRate}%
                </div>
                <p className="text-xs text-slate-400">Platform average</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6 bg-white/10 backdrop-blur-md border border-white/20">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-4 h-4" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400/20"
                />
              </div>
              <Button 
                variant="outline" 
                className="flex items-center border-white/20 text-white hover:bg-white/10"
              >
                <Filter className="w-4 h-4 mr-2 text-cyan-400" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card className="bg-white/10 backdrop-blur-md border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="w-5 h-5 mr-2 text-cyan-400" />
              All Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
                <p className="text-slate-300 mt-2">Loading...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/20">
                      <TableHead className="text-slate-300">Student Name</TableHead>
                      <TableHead className="text-slate-300">Email</TableHead>
                      <TableHead className="text-slate-300">Enrolled Courses</TableHead>
                      <TableHead className="text-slate-300">Completed Courses</TableHead>
                      <TableHead className="text-slate-300">Join Date</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => {
                      const stats = getStudentStats(student._id);
                      return (
                        <TableRow key={student._id || student.id} className="border-white/10 hover:bg-white/5">
                          <TableCell className="font-medium text-white">{student.name}</TableCell>
                          <TableCell className="text-slate-300">{student.email}</TableCell>
                          <TableCell className="text-cyan-400">{stats.enrolledCourses}</TableCell>
                          <TableCell className="text-green-400">{stats.completedCourses}</TableCell>
                          <TableCell className="text-slate-400">
                            {student.joinedAt
                              ? new Date(student.joinedAt).toLocaleDateString()
                              : ''}
                          </TableCell>
                          <TableCell>
                            <Badge className={student.isActive !== false 
                              ? "bg-green-500/20 text-green-400 border-green-500/30" 
                              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            }>
                              {student.isActive !== false ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              asChild
                              className="border-white/20 text-white hover:bg-white/10"
                            >
                              <Link to={`/admin/students/${student._id || student.id}`}>
                                <Eye className="w-4 h-4 mr-1 text-cyan-400" />
                                View
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentAnalytics;