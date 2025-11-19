
import React from 'react';
import type { Course } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';

type AdminCourseListProps = {
  courses: Course[];
  enrollmentCounts: { courseId: string; count: number }[];
  setCurrentView: (view: string) => void;
};

export const AdminCourseList: React.FC<AdminCourseListProps> = ({ courses, enrollmentCounts, setCurrentView }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 sm:p-6 border-b dark:border-gray-700 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Course Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your academy's course offerings.</p>
        </div>
        <button 
            onClick={() => setCurrentView('courses/new')}
            className="bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-700"
        >
            Create New Course
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Course Title</th>
              <th scope="col" className="px-6 py-3 hidden md:table-cell">Instructor</th>
              <th scope="col" className="px-6 py-3">Enrolled</th>
              <th scope="col" className="px-6 py-3 hidden sm:table-cell">Lessons</th>
              <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => {
              const enrollment = enrollmentCounts.find(e => e.courseId === course.id);
              const lessonCount = course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
              return (
              <tr 
                key={course.id} 
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {course.title}
                </td>
                <td className="px-6 py-4 hidden md:table-cell">{course.instructor}</td>
                <td className="px-6 py-4">{enrollment?.count || 0}</td>
                <td className="px-6 py-4 hidden sm:table-cell">{lessonCount}</td>
                <td className="px-6 py-4 text-right flex items-center justify-end space-x-3">
                  <button 
                    onClick={() => setCurrentView(`courses/${course.id}`)} 
                    className="font-medium text-primary-600 dark:text-primary-500 hover:underline"
                  >
                    View
                  </button>
                   <button 
                    onClick={() => setCurrentView(`lms/manage/${course.id}`)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    aria-label="Edit course content"
                  >
                    <PencilIcon />
                  </button>
                  <button 
                    className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                    aria-label="Delete course"
                  >
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
};
