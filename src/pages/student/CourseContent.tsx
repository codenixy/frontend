import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, Clock, CheckCircle, Lock, ArrowLeft, BookOpen, Sparkles } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Course not found</h2>
          <Button 
            onClick={() => navigate('/courses')}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
          >
            Browse Courses
          </Button>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/my-learning')}
            className="text-cyan-400 hover:text-cyan-300 hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Learning
          </Button>
        </div>

        {/* Course Header */}
        <div className="mb-8 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="relative">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-full md:w-64 h-40 object-cover rounded-lg border border-white/20"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
                </div>
                
                <div className="flex-1">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {course.title}
                  </h1>
                  <p className="text-slate-300 mb-4">{course.description}</p>
                  <p className="text-lg text-cyan-400 mb-4">by {course.instructor || course.educatorId?.name}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <Badge className="bg-white/10 text-white border-white/20 px-3 py-1">
                      {course.duration}
                    </Badge>
                    <Badge className="bg-white/10 text-white border-white/20 px-3 py-1">
                      {course.modules?.length || 0} modules
                    </Badge>
                    <Badge className="bg-white/10 text-white border-white/20 px-3 py-1">
                      {totalVideos} videos
                    </Badge>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">Course Progress</span>
                      <span className="text-cyan-400">{Math.round(progress)}%</span>
                    </div>
                    <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleStartCourse} 
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
                  >
                    {progress > 0 ? 'Continue Learning' : 'Start Course'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Modules */}
        <div className="space-y-6">
          {course.modules?.length > 0 ? course.modules.map((module: any, moduleIndex: number) => (
            <Card key={module._id || module.id} className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-cyan-400/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <div className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-cyan-400" />
                    <span>Module {moduleIndex + 1}: {module.title}</span>
                  </div>
                  <Badge className="bg-white/10 text-white border-white/20">
                    {module.videos?.filter((v: any) => watchedVideos.includes(v._id || v.id)).length}/{module.videos?.length || 0} completed
                  </Badge>
                </CardTitle>
                <p className="text-slate-300">{module.description}</p>
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
                        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                          isWatched 
                            ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20' 
                            : isLocked 
                              ? 'bg-white/5 border-white/10 cursor-not-allowed opacity-70' 
                              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-400/30'
                        }`}
                        onClick={() => !isLocked && handleWatchVideo(videoId)}
                      >
                        <div className="flex items-center space-x-3">
                          {isWatched ? (
                            <CheckCircle className="w-6 h-6 text-green-400" />
                          ) : isLocked ? (
                            <Lock className="w-6 h-6 text-slate-400" />
                          ) : (
                            <PlayCircle className="w-6 h-6 text-cyan-400" />
                          )}
                          
                          <div>
                            <h4 className={`font-medium ${isLocked ? 'text-slate-400' : 'text-white'}`}>
                              {video.title}
                            </h4>
                            <div className="flex items-center text-sm text-slate-400">
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
                          className={isWatched 
                            ? "border-green-500/30 text-green-400 hover:bg-green-500/10" 
                            : isLocked 
                              ? "bg-slate-700/50 text-slate-400" 
                              : "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
                          }
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
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardContent className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-10 h-10 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No modules available</h3>
                <p className="text-slate-300 mb-6">This course doesn't have any modules yet. Check back later!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseContent;