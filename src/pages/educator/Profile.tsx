import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, BookOpen, Calendar, Edit3, Sparkles, Target } from 'lucide-react';
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8 bg-white/10 backdrop-blur-md border border-white/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-2 border-cyan-400/50">
                  <AvatarImage src={profileData.profileImage} alt={profileData.name} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-cyan-400 to-purple-500 text-white">
                    {profileData.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      {profileData.name}
                    </h1>
                    <div className="flex items-center mt-1">
                      <BookOpen className="w-4 h-4 text-cyan-400 mr-1" />
                      <span className="text-sm text-cyan-400 font-medium">Educator</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center border-white/20 text-white hover:bg-white/10"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
                <div className="flex items-center space-x-6 text-sm text-slate-400">
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
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-md border border-white/20">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500">
              Overview
            </TabsTrigger>
            <TabsTrigger value="courses" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500">
              My Courses
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Teaching Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="group hover:scale-105 transition-all duration-300">
                <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-cyan-400/50 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300">Total Courses</CardTitle>
                    <div className="p-2 bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 rounded-lg">
                      <BookOpen className="h-4 w-4 text-cyan-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">{educatorCourses.length}</div>
                    <p className="text-xs text-slate-400">
                      +1 from last month
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="group hover:scale-105 transition-all duration-300">
                <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-purple-400/50 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300">Total Students</CardTitle>
                    <div className="p-2 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-lg">
                      <User className="h-4 w-4 text-purple-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">{totalStudents}</div>
                    <p className="text-xs text-slate-400">
                      Across all courses
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Courses */}
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="w-5 h-5 mr-2 text-cyan-400" />
                  Recent Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {educatorCourses.slice(0, 3).map((course) => (
                    <div key={course._id || course.id} className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg border border-white/10 hover:border-cyan-400/30 transition-all duration-300">
                      <img 
                        src={course.image} 
                        alt={course.title}
                        className="w-16 h-12 object-cover rounded border border-white/20"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{course.title}</h4>
                        <p className="text-sm text-slate-400">{course.students || 0} students</p>
                      </div>
                      <Badge className={course.isApproved 
                        ? "bg-green-500/20 text-green-400 border-green-500/30" 
                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      }>
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
                <Card key={course._id || course.id} className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-cyan-400/30 transition-all duration-300">
                  <div className="flex">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-32 h-24 object-cover rounded-l-lg"
                    />
                    <div className="flex-1 p-4">
                      <h3 className="font-semibold text-white mb-1">{course.title}</h3>
                      <p className="text-sm text-slate-300 mb-2">{course.students || 0} students</p>
                      
                      <div className="flex items-center justify-between">
                        <Badge className={course.isApproved 
                          ? "bg-green-500/20 text-green-400 border-green-500/30" 
                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        }>
                          {course.isApproved ? 'Published' : 'Pending'}
                        </Badge>
                        <div className="text-sm text-cyan-400">
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
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="profileImage" className="text-slate-300">Profile Image URL</Label>
                      <Input
                        id="profileImage"
                        value={profileData.profileImage}
                        onChange={(e) => setProfileData({...profileData, profileImage: e.target.value})}
                        className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                      />
                    </div>
                    <Button 
                      onClick={handleSave}
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
                    >
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-slate-300">Full Name</Label>
                      <p className="text-white">{profileData.name}</p>
                    </div>
                    <div>
                      <Label className="text-slate-300">Email</Label>
                      <p className="text-white">{profileData.email}</p>
                    </div>
                    <div>
                      <Label className="text-slate-300">Role</Label>
                      <p className="text-white">{profileData.role}</p>
                    </div>
                    <div>
                      <Label className="text-slate-300">Date Joined</Label>
                      <p className="text-white">{profileData.joined}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Password Update Section */}
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="oldPassword" className="text-slate-300">Old Password</Label>
                  <Input
                    id="oldPassword"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword" className="text-slate-300">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-slate-300">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
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
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
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