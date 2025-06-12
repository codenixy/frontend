import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Search, Filter, Users, Clock, BookOpen, TrendingUp, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center animate-glow">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    Course Analytics
                  </h1>
                  <p className="text-slate-300 text-lg">
                    Manage and view course performance and enrollments
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-cyan-400/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Total Courses</CardTitle>
                <div className="p-2 bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 rounded-lg">
                  <BookOpen className="h-4 w-4 text-cyan-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{courses.length}</div>
                <p className="text-xs text-slate-400">+3 from last month</p>
              </CardContent>
            </Card>
          </div>

          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-green-400/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Approved Courses</CardTitle>
                <div className="p-2 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-lg">
                  <Sparkles className="h-4 w-4 text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{approvedCourses}</div>
                <p className="text-xs text-slate-400">Ready for enrollment</p>
              </CardContent>
            </Card>
          </div>

          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-purple-400/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Total Enrollments</CardTitle>
                <div className="p-2 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-lg">
                  <Users className="h-4 w-4 text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{totalEnrollments}</div>
                <p className="text-xs text-slate-400">Across all courses</p>
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
                  placeholder="Search courses..."
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

        {/* Courses Table */}
        <Card className="bg-white/10 backdrop-blur-md border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-cyan-400" />
              All Courses
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
                      <TableHead className="text-slate-300">Course Title</TableHead>
                      <TableHead className="text-slate-300">Instructor</TableHead>
                      <TableHead className="text-slate-300">Enrollments</TableHead>
                      <TableHead className="text-slate-300">Modules</TableHead>
                      <TableHead className="text-slate-300">Price</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.map((course) => (
                      <TableRow key={course._id || course.id} className="border-white/10 hover:bg-white/5">
                        <TableCell className="text-white">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={course.image} 
                              alt={course.title}
                              className="w-12 h-8 object-cover rounded border border-white/20"
                            />
                            <div>
                              <div className="font-medium">{course.title}</div>
                              <div className="text-sm text-slate-400 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {course.duration}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {course.educatorId?.name || 'N/A'}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1 text-purple-400" />
                            {course.students || 0}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">{course.modules?.length || 0}</TableCell>
                        <TableCell className="text-cyan-400 font-medium">
                          ${course.price || 0}
                        </TableCell>
                        <TableCell>
                          <Badge className={course.isApproved 
                            ? "bg-green-500/20 text-green-400 border-green-500/30" 
                            : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          }>
                            {course.isApproved ? 'Approved' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            asChild
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Link to={`/admin/courses/${course._id || course.id}`}>
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseAnalytics;