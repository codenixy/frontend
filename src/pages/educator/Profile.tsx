import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, BookOpen, Calendar, Edit3, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const EducatorProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    profileImage: '',
    joined: '',
    role: '',
  });
  const [educatorCourses, setEducatorCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Password update state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const fetchProfileAndCourses = async () => {
      setLoading(true);
      try {
        // Fetch educator profile from /api/users/profile
        const profileRes = await fetch(`${SERVER_URL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const profileJson = await profileRes.json();
        if (profileRes.ok && profileJson.user) {
          setProfileData({
            name: profileJson.user.name || '',
            email: profileJson.user.email || '',
            profileImage: profileJson.user.profileImage || '',
            joined: profileJson.user.joinedAt
              ? new Date(profileJson.user.joinedAt).toLocaleString('default', { month: 'long', year: 'numeric' })
              : '',
            role: profileJson.user.role || '',
          });
        }

        // Fetch educator's courses
        const coursesRes = await fetch(`${SERVER_URL}/api/courses/my`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const coursesJson = await coursesRes.json();
        if (coursesRes.ok) {
          setEducatorCourses(coursesJson.courses || []);
        }
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to fetch profile or courses.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndCourses();
  }, [toast, user]);

  const totalStudents = educatorCourses.reduce((sum, course) => sum + (course.students || 0), 0);

  const handleSave = async () => {
    setIsEditing(false);
    try {
      const res = await fetch(`${SERVER_URL}/api/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: profileData.name,
          profileImage: profileData.profileImage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');
      toast({
        title: 'Profile updated!',
        description: 'Your profile has been updated successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update profile.',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profileData.profileImage} alt={profileData.name} />
                <AvatarFallback className="text-2xl">{profileData.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{profileData.name}</h1>
                    <div className="flex items-center mt-1">
                      <BookOpen className="w-4 h-4 text-blue-600 mr-1" />
                      <span className="text-sm text-blue-600 font-medium">Educator</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Joined {profileData.joined}
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    {educatorCourses.length} courses created
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {totalStudents} students taught
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Teaching Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{educatorCourses.length}</div>
                  <p className="text-xs text-muted-foreground">
                    +1 from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all courses
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Courses */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {educatorCourses.slice(0, 3).map((course) => (
                    <div key={course._id || course.id} className="flex items-center space-x-4">
                      <img 
                        src={course.image} 
                        alt={course.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{course.title}</h4>
                        <p className="text-sm text-gray-500">{course.students || 0} students</p>
                      </div>
                      <Badge variant={course.isApproved ? "default" : "secondary"}>
                        {course.isApproved ? 'Published' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {educatorCourses.map((course) => (
                <Card key={course._id || course.id}>
                  <div className="flex">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-32 h-24 object-cover rounded-l-lg"
                    />
                    <div className="flex-1 p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{course.students || 0} students</p>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant={course.isApproved ? "default" : "secondary"}>
                          {course.isApproved ? 'Published' : 'Pending'}
                        </Badge>
                        <div className="text-sm text-gray-500">
                          ${course.price}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="profileImage">Profile Image URL</Label>
                      <Input
                        id="profileImage"
                        value={profileData.profileImage}
                        onChange={(e) => setProfileData({...profileData, profileImage: e.target.value})}
                      />
                    </div>
                    <Button onClick={handleSave}>Save Changes</Button>
                  </>
                ) : (
                  <div>
                    <Label>Full Name</Label>
                    <p>{profileData.name}</p>
                    <Label>Email</Label>
                    <p>{profileData.email}</p>
                    <Label>Role</Label>
                    <p>{profileData.role}</p>
                    <Label>Date Joined</Label>
                    <p>{profileData.joined}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Password Update Section */}
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="oldPassword">Old Password</Label>
                  <Input
                    id="oldPassword"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter your current password"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button
                  onClick={async () => {
                    if (!oldPassword || !newPassword || !confirmPassword) {
                      toast({ title: "All password fields are required.", variant: "destructive" });
                      return;
                    }
                    if (newPassword !== confirmPassword) {
                      toast({ title: "New passwords do not match.", variant: "destructive" });
                      return;
                    }
                    try {
                      const res = await fetch(`${SERVER_URL}/api/users/profile/password`, {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                        body: JSON.stringify({ oldPassword, newPassword }),
                      });
                      if (res.ok) {
                        toast({ title: "Password updated successfully!" });
                        setOldPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      } else {
                        const errorData = await res.json();
                        toast({
                          title: "Failed to update password",
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
                  }}
                >
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EducatorProfile;