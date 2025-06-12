import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const EditModule = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);

  // Fetch module data from backend
  useEffect(() => {
    const fetchModule = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/modules/${moduleId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Module not found');
        setFormData({
          title: data.module?.title || data.title || '',
          description: data.module?.description || data.description || ''
        });
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to fetch module.',
          variant: 'destructive'
        });
        navigate(`/educator/courses/${courseId}`);
      } finally {
        setLoading(false);
      }
    };
    fetchModule();
  }, [moduleId, courseId, toast, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${SERVER_URL}/api/modules/${moduleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update module');
      toast({
        title: "Module Updated!",
        description: "Your module has been updated successfully.",
      });
      navigate(`/educator/courses/${courseId}`);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update module.',
        variant: 'destructive'
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={() => navigate(`/educator/courses/${courseId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Module</h1>
          <p className="text-gray-600">Update module information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Module Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Module Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter module title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Describe what this module covers..."
                  rows={4}
                />
              </div>

              <div className="flex space-x-4">
                <Button type="submit" className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Update Module
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(`/educator/courses/${courseId}`)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditModule;
