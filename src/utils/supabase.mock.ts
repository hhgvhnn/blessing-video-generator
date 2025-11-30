import { Template, Project } from '@/types';

// Mock data for development without Supabase
const mockTemplates: Template[] = [
  {
    id: '1',
    name: '生日祝福',
    category: 'birthday',
    config: {
      backgroundColor: '#FFE4E1',
      textColor: '#FF6B9D',
      fontSize: 24,
      animation: 'fadeIn',
      duration: 60
    },
    preview_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=birthday%20celebration%20background%20with%20balloons%20and%20cake%20warm%20pink%20theme&image_size=landscape_16_9',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: '节日祝福',
    category: 'holiday',
    config: {
      backgroundColor: '#FFF0F5',
      textColor: '#FF1493',
      fontSize: 22,
      animation: 'slideUp',
      duration: 75
    },
    preview_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=festive%20holiday%20background%20with%20lights%20and%20decorations%20warm%20pink%20theme&image_size=landscape_16_9',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: '日常问候',
    category: 'daily',
    config: {
      backgroundColor: '#FFFAFA',
      textColor: '#DB7093',
      fontSize: 20,
      animation: 'zoomIn',
      duration: 90
    },
    preview_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=warm%20daily%20greeting%20background%20with%20flowers%20and%20soft%20colors%20pink%20theme&image_size=landscape_16_9',
    created_at: new Date().toISOString()
  }
];

let mockProjects: Project[] = [];

// Mock functions
export const getTemplates = async () => {
  return mockTemplates;
};

export const createProject = async (project: any) => {
  const newProject: Project = {
    id: Math.random().toString(36).substr(2, 9),
    ...project,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  mockProjects.push(newProject);
  return newProject;
};

export const updateProject = async (id: string, updates: any) => {
  const index = mockProjects.findIndex(p => p.id === id);
  if (index !== -1) {
    mockProjects[index] = { ...mockProjects[index], ...updates, updated_at: new Date().toISOString() };
    return mockProjects[index];
  }
  throw new Error('Project not found');
};

export const getProject = async (id: string) => {
  const project = mockProjects.find(p => p.id === id);
  if (!project) throw new Error('Project not found');
  return project;
};

export const uploadFile = async (bucket: string, path: string, file: File) => {
  // Mock file upload
  return { path };
};

export const getFileUrl = (bucket: string, path: string) => {
  return `https://example.com/${bucket}/${path}`;
};