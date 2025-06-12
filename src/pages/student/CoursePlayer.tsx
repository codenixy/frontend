import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, PlayCircle, Clock, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const CoursePlayer = () => {
  const { courseId, videoId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [watchedVideos, setWatchedVideos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
  }, [courseId, videoId]);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          <h2 className="text-2xl font-bold text-white mb-2">Course not found</h2>
          <Button 
            onClick={() => navigate('/courses')}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white border-0"
          >
            Browse Courses
          </Button>
        </div>
      </div>
    );
  }

  // Get all videos in order
  const allVideos = course.modules?.flatMap((module: any) =>
    module.videos.map((video: any) => ({ ...video, moduleTitle: module.title }))
  ) || [];

  const currentVideoIndex = allVideos.findIndex((v: any) => v._id === videoId || v.id === videoId);
  const currentVideo = allVideos[currentVideoIndex];
  const nextVideo = allVideos[currentVideoIndex + 1];
  const prevVideo = allVideos[currentVideoIndex - 1];

  if (!currentVideo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Video not found</h2>
          <Button 
            onClick={() => navigate(`/course/${courseId}`)}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white border-0"
          >
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const youtubeVideoId = getYouTubeVideoId(currentVideo.youtubeUrl);

  const isWatched = watchedVideos.includes(currentVideo._id || currentVideo.id);

  // Mark as watched and update progress in backend
  const handleMarkAsWatched = async () => {
    if (!enrollment || isWatched) return;
    try {
      const videoId = (currentVideo._id || currentVideo.id)?.toString();
      setWatchedVideos([...watchedVideos, videoId]);
      const res = await fetch(`${SERVER_URL}/api/enrollments/${enrollment._id}/progress`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ videoId }), // send as { videoId: "..." }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update progress');
      toast({
        title: "Video marked as watched!",
        description: "Great job! Keep up the learning momentum.",
      });
      // Optionally update local progress state from response:
      setEnrollment((prev: any) => prev ? { ...prev, ...data } : prev);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update progress.',
        variant: 'destructive'
      });
    }
  };

  const handleNavigation = (video: any) => {
    if (video) {
      navigate(`/course/${courseId}/video/${video._id || video.id}`);
    }
  };

  const handleVideoClick = (video: any) => {
    navigate(`/course/${courseId}/video/${video._id || video.id}`);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/course/${courseId}`)}
            className="flex items-center text-cyan-400 hover:text-cyan-300 hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Video Player */}
          <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:w-2/3' : 'lg:w-full'}`}>
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video bg-black rounded-t-lg">
                  {youtubeVideoId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                      className="w-full h-full rounded-t-lg"
                      allowFullScreen
                      title={currentVideo.title}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <p>Invalid video URL</p>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-white">{currentVideo.title}</h1>
                    {isWatched && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Watched
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-cyan-200/80 mb-4">Module: {currentVideo.moduleTitle}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-slate-400">
                      <Clock className="w-4 h-4 mr-1" />
                      {currentVideo.duration}
                    </div>
                    
                    <Button 
                      onClick={handleMarkAsWatched}
                      disabled={isWatched}
                      className={isWatched 
                        ? "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30" 
                        : "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white border-0"}
                    >
                      {isWatched ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Watched
                        </>
                      ) : (
                        'Mark as Watched'
                      )}
                    </Button>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between mt-6 pt-6 border-t border-white/10">
                    <Button 
                      variant="outline" 
                      disabled={!prevVideo}
                      className="flex items-center border-white/20 text-white hover:bg-white/10"
                      onClick={() => handleNavigation(prevVideo)}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={toggleSidebar}
                      className="border-white/20 text-white hover:bg-white/10 lg:hidden"
                    >
                      {sidebarOpen ? 'Hide Playlist' : 'Show Playlist'}
                    </Button>
                    
                    <Button 
                      disabled={!nextVideo}
                      className="flex items-center bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white border-0"
                      onClick={() => handleNavigation(nextVideo)}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Video List Sidebar */}
          <div className={`lg:w-1/3 transition-all duration-300 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 sticky top-20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <PlayCircle className="w-5 h-5 mr-2 text-cyan-400" />
                  Course Content
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleSidebar}
                  className="text-cyan-400 hover:text-cyan-300 hover:bg-white/5 hidden lg:flex"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
                  {course.modules.map((module: any, moduleIndex: number) => (
                    <div key={module._id || module.id} className="border-b border-white/10 last:border-b-0">
                      <div className="p-4 bg-white/5">
                        <h4 className="font-medium text-white">{module.title}</h4>
                      </div>
                      {module.videos.map((video: any) => {
                        const isCurrentVideo = (video._id || video.id) === (videoId as string);
                        const isVideoWatched = watchedVideos.includes(video._id || video.id);
                        
                        return (
                          <div
                            key={video._id || video.id}
                            className={`course-video-item ${isCurrentVideo ? 'active' : ''} ${isVideoWatched ? 'completed' : ''}`}
                            onClick={() => handleVideoClick(video)}
                          >
                            <div className="flex items-center space-x-3">
                              {isVideoWatched ? (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                              ) : (
                                <PlayCircle className="w-5 h-5 text-cyan-400" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${
                                  isCurrentVideo ? 'text-white' : 'text-cyan-200/80'
                                }`}>
                                  {video.title}
                                </p>
                                <p className="text-xs text-slate-400">{video.duration}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
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

export default CoursePlayer;