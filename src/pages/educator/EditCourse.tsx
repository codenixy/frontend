import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    duration: '',
    // level: 'Beginner'
  });
  const [loading, setLoading] = useState(true);

  // Fetch course from backend
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Course not found');
        setFormData({
          title: data.course.title || '',
          description: data.course.description || '',
          price: data.course.price?.toString() || '',
          category: data.course.category || '',
          duration: data.course.duration || '',
          // level: data.course.level || 'Beginner'
        });
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to fetch course.',
          variant: 'destructive'
        });
        navigate('/educator/courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, toast, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${SERVER_URL}/api/courses/${courseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update course');
      toast({
        title: "Course Updated!",
        description: "Your course has been updated successfully.",
      });
      navigate(`/educator/courses/${courseId}`);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update course.',
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
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Course</h1>
          <p className="text-gray-600">Update your course information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter course title"
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
                  placeholder="Describe what students will learn..."
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 10 hours"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Technology, Design"
                  />
                </div>
                
                {/* <div>
                  <Label htmlFor="level">Level *</Label>
                  <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  </div> */}
                  </div>

              <div className="flex space-x-4">
                <Button type="submit" className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Update Course
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

export default EditCourse;
