
import React, { useState } from 'react';
import type { Course, Module, Lesson } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { VideoCameraIcon } from './icons/VideoCameraIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { AwardIcon } from './icons/AwardIcon';

type CourseDetailProps = {
  course: Course;
  toggleLessonCompletion: (courseId: string, moduleId: string, lessonId: string) => void;
  setCurrentView: (view: string) => void;
};

const ModuleItem: React.FC<{ module: Module; courseId: string; toggleLessonCompletion: (courseId: string, moduleId: string, lessonId: string) => void; setCurrentView: (view: string) => void; }> = ({ module, courseId, toggleLessonCompletion, setCurrentView }) => {
  const [isOpen, setIsOpen] = useState(true);
  const totalLessons = module.lessons.length;
  const completedLessons = module.lessons.filter(l => l.completed).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <button
        className="w-full flex justify-between items-center p-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{module.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{completedLessons} / {totalLessons} lessons completed</p>
        </div>
        <ChevronDownIcon className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {module.lessons.map(lesson => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              onToggle={() => toggleLessonCompletion(courseId, module.id, lesson.id)}
              onView={() => setCurrentView(`lesson/${courseId}/${module.id}/${lesson.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const LessonItem: React.FC<{ lesson: Lesson; onToggle: () => void; onView: () => void; }> = ({ lesson, onToggle, onView }) => (
  <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700/50 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
    <div className="flex items-center flex-grow cursor-pointer" onClick={onView}>
      <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className="mr-4 flex-shrink-0">
        {lesson.completed ? (
          <CheckCircleIcon className="text-green-500" />
        ) : (
          <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
        )}
      </button>
      <div className="flex items-center">
        {lesson.type === 'video' ? <VideoCameraIcon className="w-5 h-5 mr-2 text-gray-400" /> : <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-400" />}
        <p className={`text-gray-800 dark:text-gray-200 ${lesson.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>{lesson.title}</p>
      </div>
    </div>
    <span className="text-xs text-gray-500 dark:text-gray-400 ml-4">{lesson.duration} mins</span>
  </div>
);

export const CourseDetail: React.FC<CourseDetailProps> = ({ course, toggleLessonCompletion, setCurrentView }) => {
  const totalLessons = course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
  const completedLessons = course.modules.reduce((sum, mod) => sum + mod.lessons.filter(l => l.completed).length, 0);
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  
  return (
    <div className="space-y-6">
      <button onClick={() => setCurrentView('my-courses')} className="text-primary-600 dark:text-primary-400 hover:underline mb-2">&larr; Back to My Courses</button>
      
      {progress === 100 && course.completionDate && (
        <div className="bg-green-50 dark:bg-green-900/50 border-l-4 border-green-400 p-4 rounded-r-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AwardIcon className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-lg text-green-700 dark:text-green-200 font-semibold">
                Congratulations, you've completed this course!
              </p>
              <p className="mt-3 md:mt-0 md:ml-6">
                <button onClick={() => setCurrentView(`certificate/${course.id}`)} className="whitespace-nowrap font-medium text-green-700 dark:text-green-200 hover:text-green-600 dark:hover:text-green-100">
                  View Certificate <span aria-hidden="true">&rarr;</span>
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{course.title}</h1>
        <p className="text-md text-gray-600 dark:text-gray-300 mt-1">by {course.instructor}</p>
        <p className="text-gray-700 dark:text-gray-400 mt-4">{course.description}</p>
        
        <div className="mt-6">
          <div className="flex justify-between mb-1">
            <span className="text-base font-medium text-primary-700 dark:text-white">Progress</span>
            <span className="text-sm font-medium text-primary-700 dark:text-white">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {course.modules.map(module => (
          <ModuleItem key={module.id} module={module} courseId={course.id} toggleLessonCompletion={toggleLessonCompletion} setCurrentView={setCurrentView} />
        ))}
      </div>
    </div>
  );
};