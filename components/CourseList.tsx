import React, { useState, useMemo } from 'react';
import type { Course } from '../types';

type CourseListProps = {
  courses: Course[];
  setCurrentView: (view: string) => void;
  enrollInCourse: (courseId: string) => void;
};

const CourseCard: React.FC<{ course: Course; onDetailsClick: () => void; onEnrollClick: () => void }> = React.memo(({ course, onDetailsClick, onEnrollClick }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col transform hover:-translate-y-1 transition-transform duration-300">
      <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover" />
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{course.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">by {course.instructor}</p>
        <p className="text-gray-700 dark:text-gray-300 mt-4 flex-grow">{course.description}</p>
        <div className="mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              onClick={onDetailsClick}
              className="w-full bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
            >
              {course.enrolled ? 'View Course' : 'View Details'}
            </button>
           {!course.enrolled && (
            <button
              onClick={onEnrollClick}
              className="w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
            >
              Enroll Now
            </button>
           )}
        </div>
      </div>
    </div>
  );
});

export const CourseList: React.FC<CourseListProps> = ({ courses, setCurrentView, enrollInCourse }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCourses = useMemo(() => {
    if (!searchTerm) return courses;
    return courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [courses, searchTerm]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">All Courses</h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
          </div>
          <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="block w-full md:w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-300 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
      </div>

      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                onDetailsClick={() => setCurrentView(`courses/${course.id}`)}
                onEnrollClick={() => enrollInCourse(course.id)}
              />
            ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No Courses Found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {searchTerm ? `We couldn't find any courses matching "${searchTerm}".` : 'There are no courses available at the moment.'}
            </p>
        </div>
      )}
    </div>
  );
};