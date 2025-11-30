import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseClient: any;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using mock implementation for development.');
  // Create a simple mock client for development
  supabaseClient = {
    from: (table: string) => ({
      select: () => ({ order: async () => ({ data: [], error: null }) }),
      insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
      update: () => ({ eq: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }) })
    }),
    storage: {
      from: () => ({
        upload: async () => ({ data: { path: 'mock-path' }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/mock' } })
      })
    }
  };
} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseClient;

// Import mock functions for development
import { getTemplates as mockGetTemplates, createProject as mockCreateProject, updateProject as mockUpdateProject, getProject as mockGetProject, uploadFile as mockUploadFile, getFileUrl as mockGetFileUrl } from './supabase.mock';

// Template operations
export const getTemplates = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return mockGetTemplates();
  }
  
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Project operations
export const createProject = async (project: any) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return mockCreateProject(project);
  }
  
  const { data, error } = await supabase
    .from('projects')
    .insert([project])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateProject = async (id: string, updates: any) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return mockUpdateProject(id, updates);
  }
  
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getProject = async (id: string) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return mockGetProject(id);
  }
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

// File upload operations
export const uploadFile = async (bucket: string, path: string, file: File) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return mockUploadFile(bucket, path, file);
  }
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) throw error;
  return data;
};

export const getFileUrl = (bucket: string, path: string) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return mockGetFileUrl(bucket, path);
  }
  
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};