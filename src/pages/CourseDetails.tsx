import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, PlayCircle, CheckCircle, User, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [inCart, setInCart] = useState(false);

  // Fetch course, enrollment, and cart status
  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        // Fetch course details
        const res = await fetch(`${SERVER_URL}/api/courses/${courseId}`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Course not found');
        }
        const data = await res.json();
        setCourse(data.course || data);

        // Check enrollment status
        if (user && user.role === 'student') {
          const enrollRes = await fetch(`${SERVER_URL}/api/enrollments/${courseId}/status`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          if (enrollRes.ok) {
            const enrollData = await enrollRes.json();
            setIsEnrolled(!!enrollData.enrolled);
          } else {
            setIsEnrolled(false);
          }

          // Check if course is in cart
          const cartRes = await fetch(`${SERVER_URL}/api/cart`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          if (cartRes.ok) {
            const cartData = await cartRes.json();
            const courseIds = cartData.cart?.courseIds || [];
            setInCart(courseIds.some((c: any) => (c._id || c.id) === courseId));
          } else {
            setInCart(false);
          }
        }
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to fetch course.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
    // eslint-disable-next-line
  }, [courseId, user]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
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
        title: "Enrolled Successfully!",
        description: "You can now access the course content.",
      });
      setIsEnrolled(true);
      navigate(`/course/${courseId}`);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to enroll.',
        variant: 'destructive'
      });
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
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
      setInCart(true);
      navigate('/cart');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to add to cart.',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div>Loading...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <Button onClick={() => navigate('/courses')}>Browse Courses</Button>
        </div>
      </div>
    );
  }

  const totalVideos = course.modules?.reduce(
    (total: number, module: any) => total + (module.videos?.length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <div className="relative">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
                <Badge className="absolute top-4 right-4 bg-blue-600">
                  {course.category}
                </Badge>
              </div>
              
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-1 text-gray-500" />
                      <span className="text-lg font-semibold">{course.enrolledCount ?? 0} students</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    {course.price === 0 ? "Free" : `$${course.price}`}
                  </div>
                </div>
                
                <CardTitle className="text-3xl text-gray-900">{course.title}</CardTitle>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span>by {course.educatorId?.name ?? 'Educator'}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {course.description}
                </p>
                
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-100 rounded-lg">
                    <Clock className="w-6 h-6 mx-auto text-gray-600 mb-2" />
                    <div className="font-semibold">{course.duration ?? '-'}</div>
                    <div className="text-sm text-gray-600">Total Duration</div>
                  </div>
                  <div className="text-center p-4 bg-gray-100 rounded-lg">
                    <PlayCircle className="w-6 h-6 mx-auto text-gray-600 mb-2" />
                    <div className="font-semibold">{totalVideos}</div>
                    <div className="text-sm text-gray-600">Videos</div>
                  </div>
                  <div className="text-center p-4 bg-gray-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 mx-auto text-gray-600 mb-2" />
                    <div className="font-semibold">{course.modules?.length || 0}</div>
                    <div className="text-sm text-gray-600">Modules</div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEnrolled ? (
                  <Button 
                    onClick={() => navigate(`/course/${courseId}`)} 
                    className="flex-1" 
                    size="lg"
                  >
                    Continue Learning
                  </Button>
                ) : course.price === 0 ? (
                  <Button onClick={handleEnroll} className="flex-1" size="lg">
                    Enroll Now
                  </Button>
                ) : inCart ? (
                  <Button 
                    onClick={() => navigate('/cart')}
                    variant="outline"
                    size="lg"
                    className="flex-1 flex items-center justify-center"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Go to Cart
                  </Button>
                ) : (
                  <Button onClick={handleAddToCart} variant="outline" size="lg">
                    Add to Cart
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Course Content */}
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {course.modules?.map((module: any, index: number) => (
                    <div key={module._id || module.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-2">
                        Module {index + 1}: {module.title}
                      </h3>
                      <p className="text-gray-600 mb-3">{module.description}</p>
                      
                      <div className="space-y-2">
                        {module.videos?.map((video: any, videoIndex: number) => (
                          <div key={video._id || video.id} className="flex items-center space-x-3 py-2">
                            <PlayCircle className="w-5 h-5 text-gray-400" />
                            <span className="flex-1">{video.title}</span>
                            <span className="text-sm text-gray-500">{video.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
