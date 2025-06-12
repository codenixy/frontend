import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock } from 'lucide-react';
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
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 bg-white rounded-xl min-h-[320px] w-full max-w-xs flex flex-col">
      <Link to={viewDetailsLink}>
        <div className="relative cursor-pointer">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-32 object-cover rounded-t-xl"
          />
          {!course.isApproved && (
            <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">Pending</Badge>
          )}
          <Badge className="absolute top-2 right-2 bg-blue-600 text-white capitalize">
            {course.category}
          </Badge>
        </div>
      </Link>

      <CardHeader className="pb-1 pt-3 px-4">
        <Link to={viewDetailsLink}>
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2 min-h-[2.2rem] hover:text-blue-600 cursor-pointer">
            {course.title}
          </h3>
        </Link>
        <p className="text-xs text-gray-500 mt-1">
          by {typeof course.educatorId === 'object' ? course.educatorId?.name : 'Educator'}
        </p>
      </CardHeader>

      <CardContent className="pb-1 px-4 flex-1">
        <p className="text-gray-700 text-xs line-clamp-2 mb-2 min-h-[2rem]">
          {course.description}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>{course.enrolledCount ?? 0} enrolled</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>
              {course.createdAt
                ? new Date(course.createdAt).toLocaleDateString()
                : ''}
            </span>
          </div>
        </div>
        <div className="flex items-center text-xs text-gray-400">
          <span>{course.views ?? 0} views</span>
        </div>
      </CardContent>

      <CardFooter className="pt-0 px-4 pb-4 flex flex-col gap-2">
        <div className="flex items-center justify-between w-full mb-1">
          <span className="text-lg font-bold text-blue-600">
            {course.price === 0 ? "Free" : `$${course.price}`}
          </span>
          <Button variant="outline" size="sm" asChild>
            <Link to={viewDetailsLink}>
              Details
            </Link>
          </Button>
        </div>

        {showActions && (
          <div className="flex gap-2 w-full">
            {isEnrolled ? (
              <Button className="flex-1" size="sm" variant="default" onClick={onContinue}>
                Continue
              </Button>
            ) : (
              <>
                <Button className="flex-1" size="sm" variant="default" onClick={onEnroll}>
                  Enroll
                </Button>
                {course.price > 0 && !isEnrolled && (
                  isInCart ? (
                    <Button className="flex-1" size="sm" variant="outline" onClick={onGoToCart}>
                      Go to Cart
                    </Button>
                  ) : (
                    <Button className="flex-1" size="sm" variant="outline" onClick={onAddToCart}>
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
