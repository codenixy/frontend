import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, Clock, CheckCircle, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const CourseContent = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [watchedVideos, setWatchedVideos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseAndEnrollment = async () => {
      setLoading(true);
      try {
        // Fetch course details
        const courseRes = await fetch(`${SERVER_URL}/api/courses/${courseId}`);
        const courseData = await courseRes.json();
        if (!courseRes.ok) throw new Error(courseData.message || 'Course not found');
        setCourse(courseData.course || courseData);

        // Fetch enrollment details for the current user
        const enrollRes = await fetch(`${SERVER_URL}/api/enrollments/${courseId}/my`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const enrollData = await enrollRes.json();
        if (enrollRes.ok && enrollData.enrollment) {
          setEnrollment(enrollData.enrollment);
          setWatchedVideos(enrollData.enrollment.watchedVideos || []);
        } else {
          setEnrollment(null);
          setWatchedVideos([]);
        }
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to fetch course or enrollment.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCourseAndEnrollment();
    // eslint-disable-next-line
  }, [courseId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/courses')}>Browse Courses</Button>
        </div>
      </div>
    );
  }

  const totalVideos = course.modules?.reduce((acc: number, module: any) => acc + (module.videos?.length || 0), 0);
  const progress = totalVideos > 0 ? (watchedVideos.length / totalVideos) * 100 : 0;

  const handleWatchVideo = (videoId: string) => {
    navigate(`/course/${courseId}/video/${videoId}`);
  };

  const handleStartCourse = () => {
    if (course.modules?.length > 0 && course.modules[0].videos?.length > 0) {
      const firstVideo = course.modules[0].videos[0];
      navigate(`/course/${courseId}/video/${firstVideo._id || firstVideo.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/my-learning')}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Learning
          </Button>
        </div>

        {/* Course Header */}
        <div className="mb-8">
          <div className="flex items-start space-x-6">
            <img 
              src={course.image} 
              alt={course.title}
              className="w-64 h-40 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
              <p className="text-gray-600 mb-4">{course.description}</p>
              <p className="text-lg text-gray-700 mb-4">by {course.instructor || course.educatorId?.name}</p>
              
              <div className="flex items-center space-x-4 mb-4">
                <Badge variant="outline">{course.duration}</Badge>
                <Badge variant="outline">{course.modules?.length || 0} modules</Badge>
                <Badge variant="outline">{totalVideos} videos</Badge>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span>Course Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>

              <Button onClick={handleStartCourse} size="lg">
                {progress > 0 ? 'Continue Learning' : 'Start Course'}
              </Button>
            </div>
          </div>
        </div>

        {/* Course Modules */}
        <div className="space-y-6">
          {course.modules?.length > 0 ? course.modules.map((module: any, moduleIndex: number) => (
            <Card key={module._id || module.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Module {moduleIndex + 1}: {module.title}</span>
                  <Badge variant="outline">
                    {module.videos?.filter((v: any) => watchedVideos.includes(v._id || v.id)).length}/{module.videos?.length || 0} completed
                  </Badge>
                </CardTitle>
                <p className="text-gray-600">{module.description}</p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {module.videos?.map((video: any, videoIndex: number) => {
                    const videoId = video._id || video.id;
                    const isWatched = watchedVideos.includes(videoId);
                    const isFirstVideo = moduleIndex === 0 && videoIndex === 0;
                    const prevVideoWatched = videoIndex === 0 ? 
                      (moduleIndex === 0 ? true : course.modules[moduleIndex - 1].videos?.every((v: any) => watchedVideos.includes(v._id || v.id))) :
                      watchedVideos.includes(module.videos[videoIndex - 1]._id || module.videos[videoIndex - 1].id);
                    const isLocked = !isFirstVideo && !prevVideoWatched;
                    
                    return (
                      <div 
                        key={videoId}
                        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                          isWatched ? 'bg-green-50 border-green-200' : 
                          isLocked ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => !isLocked && handleWatchVideo(videoId)}
                      >
                        <div className="flex items-center space-x-3">
                          {isWatched ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : isLocked ? (
                            <Lock className="w-6 h-6 text-gray-400" />
                          ) : (
                            <PlayCircle className="w-6 h-6 text-blue-600" />
                          )}
                          
                          <div>
                            <h4 className={`font-medium ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
                              {video.title}
                            </h4>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="w-4 h-4 mr-1" />
                              {video.duration}
                            </div>
                          </div>
                        </div>

                        <Button 
                          variant={isWatched ? "outline" : "default"}
                          disabled={isLocked}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isLocked) handleWatchVideo(videoId);
                          }}
                        >
                          {isWatched ? 'Rewatch' : isLocked ? 'Locked' : 'Watch'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )) : (
            <Card>
              <CardContent className="text-center py-16">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No modules available</h3>
                <p className="text-gray-600">This course doesn't have any modules yet. Check back later!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseContent;
