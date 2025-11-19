
import React from 'react';
import type { Course } from '../types';
import { AwardIcon } from './icons/AwardIcon';

type CertificateProps = {
  course: Course;
  studentName: string;
  setCurrentView: (view: string) => void;
};

export const Certificate: React.FC<CertificateProps> = ({ course, studentName, setCurrentView }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #certificate-container, #certificate-container * {
            visibility: visible;
          }
          #certificate-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
          }
           .no-print {
            display: none;
          }
        }
      `}</style>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4 no-print">
            <button onClick={() => setCurrentView(`my-courses/${course.id}`)} className="text-primary-600 dark:text-primary-400 hover:underline">
                &larr; Back to Course
            </button>
            <button onClick={handlePrint} className="bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-700">
                Print Certificate
            </button>
        </div>
        <div id="certificate-container" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 sm:p-12 border-4 border-primary-500/50 dark:border-primary-500/70">
          <div className="text-center">
            <div className="flex justify-center mb-4">
                <AwardIcon className="w-16 h-16 text-yellow-500" />
            </div>
            <p className="text-xl font-semibold text-gray-500 dark:text-gray-400 tracking-widest uppercase">
              Certificate of Completion
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-primary-600 dark:text-primary-400 mt-6">
              {studentName}
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mt-4">
              has successfully completed the course
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-white mt-5">
              {course.title}
            </h2>
            <div className="mt-12 flex flex-col sm:flex-row justify-between items-center text-left">
              <div className="text-center sm:text-left mb-4 sm:mb-0">
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{course.instructor}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Instructor, Lyceum Academy</p>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{course.completionDate}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Date of Completion</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
