import React from 'react';
import type { Course } from '../types';
import { AwardIcon } from './icons/AwardIcon';

type StudentDashboardProps = {
  courses: Course[];
  setCurrentView: (view: string) => void;
};

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ courses, setCurrentView }) => {
  const enrolledCourses = courses.filter(c => c.enrolled);
  
  const totalLessons = enrolledCourses.reduce((acc, course) => acc + course.modules.flatMap(m => m.lessons).length, 0);
  const completedLessons = enrolledCourses.reduce((acc, course) => acc + course.modules.flatMap(m => m.lessons).filter(l => l.completed).length, 0);
  const completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h2>
        <button
          onClick={() => setCurrentView('catalog')}
          className="bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Browse Course Catalog
        </button>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Current Enrollments</h3>
        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map(course => {
               const total = course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
               const completed = course.modules.reduce((sum, mod) => sum + mod.lessons.filter(l => l.completed).length, 0);
               const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
              
              return (
              <div key={course.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover" />
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{course.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">by {course.instructor}</p>
                   <div className="mt-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                         <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  
                  {course.completionDate ? (
                    <button
                      onClick={() => setCurrentView(`certificate/${course.id}`)}
                      className="mt-4 w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                    >
                      <AwardIcon className="w-5 h-5 mr-2" /> View Certificate
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentView(`my-courses/${course.id}`)}
                      className="mt-4 w-full bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Continue Learning
                    </button>
                  )}

                </div>
              </div>
            )})}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No Courses Enrolled</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Visit the 'Course Catalog' to find your next learning opportunity.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};