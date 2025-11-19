
import React, { useMemo } from 'react';
import type { Course, Lesson } from '../types';

type LessonViewProps = {
  course: Course;
  lesson: Lesson;
  setCurrentView: (view: string) => void;
  toggleLessonCompletion: (courseId: string, moduleId: string, lessonId: string) => void;
};

export const LessonView: React.FC<LessonViewProps> = ({ course, lesson, setCurrentView, toggleLessonCompletion }) => {
  
  const { currentModuleIndex, currentLessonIndex, currentModule, nextLesson, prevLesson } = useMemo(() => {
    let currentModuleIndex = -1;
    let currentLessonIndex = -1;

    for(let i = 0; i < course.modules.length; i++) {
        const lessonIdx = course.modules[i].lessons.findIndex(l => l.id === lesson.id);
        if (lessonIdx !== -1) {
            currentModuleIndex = i;
            currentLessonIndex = lessonIdx;
            break;
        }
    }
    
    if (currentModuleIndex === -1) {
      // Should not happen if data is consistent
      return { currentModuleIndex: -1, currentLessonIndex: -1, currentModule: null, nextLesson: null, prevLesson: null };
    }

    const currentModule = course.modules[currentModuleIndex];

    let prevLesson = null;
    if (currentLessonIndex > 0) {
        prevLesson = currentModule.lessons[currentLessonIndex - 1];
    } else if (currentModuleIndex > 0) {
        const prevModule = course.modules[currentModuleIndex - 1];
        prevLesson = prevModule.lessons[prevModule.lessons.length - 1];
    }

    let nextLesson = null;
    if (currentLessonIndex < currentModule.lessons.length - 1) {
        nextLesson = currentModule.lessons[currentLessonIndex + 1];
    } else if (currentModuleIndex < course.modules.length - 1) {
        nextLesson = course.modules[currentModuleIndex + 1].lessons[0];
    }

    return { currentLessonIndex, currentModuleIndex, currentModule, nextLesson, prevLesson };
  }, [course, lesson]);

  if (!currentModule) {
      return <div>Lesson not found.</div>;
  }

  const handleNavigate = (targetLesson: Lesson | null | undefined) => {
      if (!targetLesson) return;
      const targetModule = course.modules.find(m => m.lessons.some(l => l.id === targetLesson.id));
      if (targetModule) {
        setCurrentView(`lesson/${course.id}/${targetModule.id}/${targetLesson.id}`);
      }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => setCurrentView(`my-courses/${course.id}`)} className="text-primary-600 dark:text-primary-400 hover:underline mb-4">&larr; Back to Course Overview</button>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{lesson.title}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{course.title} &bull; {currentModule.title}</p>
            </header>
            
            <article className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                {lesson.type === 'video' && lesson.videoUrl && (
                    <div className="relative pb-[56.25%] h-0 mb-6 rounded-lg overflow-hidden shadow-md">
                        <iframe 
                            src={lesson.videoUrl} 
                            title={lesson.title} 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                            className="absolute top-0 left-0 w-full h-full"
                        ></iframe>
                    </div>
                )}
                <p className="whitespace-pre-wrap">{lesson.content}</p>
            </article>
        </div>

        <footer className="bg-gray-50 dark:bg-gray-800/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
                onClick={() => toggleLessonCompletion(course.id, currentModule.id, lesson.id)}
                className={`w-full sm:w-auto font-semibold py-2 px-4 rounded-lg transition-colors ${
                lesson.completed
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
            >
                {lesson.completed ? '✓ Mark as Incomplete' : 'Mark as Complete'}
            </button>
            <div className="flex w-full sm:w-auto justify-between sm:justify-start sm:space-x-4">
                <button
                    onClick={() => handleNavigate(prevLesson)}
                    disabled={!prevLesson}
                    className="py-2 px-4 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed border dark:border-gray-600"
                >
                    &larr; Previous
                </button>
                <button
                    onClick={() => handleNavigate(nextLesson)}
                    disabled={!nextLesson}
                    className="py-2 px-4 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed border dark:border-gray-600"
                >
                    Next &rarr;
                </button>
            </div>
        </footer>
      </div>
    </div>
  );
};