
import { supabase } from './supabaseClient';
import type { Course, Contact, Lesson, CrmDeal, Invoice, Note, Document, Module } from '../types';

// Helper to handle Supabase errors consistently
const handleError = (error: any) => {
  console.error('Supabase API Error:', error);
  throw new Error(error.message || 'An unexpected error occurred');
};

// --- DATA SANITIZER ---
// This ensures that even if the DB returns null/undefined for JSON fields,
// our app always gets valid Arrays.
const sanitizeCourse = (data: any): Course => {
    if (!data) return data;
    
    const modules = Array.isArray(data.modules) ? data.modules : [];
    
    const sanitizedModules = modules.map((mod: any) => ({
        ...mod,
        lessons: Array.isArray(mod.lessons) ? mod.lessons : []
    }));

    return {
        ...data,
        modules: sanitizedModules
    } as Course;
}

export const getCourses = async (): Promise<Course[]> => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('title');
  
  if (error) handleError(error);
  
  return (data || []).map(sanitizeCourse);
};

export const getContacts = async (): Promise<Contact[]> => {
  // Fetch contacts with their related notes and documents
  const { data, error } = await supabase
    .from('contacts')
    .select('*, notes(*), documents(*)')
    .order('created_at', { ascending: false });

  if (error) handleError(error);
  
  // Ensure notes and documents are arrays
  return (data || []).map((contact: any) => ({
    ...contact,
    notes: contact.notes || [],
    documents: contact.documents || [],
    enrolledCourses: contact.enrolledCourses || [] 
  })) as Contact[];
};

export const getDeals = async (): Promise<CrmDeal[]> => {
  const { data, error } = await supabase
    .from('crm_deals')
    .select('*');

  if (error) handleError(error);
  return data as CrmDeal[] || [];
};

export const getInvoices = async (): Promise<Invoice[]> => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*');

  if (error) handleError(error);
  return data as Invoice[] || [];
};

export const updateLessonCompletion = async (courseId: string, moduleId: string, lessonId: string, completed: boolean): Promise<Lesson> => {
  const { data: course, error: fetchError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (fetchError) handleError(fetchError);

  const sanitized = sanitizeCourse(course);
  const modules = sanitized.modules;
  let targetLesson: Lesson | null = null;
  
  const updatedModules = modules.map(m => {
    if (m.id === moduleId) {
      return {
        ...m,
        lessons: m.lessons.map(l => {
          if (l.id === lessonId) {
            targetLesson = { ...l, completed };
            return targetLesson;
          }
          return l;
        })
      };
    }
    return m;
  });

  if (!targetLesson) throw new Error("Lesson not found");

  const { error: updateError } = await supabase
    .from('courses')
    .update({ modules: updatedModules })
    .eq('id', courseId);

  if (updateError) handleError(updateError);

  return targetLesson!;
};

export const updateCourseCompletionDate = async (courseId: string, date: string): Promise<Course> => {
  const { data, error } = await supabase
    .from('courses')
    .update({ completionDate: date })
    .eq('id', courseId)
    .select()
    .single();

  if (error) handleError(error);
  return sanitizeCourse(data);
};

export const enrollInCourse = async (courseId: string): Promise<Course> => {
  const { data, error } = await supabase
    .from('courses')
    .update({ enrolled: true })
    .eq('id', courseId)
    .select()
    .single();

  if (error) handleError(error);
  return sanitizeCourse(data);
};

export const addNoteToContact = async (contactId: string, note: Note): Promise<Contact> => {
  const { error: insertError } = await supabase
    .from('notes')
    .insert({
      "contactId": contactId, 
      text: note.text,
      date: note.date
    });

  if (insertError) handleError(insertError);

  const { data, error: fetchError } = await supabase
    .from('contacts')
    .select('*, notes(*), documents(*)')
    .eq('id', contactId)
    .single();

  if (fetchError) handleError(fetchError);
  
  return {
      ...data,
      notes: data.notes || [],
      documents: data.documents || []
  } as Contact;
};

export const addDocumentToContact = async (contactId: string, doc: Document): Promise<Contact> => {
  const { error: insertError } = await supabase
    .from('documents')
    .insert({
      "contactId": contactId,
      name: doc.name,
      size: doc.size,
      "uploadDate": doc.uploadDate,
      url: doc.url
    });

  if (insertError) handleError(insertError);

  const { data, error: fetchError } = await supabase
    .from('contacts')
    .select('*, notes(*), documents(*)')
    .eq('id', contactId)
    .single();

  if (fetchError) handleError(fetchError);

  return {
      ...data,
      notes: data.notes || [],
      documents: data.documents || []
  } as Contact;
};

export const addContact = async (contactData: Omit<Contact, 'id' | 'avatar' | 'enrolledCourses' | 'notes' | 'documents'>): Promise<Contact> => {
  const avatar = `https://picsum.photos/seed/${Math.random()}/200`;

  const { data, error } = await supabase
    .from('contacts')
    .insert({
      ...contactData,
      avatar,
      enrolledCourses: [] 
    })
    .select('*, notes(*), documents(*)')
    .single();

  if (error) handleError(error);

  return {
      ...data,
      notes: [],
      documents: []
  } as Contact;
};

export const addCourse = async (courseData: Omit<Course, 'id' | 'enrolled' | 'completionDate'>): Promise<Course> => {
  const id = courseData.title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const { data, error } = await supabase
    .from('courses')
    .insert({
      id,
      title: courseData.title,
      instructor: courseData.instructor,
      description: courseData.description,
      thumbnail: courseData.thumbnail,
      modules: courseData.modules || [], 
      enrolled: false
    })
    .select()
    .single();

  if (error) handleError(error);
  return sanitizeCourse(data);
};

// --- NEW V2.1 FUNCTIONS FOR LESSON MANAGER ---

export const addModule = async (courseId: string, moduleTitle: string): Promise<Course> => {
    // 1. Get the course
    const { data: course, error: fetchError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
    
    if (fetchError) handleError(fetchError);

    const sanitized = sanitizeCourse(course);

    // 2. Create new module
    const newModule: Module = {
        id: `mod-${Date.now()}`,
        title: moduleTitle,
        lessons: []
    };

    // 3. Append to existing modules
    const updatedModules = [...sanitized.modules, newModule];

    // 4. Save back to DB
    const { data: updatedCourse, error: updateError } = await supabase
        .from('courses')
        .update({ modules: updatedModules })
        .eq('id', courseId)
        .select()
        .single();

    if (updateError) handleError(updateError);
    return sanitizeCourse(updatedCourse);
};

export const addLesson = async (courseId: string, moduleId: string, lesson: Omit<Lesson, 'id' | 'completed'>): Promise<Course> => {
    // 1. Get the course
    const { data: course, error: fetchError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

    if (fetchError) handleError(fetchError);

    const sanitized = sanitizeCourse(course);

    // 2. Prepare the new lesson
    const newLesson: Lesson = {
        ...lesson,
        id: `lesson-${Date.now()}`,
        completed: false
    };

    // 3. Insert lesson into the correct module
    const updatedModules = sanitized.modules.map(mod => {
        if (mod.id === moduleId) {
            return {
                ...mod,
                lessons: [...(mod.lessons || []), newLesson] 
            };
        }
        return mod;
    });

    // 4. Save back to DB
    const { data: updatedCourse, error: updateError } = await supabase
        .from('courses')
        .update({ modules: updatedModules })
        .eq('id', courseId)
        .select()
        .single();

    if (updateError) handleError(updateError);
    return sanitizeCourse(updatedCourse);
};
