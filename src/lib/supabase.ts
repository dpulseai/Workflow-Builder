import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage operations
export const storageOperations = {
  async uploadPhoto(file: File, stepId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${stepId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('workflow-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('workflow-photos')
      .getPublicUrl(fileName);
    
    return publicUrl;
  },

  async deletePhoto(url: string): Promise<void> {
    // Extract file path from URL
    const urlParts = url.split('/');
    const fileName = urlParts.slice(-2).join('/'); // Get stepId/filename.ext
    
    const { error } = await supabase.storage
      .from('workflow-photos')
      .remove([fileName]);
    
    if (error) throw error;
  },

  async createBucket(): Promise<void> {
    const { error } = await supabase.storage.createBucket('workflow-photos', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });
    
    // Ignore error if bucket already exists
    if (error && !error.message.includes('already exists')) {
      throw error;
    }
  }
};

// Database types
export interface Work {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  role: 'admin' | 'clerk' | 'officer' | 'developer';
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  due_date: string;
}

export interface Workflow {
  id: string;
  title: string;
  description: string;
  duration: number; // in days
  status: 'draft' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  title: string;
  description: string;
  duration: number; // in hours
  order: number;
  status: 'pending' | 'in_progress' | 'completed';
  completion_photos: string[];
  location_data: {
    latitude: number;
    longitude: number;
    address?: string;
  } | null;
  completed_at: string | null;
  created_at: string;
}

// Database operations
export const workOperations = {
  async getAll() {
    const { data, error } = await supabase
      .from('works')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Work[];
  },

  async create(work: Omit<Work, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('works')
      .insert([work])
      .select()
      .single();
    
    if (error) throw error;
    return data as Work;
  },

  async update(id: string, updates: Partial<Work>) {
    const { data, error } = await supabase
      .from('works')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Work;
  },

  async delete(id: string) {
    // First, get the work details to match workflows by title
    const { data: work, error: workError } = await supabase
      .from('works')
      .select('title')
      .eq('id', id)
      .single();
    
    if (workError) throw workError;
    
    // Get all workflows associated with this work by matching title pattern
    const { data: workflows, error: workflowError } = await supabase
      .from('workflows')
      .select('id')
      .ilike('title', `%${work.title}%`);
    
    if (workflowError) throw workflowError;
    
    // Delete all workflow steps for associated workflows
    if (workflows && workflows.length > 0) {
      const workflowIds = workflows.map(w => w.id);
      
      // Delete workflow steps first (due to foreign key constraint)
      const { error: stepsError } = await supabase
        .from('workflow_steps')
        .delete()
        .in('workflow_id', workflowIds);
      
      if (stepsError) throw stepsError;
      
      // Delete the workflows
      const { error: deleteWorkflowError } = await supabase
        .from('workflows')
        .delete()
        .in('id', workflowIds);
      
      if (deleteWorkflowError) throw deleteWorkflowError;
    }
    
    // Finally, delete the work
    const { error } = await supabase
      .from('works')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async duplicate(id: string) {
    // Get the original work
    const { data: originalWork, error: workError } = await supabase
      .from('works')
      .select('*')
      .eq('id', id)
      .single();
    
    if (workError) throw workError;
    
    // Create duplicate work
    const duplicateWorkData = {
      title: `${originalWork.title} (Copy)`,
      description: originalWork.description,
      assigned_to: originalWork.assigned_to,
      role: originalWork.role,
      status: 'pending' as const,
      priority: originalWork.priority,
      due_date: originalWork.due_date,
    };
    
    const { data: newWork, error: createError } = await supabase
      .from('works')
      .insert([duplicateWorkData])
      .select()
      .single();
    
    if (createError) throw createError;
    
    // Get all workflows associated with the original work
    const { data: workflows, error: workflowError } = await supabase
      .from('workflows')
      .select(`
        *,
        workflow_steps (*)
      `)
      .ilike('title', `%${originalWork.title}%`);
    
    if (workflowError) throw workflowError;
    
    // Duplicate workflows and their steps
    if (workflows && workflows.length > 0) {
      for (const workflow of workflows) {
        // Create duplicate workflow
        const duplicateWorkflowData = {
          title: `Workflow for: ${newWork.title}`,
          description: `Workflow created for work: ${newWork.description}`,
          duration: workflow.duration,
          status: 'draft' as const,
        };
        
        const { data: newWorkflow, error: workflowCreateError } = await supabase
          .from('workflows')
          .insert([duplicateWorkflowData])
          .select()
          .single();
        
        if (workflowCreateError) throw workflowCreateError;
        
        // Duplicate workflow steps
        if (workflow.workflow_steps && workflow.workflow_steps.length > 0) {
          const duplicateSteps = workflow.workflow_steps.map((step: any) => ({
            workflow_id: newWorkflow.id,
            title: step.title,
            description: step.description,
            duration: step.duration,
            order: step.order,
            status: 'pending' as const,
            completion_photos: [],
            location_data: null,
            completed_at: null,
          }));
          
          const { error: stepsCreateError } = await supabase
            .from('workflow_steps')
            .insert(duplicateSteps);
          
          if (stepsCreateError) throw stepsCreateError;
        }
      }
    }
    
    return newWork;
  }
};

export const workflowOperations = {
  async getAll() {
    const { data, error } = await supabase
      .from('workflows')
      .select(`
        *,
        workflow_steps (*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(workflow: Omit<Workflow, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('workflows')
      .insert([workflow])
      .select()
      .single();
    
    if (error) throw error;
    return data as Workflow;
  },

  async addStep(step: Omit<WorkflowStep, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('workflow_steps')
      .insert([step])
      .select()
      .single();
    
    if (error) throw error;
    return data as WorkflowStep;
  },

  async updateStep(id: string, updates: Partial<WorkflowStep>) {
    const { data, error } = await supabase
      .from('workflow_steps')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as WorkflowStep;
  },

  async updateWorkflow(id: string, updates: Partial<Workflow>) {
    const { data, error } = await supabase
      .from('workflows')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Workflow;
  }
};