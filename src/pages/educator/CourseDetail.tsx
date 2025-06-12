import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, PlayCircle, Clock, Users, Edit, Trash2, ArrowLeft, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<{ type: 'module' | 'video'; id: string } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ type: 'module' | 'video'; id: string } | null>(null);

  // Fetch course details
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Failed to fetch course');

        setCourse(data.course);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  // Fetch modules for the course
  const fetchModules = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/modules/course/${courseId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch modules');
      setModules(data);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch modules',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (courseId) fetchModules();
  }, [courseId]);

  // Confirm delete dialog
  const confirmDelete = (type: 'module' | 'video', id: string) => {
    setConfirmDialog({ type, id });
  };

  // Actual delete logic
  const handleDeleteConfirmed = async (type: 'module' | 'video', id: string) => {
    try {
      let url = '';
      if (type === 'module') {
        url = `${SERVER_URL}/api/modules/${id}`;
      } else {
        url = `${SERVER_URL}/api/videos/${id}`;
      }
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Failed to delete ${type}`);
      toast({
        title: `${type === 'module' ? 'Module' : 'Video'} deleted`,
        description: `The ${type} has been removed.`,
      });
      setDeleting(null);
      // Refresh modules after deletion
      fetchModules();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || `Failed to delete ${type}`,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error: {error || 'Course not found'}</h2>
          <Button 
            onClick={() => navigate('/educator/courses')}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
          >
            Back to My Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <Button 
            variant="ghost" 
            className="mb-4 text-cyan-400 hover:text-cyan-300 hover:bg-white/5" 
            onClick={() => navigate('/educator/courses')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Courses
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-64 h-40 object-cover rounded-lg border border-white/20"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {course.title}
                  </h1>
                  <p className="text-slate-300 mb-4">{course.description}</p>

                  <div className="flex items-center space-x-4 mb-4">
                    <Badge className={course.isApproved 
                      ? "bg-green-500/20 text-green-400 border-green-500/30" 
                      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    }>
                      {course.isApproved ? 'Approved' : 'Pending Review'}
                    </Badge>
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-400/30">
                      {course.duration}
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                      ${course.price}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-slate-400 mb-4">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1 text-purple-400" />
                      {course.students || 0} students
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button 
                      onClick={() => navigate(`/educator/courses/${courseId}/add-module`)}
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Module
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/educator/courses/${courseId}/edit`)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Course
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modules Section */}
        <div className="space-y-6">
          {modules.length > 0 ? (
            modules.map((module: any, moduleIndex: number) => (
              <Card key={module._id} className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-cyan-400/30 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-cyan-400" />
                      Module {moduleIndex + 1}: {module.title}
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          navigate(`/educator/courses/${courseId}/modules/${module._id}/add-video`)
                        }
                        className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Video
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/educator/courses/${courseId}/modules/${module._id}/edit`)}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => confirmDelete('module', module._id)}
                        className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                        disabled={deleting?.type === 'module' && deleting.id === module._id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-slate-300">{module.description}</p>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {module.videos?.length > 0 ? (
                      module.videos.map((video: any) => (
                        <div
                          key={video._id}
                          className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-400/30 transition-all duration-300"
                        >
                          <div className="flex items-center space-x-3">
                            <PlayCircle className="w-6 h-6 text-cyan-400" />
                            <div>
                              <h4 className="font-medium text-white">{video.title}</h4>
                              <div className="flex items-center text-sm text-slate-400">
                                <Clock className="w-4 h-4 mr-1" />
                                {video.duration}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(`/educator/courses/${courseId}/modules/${module._id}/videos/${video._id}/edit`)
                              }
                              className="border-white/20 text-white hover:bg-white/10"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => confirmDelete('video', video._id)}
                              className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                              disabled={deleting?.type === 'video' && deleting.id === video._id}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-white/20 rounded-lg">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <PlayCircle className="w-8 h-8 text-cyan-400" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">No videos yet</h3>
                        <p className="text-slate-300 mb-4">Add your first video to this module</p>
                        <Button
                          onClick={() =>
                            navigate(`/educator/courses/${courseId}/modules/${module._id}/add-video`)
                          }
                          className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Video
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardContent className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Plus className="w-12 h-12 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No modules yet</h3>
                <p className="text-slate-300 mb-6">Start building your course by adding the first module</p>
                <Button 
                  onClick={() => navigate(`/educator/courses/${courseId}/add-module`)}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Module
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {confirmDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-sm border border-white/20">
              <h2 className="text-lg font-bold text-white mb-2">Are you sure?</h2>
              <p className="mb-4 text-slate-300">
                This will permanently delete the {confirmDialog.type} and all its content.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="destructive"
                  onClick={async () => {
                    await handleDeleteConfirmed(confirmDialog.type, confirmDialog.id);
                    setConfirmDialog(null);
                  }}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0"
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setConfirmDialog(null)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;