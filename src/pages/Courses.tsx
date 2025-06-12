import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CourseCard from '@/components/CourseCard';
import { Search, Filter, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [filterBy, setFilterBy] = useState('all');
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [cartCourseIds, setCartCourseIds] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch courses, enrollments, and cart
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // Fetch courses
        const res = await fetch(`${SERVER_URL}/api/courses`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch courses');
        setCourses(data.courses || data);

        // Fetch enrollments and cart if logged in as student
        if (user && user.role === 'student') {
          // Enrollments
          const enrollRes = await fetch(`${SERVER_URL}/api/enrollments`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          if (enrollRes.ok) {
            const enrollData = await enrollRes.json();
            setEnrolledCourseIds(
              (enrollData.enrollments || []).map((e: any) =>
                (e.courseId?._id || e.courseId?.id || e.courseId).toString()
              )
            );
          }

          // Cart
          const cartRes = await fetch(`${SERVER_URL}/api/cart`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          if (cartRes.ok) {
            const cartData = await cartRes.json();
            setCartCourseIds(
              (cartData.cart?.courseIds || []).map((c: any) =>
                (c._id || c.id || c).toString()
              )
            );
          }
        }
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to fetch courses.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [toast, user]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.instructor?.toLowerCase?.() || course.educatorId?.name?.toLowerCase?.() || '').includes(searchTerm.toLowerCase());

    if (filterBy === 'all') return matchesSearch;
    if (filterBy === 'free') return matchesSearch && course.price === 0;
    if (filterBy === 'paid') return matchesSearch && course.price > 0;

    return matchesSearch;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.students || 0) - (a.students || 0);
      case 'price-low':
        return (a.price || 0) - (b.price || 0);
      case 'price-high':
        return (b.price || 0) - (a.price || 0);
      default:
        return 0;
    }
  });

  // Enroll in course
  const handleEnroll = async (courseId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'student') {
      toast({
        title: "Only students can enroll",
        description: "Please login as a student to enroll.",
        variant: "destructive"
      });
      return;
    }
    try {
      const res = await fetch(`${SERVER_URL}/api/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to enroll');
      toast({
        title: "Course Enrolled!",
        description: "You have successfully enrolled in the course.",
      });
      setEnrolledCourseIds([...enrolledCourseIds, courseId.toString()]);
      navigate(`/course/${courseId}`);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to enroll.',
        variant: 'destructive'
      });
    }
  };

  // Add to cart
  const handleAddToCart = async (courseId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'student') {
      toast({
        title: "Only students can add to cart",
        description: "Please login as a student to add courses to cart.",
        variant: "destructive"
      });
      return;
    }
    try {
      const res = await fetch(`${SERVER_URL}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ courseId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to add to cart');
      toast({
        title: "Added to Cart",
        description: data.message || "Course has been added to your cart.",
      });
      setCartCourseIds([...cartCourseIds, courseId.toString()]);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to add to cart.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Explore Courses
          </h1>
          <p className="text-cyan-200/80 text-lg">
            Discover your next skill with our comprehensive course catalog
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400/20 rounded-xl h-12"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-cyan-400 focus:ring-cyan-400/20 rounded-xl h-12">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/20 text-white">
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter */}
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-cyan-400 focus:ring-cyan-400/20 rounded-xl h-12">
                <SelectValue placeholder="Filter by price" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/20 text-white">
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-cyan-200/80">
            Showing {sortedCourses.length} of {courses.length} courses
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-cyan-200/80">Loading courses...</p>
          </div>
        ) : (
          <>
            {/* Course Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sortedCourses.map((course) => {
                const id = (course._id || course.id || '').toString();
                if (!id) return null;

                const isEnrolled = enrolledCourseIds.includes(id);
                const isInCart = cartCourseIds.includes(id);

                return (
                  <CourseCard
                    key={id}
                    course={course}
                    viewDetailsLink={`/courses/${id}`}
                    showActions={!!user && user.role === 'student'}
                    isEnrolled={isEnrolled}
                    isInCart={isInCart}
                    onEnroll={() => handleEnroll(id)}
                    onContinue={() => navigate(`/course/${id}`)}
                    onAddToCart={() => handleAddToCart(id)}
                    onGoToCart={() => navigate('/cart')}
                  />
                );
              })}
            </div>

            {/* Empty State */}
            {sortedCourses.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  No courses found
                </h3>
                <p className="text-cyan-200/80 mb-8">
                  Try adjusting your search terms or filters
                </p>
                <Button onClick={() => {
                  setSearchTerm('');
                  setFilterBy('all');
                  setSortBy('popular');
                }} className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white border-0">
                  <Zap className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Courses;