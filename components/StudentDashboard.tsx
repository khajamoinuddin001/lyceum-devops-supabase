
import React from 'react';
import type { Course } from '../types';
import { AwardIcon } from './icons/AwardIcon';
import { SparklesIcon } from './icons/SparklesIcon';

type StudentDashboardProps = {
  courses: Course[];
  setCurrentView: (view: string) => void;
};

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ courses, setCurrentView }) => {
  const enrolledCourses = courses.filter(c => c.enrolled);
  
  const totalLessons = enrolledCourses.reduce((acc, course) => acc + course.modules.flatMap(m => m.lessons).length, 0);
  const completedLessons = enrolledCourses.reduce((acc, course) => acc + course.modules.flatMap(m => m.lessons).filter(l => l.completed).length, 0);
  
  const hour = new Date().getHours();
  let greeting = 'Good morning';
  if (hour >= 12) greeting = 'Good afternoon';
  if (hour >= 17) greeting = 'Good evening';

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 md:p-10 shadow-lg text-white overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
            <SparklesIcon className="w-64 h-64" />
        </div>
        <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">{greeting}, Student!</h1>
            <p className="text-primary-100 mb-6 max-w-xl">
                You've completed {completedLessons} lessons across your courses. Keep up the great momentum!
            </p>
            <button
                onClick={() => setCurrentView('catalog')}
                className="bg-white text-primary-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-100 transition-colors"
            >
                Explore New Courses
            </button>
        </div>
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
              <div key={course.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col h-full">
                <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover" />
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{course.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">by {course.instructor}</p>
                   <div className="mt-4 mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                         <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  
                  <div className="mt-auto">
                      {course.completionDate ? (
                        <button
                          onClick={() => setCurrentView(`certificate/${course.id}`)}
                          className="w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                        >
                          <AwardIcon className="w-5 h-5 mr-2" /> View Certificate
                        </button>
                      ) : (
                        <button
                          onClick={() => setCurrentView(`my-courses/${course.id}`)}
                          className="w-full bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          Continue Learning
                        </button>
                      )}
                  </div>

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
