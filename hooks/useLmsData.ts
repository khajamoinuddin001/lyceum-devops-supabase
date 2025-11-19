
import { useState, useEffect, useCallback } from 'react';
import type { Course, Contact, CrmDeal, Invoice, Note, Document, Lesson, CrmStage, Module } from '../types';
import * as api from '../services/api';
import { useToast } from '../components/Toast';

export const useAdminData = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<CrmDeal[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { addToast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [coursesData, contactsData, dealsData, invoicesData] = await Promise.all([
        api.getCourses(),
        api.getContacts(),
        api.getDeals(),
        api.getInvoices(),
      ]);
      setCourses(coursesData);
      setContacts(contactsData);
      setDeals(dealsData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
      addToast("Failed to load academy data.", "error");
    }
  }, [addToast]);

  useEffect(() => {
    const init = async () => {
        setLoading(true);
        await fetchData();
        setLoading(false);
    }
    init();
  }, [fetchData]);

  const toggleLessonCompletion = useCallback(async (courseId: string, moduleId: string, lessonId: string) => {
    // Optimistic update for immediate UI feedback
    setCourses(prevCourses => prevCourses.map(c => {
        if (c.id === courseId) {
            return {
                ...c,
                modules: c.modules.map(m => {
                    if (m.id === moduleId) {
                        return {
                            ...m,
                            lessons: m.lessons.map(l => l.id === lessonId ? { ...l, completed: !l.completed } : l)
                        }
                    }
                    return m;
                })
            }
        }
        return c;
    }));

    try {
      const course = courses.find(c => c.id === courseId);
      const lesson = course?.modules.find(m => m.id === moduleId)?.lessons.find(l => l.id === lessonId);
      if (!lesson) return;

      // Sync to background
      await api.updateLessonCompletion(courseId, moduleId, lessonId, !lesson.completed);

    } catch (error) {
      console.error("Failed to update lesson completion:", error);
      addToast("Failed to update lesson. Please try again.", "error");
      // Revert or refetch would go here in a strict system, but we'll just fetch to be safe
      await fetchData(); 
    }
  }, [courses, addToast, fetchData]);
  
  const enrollInCourse = useCallback(async (courseId: string) => {
    try {
        await api.enrollInCourse(courseId);
        await fetchData();
        addToast(`Successfully enrolled!`, 'success');
    } catch (error) {
        console.error("Failed to enroll in course:", error);
        addToast('Failed to enroll in course.', 'error');
    }
  }, [addToast, fetchData]);

  const addNote = useCallback(async (contactId: string, noteText: string) => {
    try {
        const newNote: Note = { id: '', text: noteText, date: new Date().toISOString() };
        await api.addNoteToContact(contactId, newNote);
        await fetchData();
        addToast("Note added successfully.", "success");
    } catch(e) {
        addToast("Failed to add note.", "error");
    }
  }, [addToast, fetchData]);

  const addDocument = useCallback(async (contactId: string, document: Document) => {
     try {
        await api.addDocumentToContact(contactId, document);
        await fetchData();
        addToast("Document uploaded successfully.", "success");
    } catch(e) {
        addToast("Failed to upload document.", "error");
    }
  }, [addToast, fetchData]);

  const addNewContact = useCallback(async (newContactData: Omit<Contact, 'id' | 'avatar' | 'enrolledCourses' | 'notes' | 'documents'>) => {
    try {
      const savedContact = await api.addContact(newContactData);
      await fetchData();
      addToast("Contact created successfully!", "success");
      return savedContact;
    } catch (error) {
      console.error("Failed to add contact:", error);
      addToast("Failed to create contact.", "error");
      return null;
    }
  }, [addToast, fetchData]);

  const handleUpdateContact = useCallback(async (contactId: string, updates: Partial<Contact>) => {
      try {
          await api.updateContact(contactId, updates);
          // Optimistic update for better UX
          setContacts(prev => prev.map(c => c.id === contactId ? { ...c, ...updates } : c));
          addToast("Contact updated.", "success");
      } catch (error) {
          console.error(error);
          addToast("Failed to update contact.", "error");
      }
  }, [addToast]);

  const handleDeleteContact = useCallback(async (contactId: string) => {
      try {
          await api.deleteContact(contactId);
          await fetchData();
          addToast("Contact deleted.", "success");
          return true;
      } catch (error) {
          console.error(error);
          addToast("Failed to delete contact.", "error");
          return false;
      }
  }, [addToast, fetchData]);

  const addNewCourse = useCallback(async (courseData: Omit<Course, 'id' | 'enrolled' | 'completionDate'>) => {
    try {
        const newCourse = await api.addCourse(courseData);
        await fetchData();
        addToast("Course created successfully!", "success");
        return newCourse;
    } catch (error) {
        console.error(error);
        addToast("Failed to create course.", "error");
        return null;
    }
  }, [addToast, fetchData]);

  // === ROBUST HANDLERS (ATOMIC UPDATE) ===
  
  const handleAddModule = useCallback(async (courseId: string, moduleTitle: string) => {
    try {
        const updatedCourse = await api.addModule(courseId, moduleTitle);
        setCourses(prev => prev.map(c => c.id === courseId ? updatedCourse : c));
        addToast("Module added successfully", "success");
    } catch (error: any) {
        console.error(error);
        addToast(`Failed to save module: ${error.message}`, "error");
    }
  }, [addToast]);

  const handleAddLesson = useCallback(async (courseId: string, moduleId: string, lessonData: Omit<Lesson, 'id' | 'completed'>) => {
    try {
        const updatedCourse = await api.addLesson(courseId, moduleId, lessonData);
        setCourses(prev => prev.map(c => c.id === courseId ? updatedCourse : c));
        addToast("Lesson added successfully", "success");
    } catch (error: any) {
        console.error(error);
        addToast(`Failed to save lesson: ${error.message}`, "error");
    }
  }, [addToast]);

  const handleUpdateLesson = useCallback(async (courseId: string, moduleId: string, lessonId: string, lessonData: Partial<Lesson>) => {
    try {
        const updatedCourse = await api.updateLesson(courseId, moduleId, lessonId, lessonData);
        setCourses(prev => prev.map(c => c.id === courseId ? updatedCourse : c));
        addToast("Lesson updated.", "success");
    } catch (error: any) {
        addToast(`Failed to update lesson: ${error.message}`, "error");
    }
  }, [addToast]);

  // New: Delete handlers
  const handleRemoveModule = useCallback(async (courseId: string, moduleId: string) => {
    try {
        const updatedCourse = await api.deleteModule(courseId, moduleId);
        setCourses(prev => prev.map(c => c.id === courseId ? updatedCourse : c));
        addToast("Module deleted.", "success");
    } catch (error: any) {
        addToast(`Failed to delete module: ${error.message}`, "error");
    }
  }, [addToast]);

  const handleRemoveLesson = useCallback(async (courseId: string, moduleId: string, lessonId: string) => {
    try {
        const updatedCourse = await api.deleteLesson(courseId, moduleId, lessonId);
        setCourses(prev => prev.map(c => c.id === courseId ? updatedCourse : c));
        addToast("Lesson deleted.", "success");
    } catch (error: any) {
        addToast(`Failed to delete lesson: ${error.message}`, "error");
    }
  }, [addToast]);

  // --- CRM ACTIONS ---
  
  const addCrmDeal = useCallback(async (dealData: Omit<CrmDeal, 'id'>) => {
    try {
        const newDeal = await api.addDeal(dealData);
        await fetchData(); 
        addToast("Deal created successfully!", "success");
        return newDeal;
    } catch (error: any) {
        console.error("Add Deal Error:", error);
        const msg = error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
        addToast(`Failed to create deal: ${msg}`, "error");
    }
  }, [addToast, fetchData]);

  const updateCrmStage = useCallback(async (dealId: string, newStage: CrmStage) => {
      setDeals(prev => prev.map(d => d.id === dealId ? {...d, stage: newStage} : d));
      
      try {
          await api.updateDealStage(dealId, newStage);
          const refreshedDeals = await api.getDeals();
          setDeals(refreshedDeals);
      } catch (error) {
          console.error(error);
          await fetchData(); 
          addToast("Failed to update deal stage.", "error");
      }
  }, [addToast, fetchData]);

  const deleteCrmDeal = useCallback(async (dealId: string) => {
      try {
          await api.deleteDeal(dealId);
          await fetchData();
          addToast("Deal deleted.", "success");
      } catch (error) {
          console.error(error);
          addToast("Failed to delete deal.", "error");
      }
  }, [addToast, fetchData]);

  return { 
    courses, 
    contacts, 
    deals, 
    invoices, 
    toggleLessonCompletion, 
    enrollInCourse, 
    addNote, 
    addDocument, 
    loading, 
    addNewContact, 
    handleDeleteContact,
    handleUpdateContact,
    addNewCourse,
    handleAddModule,
    handleAddLesson,
    handleUpdateLesson,
    handleRemoveModule,
    handleRemoveLesson,
    addCrmDeal,
    updateCrmStage,
    deleteCrmDeal
  };
};
