export interface Template {
  id: string;
  name: string;
  category: string;
  config: TemplateConfig;
  preview_url: string;
  created_at: string;
}

export interface TemplateConfig {
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  animation: string;
  duration: number;
}

export interface Project {
  id: string;
  user_id?: string;
  recipient_name: string;
  blessing_text: string;
  template_id: string;
  images: string[];
  music_url?: string;
  status: 'draft' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface VideoGenerationState {
  progress: number;
  status: 'idle' | 'generating' | 'completed' | 'error';
  error?: string;
  videoUrl?: string;
}