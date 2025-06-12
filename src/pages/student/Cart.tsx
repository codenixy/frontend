import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Users, Clock, ShoppingBag, Eye, Sparkles, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const Cart = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${SERVER_URL}/api/cart`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch cart');
        setCartItems(data.cart?.courseIds || []);
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to fetch cart.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [toast]);

  const removeFromCart = async (courseId: string) => {
    try {
      const res = await fetch(`${SERVER_URL}/api/cart/${courseId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to remove from cart');
      setCartItems(cartItems.filter(item => (item._id || item.id) !== courseId));
      toast({
        title: "Removed from cart",
        description: "Course has been removed from your cart.",
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to remove from cart.',
        variant: 'destructive'
      });
    }
  };

  const viewCourseDetails = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);

  const handleCheckout = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/cart/checkout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Checkout failed');
      toast({
        title: "Checkout successful!",
        description: data.message || `You have enrolled in ${cartItems.length} courses.`,
      });
      setTimeout(() => {
        navigate('/my-learning');
      }, 1500);
      setCartItems([]);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Checkout failed.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center animate-glow">
                  <ShoppingBag className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    Shopping Cart
                  </h1>
                  <p className="text-slate-300 text-lg mt-2">
                    {cartItems.length} {cartItems.length === 1 ? 'course' : 'courses'} in your cart
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="text-slate-300 mt-2">Loading...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-cyan-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">Your cart is empty</h3>
            <p className="text-slate-400 mb-8">Browse our courses and add them to your cart to get started.</p>
            <Button 
              size="lg" 
              onClick={() => navigate('/courses')}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
            >
              Browse Courses
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((course) => (
                <Card key={course._id || course.id} className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-cyan-400/30 transition-all duration-300">
                  <div className="flex">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-48 h-32 object-cover rounded-l-lg"
                    />
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2 hover:text-cyan-400 transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-slate-400 mb-2">by {course.instructor || course.educatorId?.name}</p>
                          <p className="text-slate-300 text-sm line-clamp-2">
                            {course.description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => viewCourseDetails(course._id || course.id)}
                            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeFromCart(course._id || course.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {course.students}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {course.duration}
                          </div>
                        </div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                          ${course.price}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6 bg-white/10 backdrop-blur-md border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-cyan-400" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Subtotal</span>
                      <span className="text-white">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Tax</span>
                      <span className="text-white">$0.00</span>
                    </div>
                    <div className="border-t border-white/20 pt-4">
                      <div className="flex justify-between font-semibold text-lg">
                        <span className="text-white">Total</span>
                        <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <Button 
                      className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0" 
                      size="lg"
                      onClick={handleCheckout}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Checkout
                    </Button>

                    <div className="text-center">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <Sparkles className="w-3 h-3 mr-1" />
                        30-day money-back guarantee
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;