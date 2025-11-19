
import React, { useState } from 'react';
import type { Course, Module } from '../types';

type AddCourseProps = {
    onAddCourse: (courseData: Omit<Course, 'id' | 'enrolled' | 'completionDate'>) => Promise<void>;
    setCurrentView: (view: string) => void;
};

export const AddCourse: React.FC<AddCourseProps> = ({ onAddCourse, setCurrentView }) => {
    const [title, setTitle] = useState('');
    const [instructor, setInstructor] = useState('');
    const [description, setDescription] = useState('');
    const [thumbnail, setThumbnail] = useState('https://picsum.photos/seed/new/600/400');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !instructor || !description) return;
        
        setIsSubmitting(true);
        
        // Initialize with a default placeholder module
        const defaultModules: Module[] = [
            {
                id: `mod-${Date.now()}`,
                title: 'Introduction',
                lessons: []
            }
        ];

        await onAddCourse({ 
            title, 
            instructor, 
            description, 
            thumbnail,
            modules: defaultModules
        });
        
        setIsSubmitting(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <button onClick={() => setCurrentView('lms')} className="text-primary-600 dark:text-primary-400 hover:underline mb-4">&larr; Back to Courses</button>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sm:p-8 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Course</h2>
                
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Course Title</label>
                    <input
                        type="text"
                        id="title"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                </div>

                <div>
                    <label htmlFor="instructor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Instructor Name</label>
                    <input
                        type="text"
                        id="instructor"
                        required
                        value={instructor}
                        onChange={(e) => setInstructor(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <textarea
                        id="description"
                        required
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                </div>

                <div>
                    <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Thumbnail URL</label>
                    <input
                        type="url"
                        id="thumbnail"
                        value={thumbnail}
                        onChange={(e) => setThumbnail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Enter an image URL for the course card.</p>
                </div>

                <div className="flex justify-end space-x-3">
                    <button type="button" onClick={() => setCurrentView('lms')} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500">
                        Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50">
                        {isSubmitting ? 'Saving...' : 'Create Course'}
                    </button>
                </div>
            </form>
        </div>
    );
};
