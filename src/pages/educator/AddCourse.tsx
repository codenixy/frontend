import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Create New Course</h1>
          <p className="text-gray-600">Share your knowledge by creating an engaging course</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  value={courseData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter course title"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Course Description *</Label>
                <Textarea
                  id="description"
                  value={courseData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe what students will learn"
                  required
                  className="mt-1"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={courseData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
                >
                  <option value="">Select a category</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Programming Fundamentals">Programming Fundamentals</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="price">Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={courseData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    placeholder="0.00"
                    required
                    className="mt-1"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    value={courseData.duration}
                    onChange={(e) => handleChange('duration', e.target.value)}
                    placeholder="e.g., 8 hours"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image">Course Image URL</Label>
                <Input
                  id="image"
                  value={courseData.image}
                  onChange={(e) => handleChange('image', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Recommended size: 400x250px
                </p>
              </div>

              {courseData.image && (
                <div>
                  <Label>Preview</Label>
                  <img 
                    src={courseData.image} 
                    alt="Course preview"
                    className="w-64 h-40 object-cover rounded-lg mt-2"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/educator/courses')}
                >
                  Cancel
                </Button>
                <Button type="submit">
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
