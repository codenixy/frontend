import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, Plus, UserMinus, UserX } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Educator Management</h1>
            <p className="text-gray-600">Manage platform educators and their access</p>
          </div>
          <Button asChild>
            <Link to="/admin/educators/add">
              <Plus className="w-4 h-4 mr-2" />
              Add Educator
            </Link>
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Educators</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEducators}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Educators</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeEducators}</div>
              <p className="text-xs text-muted-foreground">
                {totalEducators > 0 ? ((activeEducators / totalEducators) * 100).toFixed(1) : 0}% of total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Educators Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Educators</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Educator</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4}>Loading...</TableCell>
                  </TableRow>
                ) : educators.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>No educators found.</TableCell>
                  </TableRow>
                ) : (
                  educators.map((educator) => {
                    const isActive = educator.isApproved === true;
                    return (
                      <TableRow key={educator._id || educator.id}>
                        <TableCell>
                          <div className="font-medium">{educator.name}</div>
                        </TableCell>
                        <TableCell>{educator.email}</TableCell>
                        <TableCell>
                          <Badge variant={isActive ? 'default' : 'secondary'}>
                            {isActive ? 'active' : 'inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/admin/educators/${educator._id || educator.id}`}>
                                View Details
                              </Link>
                            </Button>
                            {isActive ? (
                              // Make Inactive Button with confirmation
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                  >
                                    Make Inactive
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Make Educator Inactive</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to make {educator.name} inactive? This will prevent them from accessing educator features but won't delete their account.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-orange-600 hover:bg-orange-700"
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
                              // Make Active Button with confirmation
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    Make Active
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Make Educator Active</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to make {educator.name} active? This will allow them to access educator features.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-green-600 hover:bg-green-700"
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
                            {/* Delete Button with confirmation */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  Remove
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Educator</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to permanently remove {educator.name} from the platform? This action cannot be undone and will delete all their data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EducatorAnalytics;
