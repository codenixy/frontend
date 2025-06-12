import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, BookOpen, Shield, Calendar, Edit3, Users, TrendingUp } from 'lucide-react';
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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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
                      <Shield className="w-4 h-4 text-blue-600 mr-1" />
                      <span className="text-sm text-blue-600 font-medium">Administrator</span>
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
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Platform Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCourses}</div>
                  <p className="text-xs text-muted-foreground">
                    {approvedCourses} approved, {pendingCourses} pending
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalCourses > 0 ? Math.round((approvedCourses / totalCourses) * 100) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Course approval rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Educators</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeEducators}</div>
                  <p className="text-xs text-muted-foreground">
                    Creating content
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Users className="w-6 h-6 mb-2" />
                    Manage Students
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <BookOpen className="w-6 h-6 mb-2" />
                    Review Courses
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <TrendingUp className="w-6 h-6 mb-2" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
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

            {/* Change Password */}
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

export default AdminProfile;
