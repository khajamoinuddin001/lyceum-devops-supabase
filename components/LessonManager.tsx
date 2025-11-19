
import React, { useState } from 'react';
import type { Course, Module, Lesson } from '../types';
import { VideoCameraIcon } from './icons/VideoCameraIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { PlusIcon } from './icons/PlusIcon';

type LessonManagerProps = {
    course: Course;
    setCurrentView: (view: string) => void;
    onAddModule: (courseId: string, title: string) => Promise<void>;
    onAddLesson: (courseId: string, moduleId: string, lesson: Omit<Lesson, 'id' | 'completed'>) => Promise<void>;
};

export const LessonManager: React.FC<LessonManagerProps> = ({ course, setCurrentView, onAddModule, onAddLesson }) => {
    const [isAddingModule, setIsAddingModule] = useState(false);
    const [moduleTitle, setModuleTitle] = useState('');
    
    const [activeModuleId, setActiveModuleId] = useState<string | null>(null); // Which module are we adding a lesson to?
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonType, setLessonType] = useState<'text' | 'video'>('text');
    const [lessonContent, setLessonContent] = useState('');
    const [lessonDuration, setLessonDuration] = useState('10');
    const [videoUrl, setVideoUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!course) {
        return <div className="p-8 text-center">Loading course data...</div>;
    }

    // SAFETY: Ensure modules is always an array, strict check
    const modules = Array.isArray(course.modules) ? course.modules : [];

    const handleSubmitModule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!moduleTitle.trim()) return;
        setIsSubmitting(true);
        await onAddModule(course.id, moduleTitle);
        setModuleTitle('');
        setIsAddingModule(false);
        setIsSubmitting(false);
    };

    const handleSubmitLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeModuleId || !lessonTitle.trim()) return;
        setIsSubmitting(true);

        const newLesson = {
            title: lessonTitle,
            type: lessonType,
            content: lessonContent,
            duration: parseInt(lessonDuration) || 10,
            videoUrl: lessonType === 'video' ? videoUrl : undefined,
        };

        await onAddLesson(course.id, activeModuleId, newLesson);
        
        // Reset form
        setLessonTitle('');
        setLessonContent('');
        setVideoUrl('');
        setActiveModuleId(null);
        setIsSubmitting(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
             <div className="flex justify-between items-center">
                <button onClick={() => setCurrentView('lms')} className="text-primary-600 dark:text-primary-400 hover:underline">
                    &larr; Back to Course List
                </button>
             </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Curriculum</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Course: {course.title}</p>
            </div>

            <div className="space-y-4">
                {modules.map((module) => (
                    <div key={module.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{module.title}</h3>
                            <button 
                                onClick={() => setActiveModuleId(module.id)}
                                className="text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500"
                            >
                                + Add Lesson
                            </button>
                        </div>
                        
                        {/* Add Lesson Form (Only visible if active) */}
                        {activeModuleId === module.id && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b dark:border-gray-700">
                                <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-3">New Lesson for "{module.title}"</h4>
                                <form onSubmit={handleSubmitLesson} className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input 
                                            type="text" 
                                            placeholder="Lesson Title" 
                                            required
                                            value={lessonTitle}
                                            onChange={e => setLessonTitle(e.target.value)}
                                            className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                        <select 
                                            value={lessonType} 
                                            onChange={(e: any) => setLessonType(e.target.value)}
                                            className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            <option value="text">Text Article</option>
                                            <option value="video">Video Lesson</option>
                                        </select>
                                    </div>

                                    {lessonType === 'video' && (
                                         <input 
                                            type="url" 
                                            placeholder="YouTube Embed URL (e.g., https://www.youtube.com/embed/...)" 
                                            value={videoUrl}
                                            onChange={e => setVideoUrl(e.target.value)}
                                            className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    )}

                                    <textarea 
                                        placeholder={lessonType === 'video' ? "Video Description/Notes" : "Article Content"}
                                        rows={3}
                                        value={lessonContent}
                                        onChange={e => setLessonContent(e.target.value)}
                                        className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />

                                    <div className="flex items-center space-x-2">
                                        <input 
                                            type="number" 
                                            placeholder="Duration (mins)"
                                            value={lessonDuration}
                                            onChange={e => setLessonDuration(e.target.value)}
                                            className="p-2 border rounded w-24 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                        <span className="text-xs text-gray-500">minutes</span>
                                    </div>

                                    <div className="flex justify-end space-x-2">
                                        <button 
                                            type="button" 
                                            onClick={() => setActiveModuleId(null)}
                                            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={isSubmitting}
                                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            Save Lesson
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {(!module.lessons || module.lessons.length === 0) ? (
                                <p className="p-4 text-sm text-gray-400 italic">No lessons in this module yet.</p>
                            ) : (
                                module.lessons.map(lesson => (
                                    <div key={lesson.id} className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <div className="flex items-center">
                                            {lesson.type === 'video' ? (
                                                <VideoCameraIcon className="w-4 h-4 text-gray-400 mr-3" />
                                            ) : (
                                                <DocumentTextIcon className="w-4 h-4 text-gray-400 mr-3" />
                                            )}
                                            <span className="text-sm text-gray-800 dark:text-gray-200">{lesson.title}</span>
                                        </div>
                                        <span className="text-xs text-gray-500">{lesson.duration}m</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Module Section */}
            <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center">
                {!isAddingModule ? (
                    <button 
                        onClick={() => setIsAddingModule(true)}
                        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" /> Add New Module
                    </button>
                ) : (
                    <form onSubmit={handleSubmitModule} className="w-full max-w-md flex flex-col items-center space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">New Module Title</h4>
                        <input 
                            type="text" 
                            autoFocus
                            placeholder="e.g., Chapter 1: Introduction"
                            value={moduleTitle}
                            onChange={e => setModuleTitle(e.target.value)}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <div className="flex space-x-2">
                            <button 
                                type="button" 
                                onClick={() => setIsAddingModule(false)}
                                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                            >
                                Add Module
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
