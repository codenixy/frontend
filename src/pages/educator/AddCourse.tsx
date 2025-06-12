import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const AddCourse = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    image: '',
    category: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${SERVER_URL}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // assuming JWT is stored in localStorage
        },
        body: JSON.stringify(courseData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create course');
      }

      toast({
        title: "Course created!",
        description: "Your course has been created. Now add modules and videos.",
      });

      // Navigate to the newly created course page
      navigate(`/educator/courses/${data.course._id}`);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setCourseData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center animate-glow">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    Create New Course
                  </h1>
                  <p className="text-slate-300 text-lg">
                    Share your knowledge by creating an engaging course
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-cyan-400" />
              Course Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-slate-300">Course Title *</Label>
                <Input
                  id="title"
                  value={courseData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter course title"
                  required
                  className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400/20"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-slate-300">Course Description *</Label>
                <Textarea
                  id="description"
                  value={courseData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe what students will learn"
                  required
                  className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400/20"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-slate-300">Category *</Label>
                <select
                  id="category"
                  value={courseData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  required
                  className="mt-2 block w-full rounded-md bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400/20 p-2 text-sm"
                >
                  <option value="" className="bg-slate-800">Select a category</option>
                  <option value="Web Development" className="bg-slate-800">Web Development</option>
                  <option value="Data Science" className="bg-slate-800">Data Science</option>
                  <option value="Programming Fundamentals" className="bg-slate-800">Programming Fundamentals</option>
                  <option value="Machine Learning" className="bg-slate-800">Machine Learning</option>
                  <option value="Cybersecurity" className="bg-slate-800">Cybersecurity</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="price" className="text-slate-300">Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={courseData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    placeholder="0.00"
                    required
                    className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400/20"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <Label htmlFor="duration" className="text-slate-300">Duration *</Label>
                  <Input
                    id="duration"
                    value={courseData.duration}
                    onChange={(e) => handleChange('duration', e.target.value)}
                    placeholder="e.g., 8 hours"
                    required
                    className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400/20"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image" className="text-slate-300">Course Image URL</Label>
                <Input
                  id="image"
                  value={courseData.image}
                  onChange={(e) => handleChange('image', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400/20"
                />
                <p className="text-sm text-slate-400 mt-1">
                  Recommended size: 400x250px
                </p>
              </div>

              {courseData.image && (
                <div>
                  <Label className="text-slate-300">Preview</Label>
                  <div className="mt-2 relative">
                    <img 
                      src={courseData.image} 
                      alt="Course preview"
                      className="w-64 h-40 object-cover rounded-lg border border-white/20"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/educator/courses')}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
                >
                  Create Course
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddCourse;