import { supabase } from './supabase';

export interface Resource {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  file_size: string;
  course_id: string;
  resource_type_id: string;
  uploaded_by: string;
  created_at: string;
  views: number;
  likes: number;
  metadata: any;
  // Joined fields
  type_name?: string;
  type_icon?: string;
  course_name?: string;
  course_code?: string;
  department_name?: string;
  uploader_name?: string;
}

export const getResources = async (courseId?: string) => {
  let query = supabase
    .from('resource_details')
    .select('*')
    .order('created_at', { ascending: false });

  if (courseId) {
    query = query.eq('course_id', courseId);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data as Resource[];
};

export const addResource = async (resource: Partial<Resource>) => {
  const { data, error } = await supabase
    .from('resources')
    .insert([resource])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const incrementViews = async (resourceId: string) => {
  const { error } = await supabase.rpc('increment_resource_views', {
    resource_id: resourceId
  });

  if (error) throw error;
};

export const toggleLike = async (resourceId: string) => {
  const { error } = await supabase.rpc('toggle_resource_like', {
    resource_id: resourceId
  });

  if (error) throw error;
};