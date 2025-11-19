
import { supabase } from './supabaseClient';
import type { Course, Contact, Lesson, CrmDeal, Invoice, Note, Document, Module, CrmStage } from '../types';

// Helper to handle Supabase errors consistently
const handleError = (error: any) => {
  console.error('Supabase API Error Details:', error);
  const message = error.message || error.error_description || (typeof error === 'object' ? JSON.stringify(error) : String(error));
  throw new Error(message);
};

// --- DATA SANITIZER (Crucial for preventing app crashes) ---
// This function guarantees that courses ALWAYS have valid arrays for modules and lessons.
const sanitizeCourse = (data: any): Course => {
    if (!data) return data;
    
    // Ensure modules is an array
    const modules = Array.isArray(data.modules) ? data.modules : [];
    
    // Ensure lessons inside modules are arrays
    const sanitizedModules = modules.map((mod: any) => ({
        ...mod,
        lessons: Array.isArray(mod.lessons) ? mod.lessons.map((l: any) => ({
            ...l,
            questions: Array.isArray(l.questions) ? l.questions : []
        })) : []
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
  const { data, error } = await supabase
    .from('contacts')
    .select('*, notes(*), documents(*)')
    .order('created_at', { ascending: false });

  if (error) handleError(error);
  
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
    .select('*')
    .order('value', { ascending: false }); 

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

// === ATOMIC COURSE UPDATES (BULLETPROOF LOGIC) ===

export const addModule = async (courseId: string, title: string): Promise<Course> => {
    // 1. Fetch latest version of the course
    const { data: rawCourse, error: fetchError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
        
    if (fetchError) handleError(fetchError);

    // 2. Sanitize the fetched data (Fix nulls immediately)
    const cleanCourse = sanitizeCourse(rawCourse);

    // 3. Create new module
    const newModule: Module = {
        id: `mod-${Date.now()}`,
        title: title,
        lessons: []
    };

    // 4. Append
    const updatedModules = [...cleanCourse.modules, newModule];

    // 5. Write back to DB
    const { data: updatedData, error: updateError } = await supabase
        .from('courses')
        .update({ modules: updatedModules })
        .eq('id', courseId)
        .select()
        .single();

    if (updateError) handleError(updateError);
    
    // 6. Return the fully sanitized, updated object
    return sanitizeCourse(updatedData);
};

export const addLesson = async (courseId: string, moduleId: string, lessonData: Omit<Lesson, 'id' | 'completed'>): Promise<Course> => {
    // 1. Fetch latest
    const { data: rawCourse, error: fetchError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

    if (fetchError) handleError(fetchError);

    // 2. Sanitize
    const cleanCourse = sanitizeCourse(rawCourse);
    
    // 3. Modify the specific module
    const updatedModules = cleanCourse.modules.map(mod => {
        if (mod.id === moduleId) {
            return {
                ...mod,
                lessons: [...mod.lessons, {
                    ...lessonData,
                    id: `lesson-${Date.now()}`,
                    completed: false,
                    questions: lessonData.questions || []
                }]
            };
        }
        return mod;
    });

    // 4. Write back
    const { data: updatedData, error: updateError } = await supabase
        .from('courses')
        .update({ modules: updatedModules })
        .eq('id', courseId)
        .select()
        .single();

    if (updateError) handleError(updateError);
    return sanitizeCourse(updatedData);
};

export const updateLesson = async (courseId: string, moduleId: string, lessonId: string, lessonData: Partial<Lesson>): Promise<Course> => {
    const { data: rawCourse, error: fetchError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

    if (fetchError) handleError(fetchError);

    const cleanCourse = sanitizeCourse(rawCourse);

    const updatedModules = cleanCourse.modules.map(mod => {
        if (mod.id === moduleId) {
            return {
                ...mod,
                lessons: mod.lessons.map(l => 
                    l.id === lessonId ? { ...l, ...lessonData } : l
                )
            };
        }
        return mod;
    });

    const { data: updatedData, error: updateError } = await supabase
        .from('courses')
        .update({ modules: updatedModules })
        .eq('id', courseId)
        .select()
        .single();

    if (updateError) handleError(updateError);
    return sanitizeCourse(updatedData);
};

export const deleteModule = async (courseId: string, moduleId: string): Promise<Course> => {
    const { data: rawCourse, error: fetchError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

    if (fetchError) handleError(fetchError);

    const cleanCourse = sanitizeCourse(rawCourse);
    
    // Filter out the module
    const updatedModules = cleanCourse.modules.filter(mod => mod.id !== moduleId);

    const { data: updatedData, error: updateError } = await supabase
        .from('courses')
        .update({ modules: updatedModules })
        .eq('id', courseId)
        .select()
        .single();

    if (updateError) handleError(updateError);
    return sanitizeCourse(updatedData);
};

export const deleteLesson = async (courseId: string, moduleId: string, lessonId: string): Promise<Course> => {
    const { data: rawCourse, error: fetchError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

    if (fetchError) handleError(fetchError);

    const cleanCourse = sanitizeCourse(rawCourse);
    
    // Remove lesson from specific module
    const updatedModules = cleanCourse.modules.map(mod => {
        if (mod.id === moduleId) {
            return {
                ...mod,
                lessons: mod.lessons.filter(l => l.id !== lessonId)
            };
        }
        return mod;
    });

    const { data: updatedData, error: updateError } = await supabase
        .from('courses')
        .update({ modules: updatedModules })
        .eq('id', courseId)
        .select()
        .single();

    if (updateError) handleError(updateError);
    return sanitizeCourse(updatedData);
};

export const updateLessonCompletion = async (courseId: string, moduleId: string, lessonId: string, completed: boolean): Promise<void> => {
    // We assume the client has already optimistically updated the UI.
    // We just need to sync to DB.
    
    const { data: rawCourse } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
        
    if (!rawCourse) return;

    const cleanCourse = sanitizeCourse(rawCourse);
    
    const updatedModules = cleanCourse.modules.map(mod => {
        if (mod.id === moduleId) {
            return {
                ...mod,
                lessons: mod.lessons.map(l => 
                    l.id === lessonId ? { ...l, completed } : l
                )
            };
        }
        return mod;
    });

    await supabase
        .from('courses')
        .update({ modules: updatedModules })
        .eq('id', courseId);
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

export const updateContact = async (contactId: string, updates: Partial<Contact>): Promise<Contact> => {
    const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', contactId)
        .select('*, notes(*), documents(*)')
        .single();

    if (error) handleError(error);

    return {
        ...data,
        notes: data.notes || [],
        documents: data.documents || [],
        enrolledCourses: data.enrolledCourses || []
    } as Contact;
};

export const deleteContact = async (contactId: string): Promise<void> => {
    const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);
        
    if (error) handleError(error);
};

export const addCourse = async (courseData: Omit<Course, 'id' | 'enrolled' | 'completionDate'>): Promise<Course> => {
  const id = courseData.title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const initialModules = Array.isArray(courseData.modules) ? courseData.modules : [];

  const { data, error } = await supabase
    .from('courses')
    .insert({
      id,
      title: courseData.title,
      instructor: courseData.instructor,
      description: courseData.description,
      thumbnail: courseData.thumbnail,
      modules: initialModules,
      enrolled: false
    })
    .select()
    .single();

  if (error) handleError(error);
  return sanitizeCourse(data);
};

// --- CRM FUNCTIONS ---

export const addDeal = async (dealData: Omit<CrmDeal, 'id'>): Promise<CrmDeal> => {
    const { data, error } = await supabase
        .from('crm_deals')
        .insert({
            name: dealData.name,
            "contactId": dealData.contactId,
            stage: dealData.stage,
            value: Number(dealData.value),
            // New extended fields with defaults/passed values
            probability: dealData.probability || 50,
            "expectedClosingDate": dealData.expectedClosingDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days default
            salesperson: dealData.salesperson || 'Admissions Counsellor',
            "assignedTo": dealData.assignedTo || 'Samad',
            "coachingInterest": dealData.coachingInterest,
            "countryInterest": dealData.countryInterest,
            "visaType": dealData.visaType || 'Student Visa',
            tags: dealData.tags || []
        })
        .select()
        .single();
    
    if (error) handleError(error);
    return data as CrmDeal;
};

export const updateDealStage = async (dealId: string, newStage: CrmStage): Promise<CrmDeal> => {
    const { data, error } = await supabase
        .from('crm_deals')
        .update({ stage: newStage })
        .eq('id', dealId)
        .select()
        .single();

    if (error) handleError(error);
    return data as CrmDeal;
};

export const updateDeal = async (dealId: string, updates: Partial<CrmDeal>): Promise<CrmDeal> => {
    const { data, error } = await supabase
        .from('crm_deals')
        .update(updates)
        .eq('id', dealId)
        .select()
        .single();

    if (error) handleError(error);
    return data as CrmDeal;
};

export const deleteDeal = async (dealId: string): Promise<void> => {
    const { error } = await supabase
        .from('crm_deals')
        .delete()
        .eq('id', dealId);

    if (error) handleError(error);
};

export const getDeal = async (dealId: string): Promise<CrmDeal | null> => {
    const { data, error } = await supabase
        .from('crm_deals')
        .select('*')
        .eq('id', dealId)
        .single();
        
    if (error) return null;
    return data as CrmDeal;
}
