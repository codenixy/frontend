import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye, Search, Users, Sparkles, Award, Target } from 'lucide-react';
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
                    My Students
                  </h1>
                  <p className="text-slate-300 text-lg">
                    Track your students' progress across your courses
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
                <div className="text-3xl font-bold text-white">{totalStudents}</div>
                <p className="text-xs text-slate-400">Across all courses</p>
              </CardContent>
            </Card>
          </div>

          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-green-400/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Completed Courses</CardTitle>
                <div className="p-2 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-lg">
                  <Award className="h-4 w-4 text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{completedStudents}</div>
                <p className="text-xs text-slate-400">
                  {totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0}% completion rate
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
                <p className="text-xs text-slate-400">Student progress</p>
              </CardContent>
            </Card>
          </div>

          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-yellow-400/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Active Learners</CardTitle>
                <div className="p-2 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-lg">
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{totalStudents - completedStudents}</div>
                <p className="text-xs text-slate-400">Currently learning</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6 bg-white/10 backdrop-blur-md border border-white/20">
          <CardContent className="pt-6">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-4 h-4" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400/20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card className="bg-white/10 backdrop-blur-md border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="w-5 h-5 mr-2 text-cyan-400" />
              Student Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
                <p className="text-slate-300 mt-2">Loading...</p>
              </div>
            ) : filteredStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/20">
                      <TableHead className="text-slate-300">Student Name</TableHead>
                      <TableHead className="text-slate-300">Email</TableHead>
                      <TableHead className="text-slate-300">Course</TableHead>
                      <TableHead className="text-slate-300">Progress</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Enrolled Date</TableHead>
                      <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={`${student.id}-${student.courseId}`} className="border-white/10 hover:bg-white/5">
                        <TableCell className="font-medium text-white">{student.name}</TableCell>
                        <TableCell className="text-slate-300">{student.email}</TableCell>
                        <TableCell>
                          <div className="max-w-48">
                            <div className="truncate text-slate-300">{student.courseName}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-24">
                            <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500"
                                style={{ width: `${student.progress || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-cyan-400 mt-1">
                              {student.progress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={student.completed 
                            ? "bg-green-500/20 text-green-400 border-green-500/30" 
                            : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                          }>
                            {student.completed ? 'Completed' : 'In Progress'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {student.enrolledAt ? new Date(student.enrolledAt).toLocaleDateString() : ''}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            asChild
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Link to={`/educator/students/${student.id}`}>
                              <Eye className="w-4 h-4 mr-1 text-cyan-400" />
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-cyan-400" />
                </div>
                <p className="text-slate-300">
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