
import React, { useState, useMemo, Suspense, lazy, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { useAdminData } from './hooks/useLmsData';
import { useDarkMode } from './hooks/useDarkMode';
import { UserRole, Course, Contact } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GenericSkeleton } from './components/loaders/GenericSkeleton';
import { Auth } from './components/Auth';
import { supabase } from './services/supabaseClient';
import type { Session } from '@supabase/supabase-js';

// Lazy load components for code splitting and faster initial load times
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const StudentDashboard = lazy(() => import('./components/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const CourseList = lazy(() => import('./components/CourseList').then(m => ({ default: m.CourseList })));
const CourseDetail = lazy(() => import('./components/CourseDetail').then(m => ({ default: m.CourseDetail })));
const ContactList = lazy(() => import('./components/ContactList').then(m => ({ default: m.ContactList })));
const ContactDetail = lazy(() => import('./components/ContactDetail').then(m => ({ default: m.ContactDetail })));
const AddContact = lazy(() => import('./components/AddContact').then(m => ({ default: m.AddContact })));
const AddCourse = lazy(() => import('./components/AddCourse').then(m => ({ default: m.AddCourse })));
const CrmBoard = lazy(() => import('./components/CrmBoard').then(m => ({ default: m.CrmBoard })));
const Accounting = lazy(() => import('./components/Accounting').then(m => ({ default: m.Accounting })));
const StudyBuddy = lazy(() => import('./components/StudyBuddy').then(m => ({ default: m.StudyBuddy })));
const LessonView = lazy(() => import('./components/LessonView').then(m => ({ default: m.LessonView })));
const Certificate = lazy(() => import('./components/Certificate').then(m => ({ default: m.Certificate })));
const AdminCourseList = lazy(() => import('./components/AdminCourseList').then(m => ({ default: m.AdminCourseList })));
const LessonManager = lazy(() => import('./components/LessonManager').then(m => ({ default: m.LessonManager })));


const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('admin'); // Default role
  const [currentView, setCurrentView] = useState('dashboard');
  const { courses, contacts, deals, invoices, toggleLessonCompletion, enrollInCourse, addNote, addDocument, loading, addNewContact, addNewCourse, handleAddModule, handleAddLesson } = useAdminData();
  const [theme, toggleTheme] = useDarkMode();
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
        setAuthLoading(false);
        return;
    }

    const handleSession = (session: Session | null) => {
        setSession(session);
        if (session?.user?.email) {
            // Simple role logic for V2: 'admin' in email = Admin role, else Student
            const email = session.user.email.toLowerCase();
            if (email.includes('admin')) {
                setUserRole('admin');
            } else if (email.includes('staff')) {
                setUserRole('staff');
            } else {
                setUserRole('student');
                // Ensure students land on their dashboard, not the admin one
                if (currentView === 'dashboard') {
                    setCurrentView('my-courses');
                }
            }
        }
        setAuthLoading(false);
    };

    // Check for initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
        handleSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
        handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []); // We remove currentView dependency to prevent loops, rely on initial check

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleSignOut = async () => {
    if (supabase) {
        await supabase.auth.signOut();
        setSession(null);
        // Role reset isn't strictly necessary as Auth component takes over, but good for cleanup
        setUserRole('admin'); 
    }
  };

  const currentViewLabel = useMemo(() => {
    const labels: { [key: string]: string } = {
      // Admin & Staff
      dashboard: 'Dashboard',
      contacts: 'Contact Management',
      'contacts/new': 'Create New Contact',
      crm: 'CRM Pipeline',
      lms: 'LMS Course Management',
      'lms/courses/new': 'Create New Course',
      accounting: 'Accounting',
      'study-buddy': 'Study Buddy',
      // Student
      'my-courses': 'My Courses',
      catalog: 'Course Catalog',
    };
    const viewPrefix = currentView.split('/')[0];
    if (currentView.startsWith('lms/courses/') && currentView !== 'lms/courses/new') return 'Course Details';
    if (currentView.startsWith('lms/manage/')) return 'Manage Curriculum';
    if (currentView.startsWith('my-courses/')) return 'Course Details';
    if (currentView.startsWith('lesson/')) return 'Lesson';
    if (currentView.startsWith('contacts/') && currentView !== 'contacts/new') return 'Contact Details';
    if (currentView.startsWith('certificate/')) return 'Certificate of Completion';

    return labels[currentView] || labels[viewPrefix] || 'Lyceum Academy';
  }, [currentView]);

  const handleAddContact = async (contactData: Omit<Contact, 'id' | 'avatar' | 'enrolledCourses' | 'notes' | 'documents'>) => {
    const newContact = await addNewContact(contactData);
    if (newContact) {
      setCurrentView(`contacts`);
    }
  };

  const handleAddCourse = async (courseData: Omit<Course, 'id' | 'enrolled' | 'completionDate'>) => {
      const newCourse = await addNewCourse(courseData);
      if (newCourse) {
          setCurrentView('lms');
      }
  };

  const renderContent = () => {
    // Shared Views (Accessible by all, data/context permitting)
    if (currentView.startsWith('lesson/')) {
      const [, courseId, moduleId, lessonId] = currentView.split('/');
      const course = courses.find(c => c.id === courseId);
      const module = course?.modules.find(m => m.id === moduleId);
      const lesson = module?.lessons.find(l => l.id === lessonId);
      if (course && lesson) {
        return <LessonView course={course} lesson={lesson} setCurrentView={setCurrentView} toggleLessonCompletion={toggleLessonCompletion} />;
      }
    }
    if (currentView.startsWith('certificate/')) {
        const courseId = currentView.split('/')[1];
        const course = courses.find(c => c.id === courseId);
        if (course) {
            const studentName = session?.user.email || "Student"; 
            return <Certificate course={course} studentName={studentName} setCurrentView={setCurrentView}/>
        }
    }
    
    // Student Portal
    if (userRole === 'student') {
        if (currentView.startsWith('my-courses/')) {
            const courseId = currentView.split('/')[1];
            const course = courses.find(c => c.id === courseId);
            if (course) return <CourseDetail course={course} toggleLessonCompletion={toggleLessonCompletion} setCurrentView={setCurrentView} />;
        }
        switch(currentView) {
            case 'my-courses': return <StudentDashboard courses={courses} setCurrentView={setCurrentView} />;
            case 'catalog': return <CourseList courses={courses} setCurrentView={(view) => setCurrentView(`my-courses/${view.split('/')[1]}`)} enrollInCourse={enrollInCourse} />;
            case 'study-buddy': return <StudyBuddy />;
            // Default fallback for students who might have 'dashboard' in state
            default: return <StudentDashboard courses={courses} setCurrentView={setCurrentView} />;
        }
    }

    // Admin & Staff Portal
    if (currentView === 'contacts/new') {
        return <AddContact onAddContact={handleAddContact} setCurrentView={setCurrentView} />;
    }
    if (currentView === 'lms/courses/new') {
        return <AddCourse onAddCourse={handleAddCourse} setCurrentView={setCurrentView} />;
    }
    if (currentView.startsWith('lms/courses/')) {
      const courseId = currentView.split('/')[2];
      const course = courses.find(c => c.id === courseId);
      if (course) return <CourseDetail course={course} toggleLessonCompletion={toggleLessonCompletion} setCurrentView={setCurrentView} />;
    }
    if (currentView.startsWith('lms/manage/')) {
        const courseId = currentView.split('/')[2];
        const course = courses.find(c => c.id === courseId);
        if (course) return <LessonManager course={course} setCurrentView={setCurrentView} onAddModule={handleAddModule} onAddLesson={handleAddLesson} />;
    }
     if (currentView.startsWith('contacts/')) {
      const contactId = currentView.split('/')[1];
      const contact = contacts.find(c => c.id === contactId);
      if (contact) {
        const contactDeals = deals.filter(d => d.contactId === contact.id);
        const contactInvoices = invoices.filter(i => i.contactId === contact.id);
        const contactCourses = courses.filter(c => contact.enrolledCourses.includes(c.id));
        return <ContactDetail 
                  contact={contact} 
                  courses={contactCourses}
                  deals={contactDeals}
                  invoices={contactInvoices}
                  addNote={addNote}
                  addDocument={addDocument}
                  setCurrentView={setCurrentView} 
                />;
      }
    }
    
    switch (currentView) {
      case 'dashboard': return <AdminDashboard contacts={contacts} deals={deals} invoices={invoices} courses={courses} />;
      case 'contacts': return <ContactList contacts={contacts} setCurrentView={setCurrentView} />;
      case 'crm': return <CrmBoard deals={deals} contacts={contacts} />;
      case 'lms': 
        const courseEnrollmentCounts = courses.map(course => ({
            courseId: course.id,
            count: contacts.filter(c => c.enrolledCourses.includes(course.id)).length
        }));
        return <AdminCourseList courses={courses} enrollmentCounts={courseEnrollmentCounts} setCurrentView={(view) => setCurrentView(`lms/${view}`)} />;
      case 'accounting': 
        // Restrict access to accounting for Staff
        if (userRole === 'staff') {
             return (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Staff members do not have permission to view the Accounting module.</p>
                </div>
             );
        }
        return <Accounting invoices={invoices} contacts={contacts} />;
      case 'study-buddy': return <StudyBuddy />;
      default: return <AdminDashboard contacts={contacts} deals={deals} invoices={invoices} courses={courses} />;
    }
  };

  if (authLoading) {
    return (
        <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
            <GenericSkeleton />
        </div>
    );
  }

  // Auth Guard: Show Login screen if no session
  if (!session && supabase) {
      return (
          <div className="bg-gray-100 dark:bg-gray-900 h-screen w-screen">
             <Auth />
          </div>
      );
  }

  // Fallback if Supabase is not configured (Dev Mode warning inside Auth component)
  if (!supabase) {
      return <Auth />;
  }

  return (
    <div className="flex h-[100dvh] bg-gray-100 dark:bg-gray-900">
      <div className={`fixed inset-0 z-50 md:relative md:translate-x-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:shadow-lg`}>
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} toggleSidebar={toggleSidebar} userRole={userRole}/>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={toggleSidebar} 
          currentViewLabel={currentViewLabel} 
          theme={theme}
          toggleTheme={toggleTheme}
          userRole={userRole}
          userEmail={session?.user?.email}
          onSignOut={handleSignOut}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <GenericSkeleton />
            ) : (
              <ErrorBoundary>
                  <Suspense fallback={<GenericSkeleton />}>
                      {renderContent()}
                  </Suspense>
              </ErrorBoundary>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
