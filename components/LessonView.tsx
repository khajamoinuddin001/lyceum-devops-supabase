
import React, { useMemo, useState } from 'react';
import type { Course, Lesson, Question } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

type LessonViewProps = {
  course: Course;
  lesson: Lesson;
  setCurrentView: (view: string) => void;
  toggleLessonCompletion: (courseId: string, moduleId: string, lessonId: string) => void;
};

const QuizPlayer: React.FC<{ questions: Question[]; onPass: () => void }> = ({ questions, onPass }) => {
    const [answers, setAnswers] = useState<{ [key: string]: number }>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const handleSelect = (questionId: string, optionIndex: number) => {
        if (submitted) return;
        setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    };

    const handleSubmit = () => {
        let correctCount = 0;
        questions.forEach(q => {
            if (answers[q.id] === q.correctAnswer) correctCount++;
        });
        const finalScore = Math.round((correctCount / questions.length) * 100);
        setScore(finalScore);
        setSubmitted(true);
        
        if (finalScore >= 70) {
            onPass();
        }
    };

    const handleRetry = () => {
        setAnswers({});
        setSubmitted(false);
        setScore(0);
    }

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            {questions.map((q, idx) => (
                <div key={q.id} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border dark:border-gray-700">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">{idx + 1}. {q.text}</h3>
                    <div className="space-y-2">
                        {q.options.map((opt, i) => {
                            const isSelected = answers[q.id] === i;
                            const isCorrect = q.correctAnswer === i;
                            let optionClass = "p-3 rounded-lg border cursor-pointer transition-colors ";
                            
                            if (submitted) {
                                if (isCorrect) optionClass += "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/50 dark:text-green-200 ";
                                else if (isSelected && !isCorrect) optionClass += "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/50 dark:text-red-200 ";
                                else optionClass += "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500 ";
                            } else {
                                if (isSelected) optionClass += "bg-primary-50 border-primary-500 text-primary-900 dark:bg-primary-900/30 dark:border-primary-500 dark:text-white ";
                                else optionClass += "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 ";
                            }

                            return (
                                <div 
                                    key={i} 
                                    onClick={() => handleSelect(q.id, i)}
                                    className={optionClass}
                                >
                                    {opt}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                {!submitted ? (
                    <button 
                        onClick={handleSubmit}
                        disabled={Object.keys(answers).length < questions.length}
                        className="px-8 py-3 bg-primary-600 text-white font-bold rounded-full shadow hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
                    >
                        Submit Quiz
                    </button>
                ) : (
                    <div className="text-center">
                        <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Your Score</p>
                        <div className={`text-5xl font-bold mb-4 ${score >= 70 ? 'text-green-600' : 'text-red-500'}`}>
                            {score}%
                        </div>
                        {score >= 70 ? (
                            <div className="flex flex-col items-center animate-fade-in-right">
                                <CheckCircleIcon className="w-12 h-12 text-green-500 mb-2" />
                                <p className="text-green-800 dark:text-green-300 font-semibold">Passed! Lesson marked as complete.</p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-red-600 dark:text-red-400 mb-4">You need 70% to pass. Review the material and try again.</p>
                                <button onClick={handleRetry} className="px-6 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700">Retry Quiz</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

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
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{lesson.title}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{course.title} &bull; {currentModule.title}</p>
                    </div>
                    {lesson.type === 'quiz' && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                            Quiz
                        </span>
                    )}
                </div>
            </header>
            
            {lesson.type === 'quiz' ? (
                <QuizPlayer 
                    questions={lesson.questions || []} 
                    onPass={() => {
                        if (!lesson.completed) {
                             toggleLessonCompletion(course.id, currentModule.id, lesson.id);
                        }
                    }}
                />
            ) : (
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
            )}
        </div>

        <footer className="bg-gray-50 dark:bg-gray-800/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            {lesson.type !== 'quiz' && (
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
            )}
            
            {lesson.type === 'quiz' && (
                 <div className={`font-semibold px-4 py-2 rounded-lg ${lesson.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                     {lesson.completed ? '✓ Quiz Passed' : 'Quiz Not Passed'}
                 </div>
            )}

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
