import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, PlayCircle, CheckCircle, User, ShoppingCart, Star, Award } from 'lucide-react';
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Course not found</h2>
          <Button onClick={() => navigate('/courses')} className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white border-0">
            Browse Courses
          </Button>
        </div>
      </div>
    );
  }

  const totalVideos = course.modules?.reduce(
    (total: number, module: any) => total + (module.videos?.length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="mb-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <div className="relative">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                <Badge className="absolute top-4 right-4 bg-cyan-500/20 backdrop-blur-xl text-cyan-300 border border-cyan-400/30">
                  {course.category}
                </Badge>
              </div>
              
              <CardHeader className="text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-cyan-300">
                      <Users className="w-5 h-5 mr-2" />
                      <span className="text-lg font-semibold">{course.enrolledCount ?? 0} students</span>
                    </div>
                    <div className="flex items-center text-yellow-400">
                      <Star className="w-5 h-5 mr-1" />
                      <span>4.8</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    {course.price === 0 ? "Free" : `$${course.price}`}
                  </div>
                </div>
                
                <CardTitle className="text-3xl text-white mb-4">{course.title}</CardTitle>
                
                <div className="flex items-center space-x-2 text-cyan-200/80">
                  <User className="w-4 h-4" />
                  <span>by {course.educatorId?.name ?? 'Educator'}</span>
                </div>
              </CardHeader>
              
              <CardContent className="text-white">
                <p className="text-cyan-200/80 text-lg leading-relaxed mb-6">
                  {course.description}
                </p>
                
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <Clock className="w-6 h-6 mx-auto text-cyan-400 mb-2" />
                    <div className="font-semibold text-white">{course.duration ?? '-'}</div>
                    <div className="text-sm text-cyan-200/60">Total Duration</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <PlayCircle className="w-6 h-6 mx-auto text-cyan-400 mb-2" />
                    <div className="font-semibold text-white">{totalVideos}</div>
                    <div className="text-sm text-cyan-200/60">Videos</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <CheckCircle className="w-6 h-6 mx-auto text-cyan-400 mb-2" />
                    <div className="font-semibold text-white">{course.modules?.length || 0}</div>
                    <div className="text-sm text-cyan-200/60">Modules</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {isEnrolled ? (
                    <Button 
                      onClick={() => navigate(`/course/${courseId}`)} 
                      className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white border-0 transform hover:scale-105 transition-all duration-300" 
                      size="lg"
                    >
                      <Award className="w-5 h-5 mr-2" />
                      Continue Learning
                    </Button>
                  ) : course.price === 0 ? (
                    <Button 
                      onClick={handleEnroll} 
                      className="flex-1 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white border-0 transform hover:scale-105 transition-all duration-300" 
                      size="lg"
                    >
                      Enroll Now
                    </Button>
                  ) : inCart ? (
                    <Button 
                      onClick={() => navigate('/cart')}
                      variant="outline"
                      size="lg"
                      className="flex-1 h-12 bg-white/5 border-white/20 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/30 transform hover:scale-105 transition-all duration-300"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Go to Cart
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleAddToCart} 
                      variant="outline" 
                      size="lg"
                      className="flex-1 h-12 bg-white/5 border-white/20 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/30 transform hover:scale-105 transition-all duration-300"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Course Content */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Course Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {course.modules?.map((module: any, index: number) => (
                    <div key={module._id || module.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h3 className="font-semibold text-lg mb-2 text-white">
                        Module {index + 1}: {module.title}
                      </h3>
                      <p className="text-cyan-200/80 mb-3">{module.description}</p>
                      
                      <div className="space-y-2">
                        {module.videos?.map((video: any, videoIndex: number) => (
                          <div key={video._id || video.id} className="flex items-center space-x-3 py-2">
                            <PlayCircle className="w-5 h-5 text-cyan-400" />
                            <span className="flex-1 text-cyan-200/80">{video.title}</span>
                            <span className="text-sm text-cyan-200/60">{video.duration}</span>
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