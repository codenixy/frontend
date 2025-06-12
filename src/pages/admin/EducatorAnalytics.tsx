import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, Plus, UserMinus, UserX, GraduationCap, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const EducatorAnalytics = () => {
  const { toast } = useToast();
  const [educators, setEducators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEducator, setSelectedEducator] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    const fetchEducators = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${SERVER_URL}/api/users/educators`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setEducators(data);
        } else if (res.ok && Array.isArray(data.educators)) {
          setEducators(data.educators);
        } else {
          setEducators([]);
        }
      } catch (err) {
        setEducators([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEducators();
  }, []);

  const totalEducators = educators.length;
  const activeEducators = educators.filter(e => e.isApproved === true).length;

  const handleMakeInactive = (educatorId: string, educatorName: string) => {
    toast({
      title: "Educator deactivated",
      description: `${educatorName} has been made inactive successfully.`,
    });
    setSelectedEducator(null);
  };

  const handleRemoveEducator = (educatorId: string, educatorName: string) => {
    toast({
      title: "Educator removed",
      description: `${educatorName} has been permanently removed from the platform.`,
      variant: "destructive",
    });
    setSelectedEducator(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center animate-glow">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    Educator Management
                  </h1>
                  <p className="text-slate-300 text-lg">
                    Manage platform educators and their access
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Button 
            asChild
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
          >
            <Link to="/admin/educators/add">
              <Plus className="w-4 h-4 mr-2" />
              Add Educator
            </Link>
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-cyan-400/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Total Educators</CardTitle>
                <div className="p-2 bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 rounded-lg">
                  <Users className="h-4 w-4 text-cyan-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{totalEducators}</div>
              </CardContent>
            </Card>
          </div>

          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-purple-400/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Active Educators</CardTitle>
                <div className="p-2 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{activeEducators}</div>
                <p className="text-xs text-slate-400">
                  {totalEducators > 0 ? ((activeEducators / totalEducators) * 100).toFixed(1) : 0}% of total
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Educators Table */}
        <Card className="bg-white/10 backdrop-blur-md border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-cyan-400" />
              All Educators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="text-slate-300">Educator</TableHead>
                    <TableHead className="text-slate-300">Email</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow className="border-white/10">
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
                        <p className="text-slate-300 mt-2">Loading...</p>
                      </TableCell>
                    </TableRow>
                  ) : educators.length === 0 ? (
                    <TableRow className="border-white/10">
                      <TableCell colSpan={4} className="text-center py-8 text-slate-300">No educators found.</TableCell>
                    </TableRow>
                  ) : (
                    educators.map((educator) => {
                      const isActive = educator.isApproved === true;
                      return (
                        <TableRow key={educator._id || educator.id} className="border-white/10 hover:bg-white/5">
                          <TableCell className="text-white">
                            <div className="font-medium">{educator.name}</div>
                          </TableCell>
                          <TableCell className="text-slate-300">{educator.email}</TableCell>
                          <TableCell>
                            <Badge className={isActive 
                              ? "bg-green-500/20 text-green-400 border-green-500/30" 
                              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            }>
                              {isActive ? 'active' : 'inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                asChild
                                className="border-white/20 text-white hover:bg-white/10"
                              >
                                <Link to={`/admin/educators/${educator._id || educator.id}`}>
                                  View Details
                                </Link>
                              </Button>
                              {isActive ? (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-orange-400/30 text-orange-400 hover:bg-orange-400/10"
                                    >
                                      Make Inactive
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-slate-800 border border-white/20 text-white">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-white">Make Educator Inactive</AlertDialogTitle>
                                      <AlertDialogDescription className="text-slate-300">
                                        Are you sure you want to make {educator.name} inactive? This will prevent them from accessing educator features but won't delete their account.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0"
                                        onClick={async () => {
                                          try {
                                            const res = await fetch(`${SERVER_URL}/api/users/educators/${educator._id || educator.id}/approve`, {
                                              method: 'PATCH',
                                              headers: {
                                                'Content-Type': 'application/json',
                                                Authorization: `Bearer ${localStorage.getItem('token')}`,
                                              },
                                              body: JSON.stringify({ isApproved: false }),
                                            });
                                            if (res.ok) {
                                              toast({ title: "Educator made inactive." });
                                              setEducators((prev) =>
                                                prev.map((e) =>
                                                  (e._id || e.id) === (educator._id || educator.id)
                                                    ? { ...e, isApproved: false }
                                                    : e
                                                )
                                              );
                                            } else {
                                              toast({ title: "Failed to update educator.", variant: "destructive" });
                                            }
                                          } catch {
                                            toast({ title: "Failed to update educator.", variant: "destructive" });
                                          }
                                        }}
                                      >
                                        Confirm
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              ) : (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-green-400/30 text-green-400 hover:bg-green-400/10"
                                    >
                                      Make Active
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-slate-800 border border-white/20 text-white">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-white">Make Educator Active</AlertDialogTitle>
                                      <AlertDialogDescription className="text-slate-300">
                                        Are you sure you want to make {educator.name} active? This will allow them to access educator features.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0"
                                        onClick={async () => {
                                          try {
                                            const res = await fetch(`${SERVER_URL}/api/users/educators/${educator._id || educator.id}/approve`, {
                                              method: 'PATCH',
                                              headers: {
                                                'Content-Type': 'application/json',
                                                Authorization: `Bearer ${localStorage.getItem('token')}`,
                                              },
                                              body: JSON.stringify({ isApproved: true }),
                                            });
                                            if (res.ok) {
                                              toast({ title: "Educator made active." });
                                              setEducators((prev) =>
                                                prev.map((e) =>
                                                  (e._id || e.id) === (educator._id || educator.id)
                                                    ? { ...e, isApproved: true }
                                                    : e
                                                )
                                              );
                                            } else {
                                              toast({ title: "Failed to update educator.", variant: "destructive" });
                                            }
                                          } catch {
                                            toast({ title: "Failed to update educator.", variant: "destructive" });
                                          }
                                        }}
                                      >
                                        Confirm
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                                  >
                                    Remove
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-slate-800 border border-white/20 text-white">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">Remove Educator</AlertDialogTitle>
                                    <AlertDialogDescription className="text-slate-300">
                                      Are you sure you want to permanently remove {educator.name} from the platform? This action cannot be undone and will delete all their data.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0"
                                      onClick={async () => {
                                        try {
                                          const res = await fetch(`${SERVER_URL}/api/users/educators/${educator._id || educator.id}`, {
                                            method: 'DELETE',
                                            headers: {
                                              Authorization: `Bearer ${localStorage.getItem('token')}`,
                                            },
                                          });
                                          if (res.ok) {
                                            toast({ title: "Educator removed." });
                                            setEducators((prev) =>
                                              prev.filter((e) => (e._id || e.id) !== (educator._id || educator.id))
                                            );
                                          } else {
                                            toast({ title: "Failed to remove educator.", variant: "destructive" });
                                          }
                                        } catch {
                                          toast({ title: "Failed to remove educator.", variant: "destructive" });
                                        }
                                      }}
                                    >
                                      Confirm
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EducatorAnalytics;