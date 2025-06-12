import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CourseCard from '@/components/CourseCard';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const SERVER_URL = import.meta.env.VITE_SERVER_URL ;

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
    // eslint-disable-next-line
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
      // navigate('/cart');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to add to cart.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Explore Courses
          </h1>
          <p className="text-gray-600">
            Discover your next skill with our comprehensive course catalog
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter */}
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by price" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {sortedCourses.length} of {courses.length} courses
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">Loading...</div>
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
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No courses found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search terms or filters
                </p>
                <Button onClick={() => {
                  setSearchTerm('');
                  setFilterBy('all');
                  setSortBy('popular');
                }}>
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
