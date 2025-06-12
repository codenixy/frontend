import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Star, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

// Updated Course interface as per your Mongoose model
export interface Course {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  educatorId?: { name?: string } | string;
  isApproved?: boolean;
  enrolledCount?: number;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CourseCardProps {
  course: Course;
  onEnroll?: () => void;
  onAddToCart?: () => void;
  onGoToCart?: () => void;
  onContinue?: () => void;
  isEnrolled?: boolean;
  isInCart?: boolean;
  showActions?: boolean;
  viewDetailsLink: string;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onEnroll,
  onAddToCart,
  onGoToCart,
  onContinue,
  isEnrolled = false,
  isInCart = false,
  showActions = true,
  viewDetailsLink
}) => {
  return (
    <Card className="group overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-cyan-400/30 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/20 min-h-[400px] w-full max-w-sm flex flex-col">
      <Link to={viewDetailsLink}>
        <div className="relative cursor-pointer overflow-hidden">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
          
          {/* Overlay Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 bg-cyan-500/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-cyan-400/30">
              <Play className="w-8 h-8 text-cyan-400 ml-1" />
            </div>
          </div>

          {/* Status Badges */}
          <div className="absolute top-3 left-3">
            {!course.isApproved && (
              <Badge className="bg-yellow-500/20 backdrop-blur-xl text-yellow-300 border border-yellow-400/30">
                Pending
              </Badge>
            )}
          </div>
          <div className="absolute top-3 right-3">
            <Badge className="bg-cyan-500/20 backdrop-blur-xl text-cyan-300 border border-cyan-400/30 capitalize">
              {course.category}
            </Badge>
          </div>
        </div>
      </Link>

      <CardHeader className="pb-2 pt-4 px-6 flex-1">
        <Link to={viewDetailsLink}>
          <h3 className="text-lg font-semibold text-white line-clamp-2 min-h-[3.5rem] hover:text-cyan-300 cursor-pointer transition-colors duration-200">
            {course.title}
          </h3>
        </Link>
        <p className="text-sm text-cyan-200/60 mt-1">
          by {typeof course.educatorId === 'object' ? course.educatorId?.name : 'Educator'}
        </p>
      </CardHeader>

      <CardContent className="pb-2 px-6 flex-1">
        <p className="text-cyan-200/80 text-sm line-clamp-3 mb-4 min-h-[4rem]">
          {course.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-cyan-200/60 mb-3">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{course.enrolledCount ?? 0}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>
              {course.createdAt
                ? new Date(course.createdAt).toLocaleDateString()
                : ''}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-cyan-200/60">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <span>4.8</span>
          </div>
          <span>{course.views ?? 0} views</span>
        </div>
      </CardContent>

      <CardFooter className="pt-0 px-6 pb-6 flex flex-col gap-3">
        <div className="flex items-center justify-between w-full">
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {course.price === 0 ? "Free" : `$${course.price}`}
          </span>
          <Button variant="outline" size="sm" asChild className="bg-white/5 border-white/20 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/30">
            <Link to={viewDetailsLink}>
              Details
            </Link>
          </Button>
        </div>

        {showActions && (
          <div className="flex gap-2 w-full">
            {isEnrolled ? (
              <Button 
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white border-0" 
                size="sm" 
                onClick={onContinue}
              >
                Continue
              </Button>
            ) : (
              <>
                <Button 
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white border-0" 
                  size="sm" 
                  onClick={onEnroll}
                >
                  Enroll
                </Button>
                {course.price > 0 && !isEnrolled && (
                  isInCart ? (
                    <Button 
                      className="flex-1 bg-white/5 border-white/20 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/30" 
                      size="sm" 
                      variant="outline" 
                      onClick={onGoToCart}
                    >
                      Go to Cart
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1 bg-white/5 border-white/20 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/30" 
                      size="sm" 
                      variant="outline" 
                      onClick={onAddToCart}
                    >
                      Add to Cart
                    </Button>
                  )
                )}
              </>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default CourseCard;