import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const AddEducator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${SERVER_URL}/api/users/educators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...formData,
          role: 'educator', // ensure role is set
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast({
          title: "Educator Added Successfully!",
          description: `${data.user?.name || formData.name} has been added to the platform.`,
        });
        navigate('/admin/educators');
      } else {
        const errorData = await res.json();
        toast({
          title: "Failed to add educator",
          description: errorData.message || "An error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network error",
        description: "Could not connect to the server.",
        variant: "destructive",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" asChild>
            <Link to="/admin/educators">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Educators
            </Link>
          </Button>
          
          <div className="flex items-center space-x-3">
            <UserPlus className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Educator</h1>
              <p className="text-gray-600">Add a new educator to the platform</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Educator Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter educator's full name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="educator@example.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Set a password for the educator"
                />
              </div>

              <div className="flex space-x-4">
                <Button type="submit" className="flex-1">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Educator
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/admin/educators')}>
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

export default AddEducator;
