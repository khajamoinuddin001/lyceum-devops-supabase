
import { supabase } from './supabaseClient';
import type { Course, Contact, Lesson, CrmDeal, Invoice, Note, Document, Module } from '../types';

// Helper to handle Supabase errors consistently
const handleError = (error: any) => {
  console.error('Supabase API Error:', error);
  throw new Error(error.message || 'An unexpected error occurred');
};

export const getCourses = async (): Promise<Course[]> => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('title');
  
  if (error) handleError(error);
  return data as Course[] || [];
};

export const getContacts = async (): Promise<Contact[]> => {
  // Fetch contacts with their related notes and documents
  // Note: We assume the foreign keys are set up correctly so Supabase can infer relationships
  const { data, error } = await supabase
    .from('contacts')
    .select('*, notes(*), documents(*)')
    .order('created_at', { ascending: false });

  if (error) handleError(error);
  
  // Ensure notes and documents are arrays (Supabase might return null for empty relations sometimes depending on query)
  return (data || []).map((contact: any) => ({
    ...contact,
    notes: contact.notes || [],
    documents: contact.documents || [],
    enrolledCourses: contact.enrolledCourses || [] // Ensure text[] is handled
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
  // 1. Fetch the specific course to get current modules
  const { data: course, error: fetchError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (fetchError) handleError(fetchError);

  // 2. Update the specific lesson in the JSON structure
  const modules = course.modules as Module[];
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

  // 3. Save the updated JSON back to the database
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
  return data as Course;
};

export const enrollInCourse = async (courseId: string): Promise<Course> => {
  // In this V2 MVP, we toggle the 'enrolled' flag on the course itself.
  const { data, error } = await supabase
    .from('courses')
    .update({ enrolled: true })
    .eq('id', courseId)
    .select()
    .single();

  if (error) handleError(error);
  return data as Course;
};

export const addNoteToContact = async (contactId: string, note: Note): Promise<Contact> => {
  // 1. Insert the note
  const { error: insertError } = await supabase
    .from('notes')
    .insert({
      "contactId": contactId, // Explicitly quoted to match case-sensitive column if created via SQL script provided
      text: note.text,
      date: note.date
    });

  if (insertError) handleError(insertError);

  // 2. Return the updated contact with all notes
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
  // 1. Insert the document record
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

  // 2. Return updated contact
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
  // Generate a random avatar for the new contact
  const avatar = `https://picsum.photos/seed/${Math.random()}/200`;

  // Insert into Supabase
  const { data, error } = await supabase
    .from('contacts')
    .insert({
      ...contactData,
      avatar,
      enrolledCourses: [] // Default empty array
    })
    .select('*, notes(*), documents(*)') // Select with relations to match return type
    .single();

  if (error) handleError(error);

  return {
      ...data,
      notes: [],
      documents: []
  } as Contact;
};

export const addCourse = async (courseData: Omit<Course, 'id' | 'enrolled' | 'completionDate'>): Promise<Course> => {
  // Generate a simple slug ID from the title
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
      modules: courseData.modules,
      enrolled: false
    })
    .select()
    .single();

  if (error) handleError(error);
  return data as Course;
};
