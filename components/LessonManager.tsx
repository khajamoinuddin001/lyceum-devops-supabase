
import React, { useState } from 'react';
import type { Course, Module, Lesson, Question } from '../types';
import { VideoCameraIcon } from './icons/VideoCameraIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { useAdminData } from '../hooks/useLmsData';

type LessonManagerProps = {
    course: Course;
    setCurrentView: (view: string) => void;
    onAddModule: (courseId: string, title: string) => Promise<void>;
    onAddLesson: (courseId: string, moduleId: string, lesson: Omit<Lesson, 'id' | 'completed'>) => Promise<void>;
};

export const LessonManager: React.FC<LessonManagerProps> = ({ course, setCurrentView, onAddModule, onAddLesson }) => {
    const [isAddingModule, setIsAddingModule] = useState(false);
    const [moduleTitle, setModuleTitle] = useState('');
    
    const [activeModuleId, setActiveModuleId] = useState<string | null>(null); 
    
    // Lesson State
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonType, setLessonType] = useState<'text' | 'video' | 'quiz'>('text');
    const [lessonContent, setLessonContent] = useState('');
    const [lessonDuration, setLessonDuration] = useState('10');
    const [videoUrl, setVideoUrl] = useState('');
    
    // Quiz State
    const [questions, setQuestions] = useState<Question[]>([]);
    const [newQuestionText, setNewQuestionText] = useState('');
    const [newOption1, setNewOption1] = useState('');
    const [newOption2, setNewOption2] = useState('');
    const [newOption3, setNewOption3] = useState('');
    const [newOption4, setNewOption4] = useState('');
    const [correctOptionIndex, setCorrectOptionIndex] = useState(0);

    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { handleRemoveModule, handleRemoveLesson, handleUpdateLesson } = useAdminData();

    // Defensive check
    if (!course) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading curriculum data...</p>
                <button onClick={() => setCurrentView('lms')} className="mt-4 text-primary-600 hover:underline">
                    Return to Course List
                </button>
            </div>
        );
    }

    const modules = Array.isArray(course.modules) ? course.modules : [];

    const handleSubmitModule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!moduleTitle.trim()) return;
        setIsSubmitting(true);
        try {
            await onAddModule(course.id, moduleTitle);
            setModuleTitle('');
            setIsAddingModule(false);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const startEditLesson = (moduleId: string, lesson: Lesson) => {
        setActiveModuleId(moduleId);
        setEditingLessonId(lesson.id);
        setLessonTitle(lesson.title);
        setLessonType(lesson.type);
        setLessonContent(lesson.content);
        setLessonDuration(lesson.duration.toString());
        setVideoUrl(lesson.videoUrl || '');
        setQuestions(lesson.questions || []);
    }

    const cancelEdit = () => {
        setEditingLessonId(null);
        setLessonTitle('');
        setLessonContent('');
        setVideoUrl('');
        setQuestions([]);
        setLessonType('text');
    }

    const addQuestion = () => {
        if (!newQuestionText.trim() || !newOption1.trim() || !newOption2.trim()) return;
        const newQuestion: Question = {
            id: `q-${Date.now()}`,
            text: newQuestionText,
            options: [newOption1, newOption2, newOption3, newOption4].filter(o => o.trim() !== ''),
            correctAnswer: correctOptionIndex
        };
        setQuestions([...questions, newQuestion]);
        setNewQuestionText('');
        setNewOption1('');
        setNewOption2('');
        setNewOption3('');
        setNewOption4('');
        setCorrectOptionIndex(0);
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleSubmitLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeModuleId || !lessonTitle.trim()) return;
        setIsSubmitting(true);

        const lessonData = {
            title: lessonTitle,
            type: lessonType,
            content: lessonContent,
            duration: parseInt(lessonDuration) || 10,
            videoUrl: lessonType === 'video' ? videoUrl : undefined,
            questions: lessonType === 'quiz' ? questions : undefined
        };

        try {
            if (editingLessonId) {
                 await handleUpdateLesson(course.id, activeModuleId, editingLessonId, lessonData);
                 cancelEdit();
            } else {
                 await onAddLesson(course.id, activeModuleId, lessonData);
                 setLessonTitle('');
                 setLessonContent('');
                 setVideoUrl('');
                 setQuestions([]);
            }
            // We don't close the active module to allow adding more
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteModule = async (moduleId: string) => {
        if(window.confirm("Are you sure you want to delete this module? All lessons inside will be lost.")) {
            await handleRemoveModule(course.id, moduleId);
        }
    }

    const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
        if(window.confirm("Are you sure you want to delete this lesson?")) {
            await handleRemoveLesson(course.id, moduleId, lessonId);
        }
    }

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
                {modules.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">This course has no content yet.</p>
                        <button 
                            onClick={() => setIsAddingModule(true)}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium inline-flex items-center"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" /> Start by Adding a Module
                        </button>
                    </div>
                )}
                
                {modules.map((module) => (
                    <div key={module.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-100 dark:border-gray-700">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">{module.title}</h3>
                            <div className="flex items-center space-x-2">
                                <button 
                                    onClick={() => {
                                        setActiveModuleId(activeModuleId === module.id ? null : module.id);
                                        cancelEdit();
                                    }}
                                    className={`text-sm px-3 py-1 rounded-md border transition-colors ${activeModuleId === module.id 
                                        ? 'bg-gray-200 dark:bg-gray-600 border-gray-300 text-gray-800' 
                                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50'}`}
                                >
                                    {activeModuleId === module.id ? 'Cancel' : '+ Add Lesson'}
                                </button>
                                <button 
                                    onClick={() => handleDeleteModule(module.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Delete Module"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        
                        {activeModuleId === module.id && (
                            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-b dark:border-gray-700 animate-fade-in-right">
                                <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-4">
                                    {editingLessonId ? `Edit Lesson` : `New Lesson for "${module.title}"`}
                                </h4>
                                <form onSubmit={handleSubmitLesson} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={lessonTitle}
                                                onChange={e => setLessonTitle(e.target.value)}
                                                className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                            <select 
                                                value={lessonType} 
                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLessonType(e.target.value as 'text' | 'video' | 'quiz')}
                                                className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            >
                                                <option value="text">Text Article</option>
                                                <option value="video">Video Lesson</option>
                                                <option value="quiz">Quiz</option>
                                            </select>
                                        </div>
                                    </div>

                                    {lessonType === 'video' && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Video URL (YouTube Embed)</label>
                                            <input 
                                                type="url" 
                                                placeholder="https://www.youtube.com/embed/..." 
                                                value={videoUrl}
                                                onChange={e => setVideoUrl(e.target.value)}
                                                className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            />
                                        </div>
                                    )}

                                    {lessonType === 'text' && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Content / Notes</label>
                                            <textarea 
                                                rows={3}
                                                value={lessonContent}
                                                onChange={e => setLessonContent(e.target.value)}
                                                className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            />
                                        </div>
                                    )}

                                    {lessonType === 'quiz' && (
                                        <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded border dark:border-gray-600">
                                            <h5 className="font-bold text-sm text-gray-800 dark:text-white">Quiz Questions</h5>
                                            <div className="space-y-2">
                                                {questions.map((q, idx) => (
                                                    <div key={q.id} className="flex justify-between items-start p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                                                        <div>
                                                            <p className="font-medium dark:text-gray-200">{idx + 1}. {q.text}</p>
                                                            <ul className="pl-4 list-disc text-gray-500 dark:text-gray-400">
                                                                {q.options.map((opt, i) => (
                                                                    <li key={i} className={i === q.correctAnswer ? 'text-green-600 font-bold' : ''}>{opt}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <button type="button" onClick={() => removeQuestion(idx)} className="text-red-500 hover:text-red-700">
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="border-t pt-2 mt-2">
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">New Question</label>
                                                <input 
                                                    type="text"
                                                    placeholder="Question text..."
                                                    value={newQuestionText}
                                                    onChange={e => setNewQuestionText(e.target.value)}
                                                    className="p-2 border rounded w-full mb-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                />
                                                <div className="grid grid-cols-2 gap-2 mb-2">
                                                    {[newOption1, newOption2, newOption3, newOption4].map((opt, i) => (
                                                        <div key={i} className="flex items-center">
                                                            <input 
                                                                type="radio" 
                                                                name="correctAnswer" 
                                                                checked={correctOptionIndex === i}
                                                                onChange={() => setCorrectOptionIndex(i)}
                                                                className="mr-2"
                                                            />
                                                            <input 
                                                                type="text" 
                                                                placeholder={`Option ${i + 1}`} 
                                                                value={i === 0 ? newOption1 : i === 1 ? newOption2 : i === 2 ? newOption3 : newOption4}
                                                                onChange={e => {
                                                                    const val = e.target.value;
                                                                    if(i===0) setNewOption1(val);
                                                                    if(i===1) setNewOption2(val);
                                                                    if(i===2) setNewOption3(val);
                                                                    if(i===3) setNewOption4(val);
                                                                }}
                                                                className="p-1 border rounded w-full text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={addQuestion}
                                                    className="text-xs bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 px-3 py-1 rounded"
                                                >
                                                    + Add Question
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-2">
                                        <input 
                                            type="number" 
                                            value={lessonDuration}
                                            onChange={e => setLessonDuration(e.target.value)}
                                            className="p-2 border rounded w-20 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                        <span className="text-xs text-gray-500">minutes duration</span>
                                    </div>

                                    <div className="flex justify-end space-x-2 pt-2">
                                        {editingLessonId && (
                                            <button 
                                                type="button"
                                                onClick={cancelEdit}
                                                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
                                            >
                                                Cancel Edit
                                            </button>
                                        )}
                                        <button 
                                            type="submit" 
                                            disabled={isSubmitting}
                                            className="px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 font-medium shadow-sm"
                                        >
                                            {isSubmitting ? 'Saving...' : (editingLessonId ? 'Update Lesson' : 'Save Lesson')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {(!module.lessons || module.lessons.length === 0) ? (
                                <p className="p-4 text-sm text-gray-400 italic text-center">No lessons in this module yet.</p>
                            ) : (
                                module.lessons.map(lesson => (
                                    <div key={lesson.id} className="p-3 pl-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                        <div className="flex items-center">
                                            {lesson.type === 'video' ? (
                                                <VideoCameraIcon className="w-5 h-5 text-red-500 mr-3" />
                                            ) : lesson.type === 'quiz' ? (
                                                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                                            ) : (
                                                <DocumentTextIcon className="w-5 h-5 text-blue-500 mr-3" />
                                            )}
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{lesson.title}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mr-3">{lesson.duration}m</span>
                                            <button 
                                                onClick={() => startEditLesson(module.id, lesson)}
                                                className="p-1 text-gray-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity mr-1"
                                                title="Edit Lesson"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteLesson(module.id, lesson.id)}
                                                className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Delete Lesson"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {modules.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center mt-6">
                    {!isAddingModule ? (
                        <button 
                            onClick={() => setIsAddingModule(true)}
                            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" /> Add Another Module
                        </button>
                    ) : (
                        <form onSubmit={handleSubmitModule} className="w-full max-w-md flex flex-col items-center space-y-3 animate-fade-in-right">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">New Module Title</h4>
                            <input 
                                type="text" 
                                autoFocus
                                placeholder="e.g., Chapter 2: Advanced Concepts"
                                value={moduleTitle}
                                onChange={e => setModuleTitle(e.target.value)}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500"
                            />
                            <div className="flex space-x-2 w-full justify-end">
                                <button 
                                    type="button" 
                                    onClick={() => setIsAddingModule(false)}
                                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 font-medium"
                                >
                                    {isSubmitting ? 'Saving...' : 'Create Module'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};
