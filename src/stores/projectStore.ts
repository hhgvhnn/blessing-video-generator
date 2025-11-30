import { create } from 'zustand';
import { Project, Template, VideoGenerationState } from '@/types';

interface ProjectState {
  currentProject: Project | null;
  templates: Template[];
  videoGeneration: VideoGenerationState;
  
  // Actions
  setCurrentProject: (project: Project | null) => void;
  updateProject: (updates: Partial<Project>) => void;
  setTemplates: (templates: Template[]) => void;
  setVideoGeneration: (state: VideoGenerationState) => void;
  updateVideoProgress: (progress: number) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  currentProject: null,
  templates: [],
  videoGeneration: {
    progress: 0,
    status: 'idle',
  },
  
  setCurrentProject: (project) => set({ currentProject: project }),
  
  updateProject: (updates) => set((state) => ({
    currentProject: state.currentProject 
      ? { ...state.currentProject, ...updates }
      : null
  })),
  
  setTemplates: (templates) => set({ templates }),
  
  setVideoGeneration: (videoGeneration) => set({ videoGeneration }),
  
  updateVideoProgress: (progress) => set((state) => ({
    videoGeneration: {
      ...state.videoGeneration,
      progress,
      status: progress >= 100 ? 'completed' : 'generating'
    }
  })),
}));