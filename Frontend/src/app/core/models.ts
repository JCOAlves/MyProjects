export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export type ProjectIcon = 'laptop' | 'bulb' | 'chart' | 'folder' | 'book' | 'rocket';
export type ProjectColor = 'blue' | 'amber' | 'violet' | 'teal';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  done: boolean;
  deadline: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: 'viewer' | 'editor';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  icon: ProjectIcon;
  color: ProjectColor;
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
  notes: Note[];
  members: Collaborator[];
}

export type ProjectInput = Pick<Project, 'title' | 'description' | 'icon' | 'color'>;
export type NoteInput = Pick<Note, 'title' | 'content'>;
export type MemberInput = Omit<Collaborator, 'id'>;
