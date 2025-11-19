
import { useState, useEffect, useCallback } from 'react';
import type { Course, Contact, CrmDeal, Invoice, Note, Document } from '../types';
import * as api from '../services/api';
import { useToast } from '../components/Toast';

export const useAdminData = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<CrmDeal[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [addToast]);

  const toggleLessonCompletion = useCallback(async (courseId: string, moduleId: string, lessonId: string) => {
    const originalCourses = [...courses];
    
    const course = courses.find(c => c.id === courseId);
    const lesson = course?.modules.find(m => m.id === moduleId)?.lessons.find(l => l.id === lessonId);
    if (!course || !lesson) return;

    const newCompletedStatus = !lesson.completed;

    const updatedCourses = courses.map(c => {
      if (c.id === courseId) {
        const updatedModules = c.modules.map(m => {
          if (m.id === moduleId) {
            const updatedLessons = m.lessons.map(l => 
              l.id === lessonId ? { ...l, completed: newCompletedStatus } : l
            );
            return { ...m, lessons: updatedLessons };
          }
          return m;
        });
        return { ...c, modules: updatedModules };
      }
      return c;
    });
    setCourses(updatedCourses);

    try {
      await api.updateLessonCompletion(courseId, moduleId, lessonId, newCompletedStatus);
      
      const updatedCourse = updatedCourses.find(c => c.id === courseId);
      if (updatedCourse && !updatedCourse.completionDate) {
        const allLessons = updatedCourse.modules.flatMap(m => m.lessons);
        const allCompleted = allLessons.every(l => l.completed);
        if (allCompleted) {
          const completionDate = new Date().toISOString().split('T')[0];
          setCourses(prev => prev.map(c => c.id === courseId ? {...c, completionDate} : c));
          await api.updateCourseCompletionDate(courseId, completionDate);
          addToast(`Congratulations! You've completed "${updatedCourse.title}"!`, 'success');
        }
      }
    } catch (error) {
      console.error("Failed to update lesson completion:", error);
      addToast("Failed to update lesson. Please try again.", "error");
      setCourses(originalCourses);
    }
  }, [courses, addToast]);
  
  const enrollInCourse = useCallback(async (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    setCourses(prevCourses => prevCourses.map(c => c.id === courseId ? {...c, enrolled: true} : c));

    try {
        await api.enrollInCourse(courseId);
        addToast(`Successfully enrolled in "${course.title}"!`, 'success');
    } catch (error) {
        console.error("Failed to enroll in course:", error);
        addToast('Failed to enroll in course.', 'error');
        setCourses(prevCourses => prevCourses.map(c => c.id === courseId ? {...c, enrolled: false} : c));
    }
  }, [courses, addToast]);

  const addNote = useCallback(async (contactId: string, noteText: string) => {
    const newNote: Note = {
        id: `note-${Date.now()}`,
        text: noteText,
        date: new Date().toISOString(),
    };
    
    const originalContacts = contacts;
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, notes: [newNote, ...c.notes] } : c));

    try {
        await api.addNoteToContact(contactId, newNote);
        addToast("Note added successfully.", "success");
    } catch(e) {
        setContacts(originalContacts);
        addToast("Failed to add note.", "error");
    }
  }, [contacts, addToast]);

  const addDocument = useCallback(async (contactId: string, document: Document) => {
    const originalContacts = contacts;
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, documents: [document, ...c.documents] } : c));

     try {
        await api.addDocumentToContact(contactId, document);
        addToast("Document uploaded successfully.", "success");
    } catch(e) {
        setContacts(originalContacts);
        addToast("Failed to upload document.", "error");
    }
  }, [contacts, addToast]);

  const addNewContact = useCallback(async (newContactData: Omit<Contact, 'id' | 'avatar' | 'enrolledCourses' | 'notes' | 'documents'>) => {
    const tempId = `contact-${Date.now()}`;
    const originalContacts = contacts;
    
    try {
      const optimisticContact: Contact = {
        ...newContactData,
        id: tempId,
        avatar: `https://picsum.photos/seed/${tempId}/200`,
        enrolledCourses: [],
        notes: [],
        documents: [],
      };
      setContacts(prev => [optimisticContact, ...prev]);
      
      const savedContact = await api.addContact(newContactData);
      
      setContacts(prev => prev.map(c => c.id === tempId ? savedContact : c));
      addToast("Contact created successfully!", "success");
      return savedContact;
    } catch (error) {
      console.error("Failed to add contact:", error);
      addToast("Failed to create contact.", "error");
      setContacts(originalContacts);
      return null;
    }
  }, [contacts, addToast]);

  const addNewCourse = useCallback(async (courseData: Omit<Course, 'id' | 'enrolled' | 'completionDate'>) => {
    try {
        const newCourse = await api.addCourse(courseData);
        setCourses(prev => [...prev, newCourse]);
        addToast("Course created successfully!", "success");
        return newCourse;
    } catch (error) {
        console.error(error);
        addToast("Failed to create course.", "error");
        return null;
    }
  }, [addToast]);

  return { courses, contacts, deals, invoices, toggleLessonCompletion, enrollInCourse, addNote, addDocument, loading, addNewContact, addNewCourse };
};
