import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, BookOpen, Shield, Calendar, Edit3, Users, TrendingUp, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const AdminProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    profileImage: '',
    role: '',
    joined: ''
  });
  const [loading, setLoading] = useState(true);

  // Password update state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Stats
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [approvedCourses, setApprovedCourses] = useState(0);
  const [pendingCourses, setPendingCourses] = useState(0);
  const [activeEducators, setActiveEducators] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${SERVER_URL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          const user = data.user || {};
          setProfileData({
            name: user.name || '',
            email: user.email || '',
            profileImage: user.profileImage || '',
            role: user.role || '',
            joined: user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : ''
          });
        }
      } catch (err) {
        toast({ title: "Failed to fetch profile", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const studentsRes = await fetch(`${SERVER_URL}/api/users/students`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const studentsData = await studentsRes.json();
        setTotalStudents(Array.isArray(studentsData) ? studentsData.length : 0);

        const educatorsRes = await fetch(`${SERVER_URL}/api/users/educators`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const educatorsData = await educatorsRes.json();
        setActiveEducators(Array.isArray(educatorsData) ? educatorsData.filter(e => e.isApproved !== false).length : 0);

        const coursesRes = await fetch(`${SERVER_URL}/api/courses`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const coursesData = await coursesRes.json();
        const courses = Array.isArray(coursesData.courses) ? coursesData.courses : coursesData;
        setTotalCourses(Array.isArray(courses) ? courses.length : 0);
        setApprovedCourses(Array.isArray(courses) ? courses.filter(c => c.isApproved).length : 0);
        setPendingCourses(Array.isArray(courses) ? courses.filter(c => !c.isApproved && !c.isRejected).length : 0);
      } catch (err) {
        setTotalStudents(0);
        setTotalCourses(0);
        setApprovedCourses(0);
        setPendingCourses(0);
        setActiveEducators(0);
      }
    };

    fetchProfile();
    fetchStats();
  }, []);

  const handleSave = async () => {
    // Validate password fields if any are filled
    if (oldPassword || newPassword || confirmPassword) {
      if (!oldPassword || !newPassword || !confirmPassword) {
        toast({ title: "All password fields are required.", variant: "destructive" });
        return;
      }
      if (newPassword !== confirmPassword) {
        toast({ title: "New passwords do not match.", variant: "destructive" });
        return;
      }
    }

    try {
      const body: any = {
        name: profileData.name,
        profileImage: profileData.profileImage,
      };
      if (oldPassword && newPassword && confirmPassword) {
        body.oldPassword = oldPassword;
        body.newPassword = newPassword;
      }

      const res = await fetch(`${SERVER_URL}/api/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast({ title: "Profile updated successfully!" });
        setIsEditing(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const errorData = await res.json();
        toast({
          title: "Failed to update profile",
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
                      <Shield className="w-4 h-4 text-cyan-400 mr-1" />
                      <span className="text-sm text-cyan-400 font-medium">Administrator</span>
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
            <TabsTrigger value="settings" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Platform Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="group hover:scale-105 transition-all duration-300">
                <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-cyan-400/50 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300">Total Students</CardTitle>
                    <div className="p-2 bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 rounded-lg">
                      <Users className="h-4 w-4 text-cyan-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">{totalStudents}</div>
                    <p className="text-xs text-slate-400">
                      +12% from last month
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="group hover:scale-105 transition-all duration-300">
                <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-purple-400/50 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300">Total Courses</CardTitle>
                    <div className="p-2 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-lg">
                      <BookOpen className="h-4 w-4 text-purple-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">{totalCourses}</div>
                    <p className="text-xs text-slate-400">
                      {approvedCourses} approved, {pendingCourses} pending
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="group hover:scale-105 transition-all duration-300">
                <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-green-400/50 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300">Approval Rate</CardTitle>
                    <div className="p-2 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">
                      {totalCourses > 0 ? Math.round((approvedCourses / totalCourses) * 100) : 0}%
                    </div>
                    <p className="text-xs text-slate-400">
                      Course approval rate
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="group hover:scale-105 transition-all duration-300">
                <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-yellow-400/50 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300">Active Educators</CardTitle>
                    <div className="p-2 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-lg">
                      <User className="h-4 w-4 text-yellow-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">{activeEducators}</div>
                    <p className="text-xs text-slate-400">
                      Creating content
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-cyan-400" />
                  Platform Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col border-white/20 text-white hover:bg-white/10 hover:border-cyan-400/30"
                  >
                    <Users className="w-6 h-6 mb-2 text-cyan-400" />
                    Manage Students
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col border-white/20 text-white hover:bg-white/10 hover:border-purple-400/30"
                  >
                    <BookOpen className="w-6 h-6 mb-2 text-purple-400" />
                    Review Courses
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col border-white/20 text-white hover:bg-white/10 hover:border-green-400/30"
                  >
                    <TrendingUp className="w-6 h-6 mb-2 text-green-400" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
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

            {/* Change Password */}
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

export default AdminProfile;