// Generation Status Types
export type GenerationStatus =
  | 'pending'
  | 'generating'
  | 'completed'
  | 'failed';

// Generation Object
export interface Generation {
  id: string;
  prompt: string;
  title: string;
  status: GenerationStatus;
  progress: number;
  statusMessage?: string;
  createdAt: Date;
  completedAt?: Date;
  versions: GenerationVersion[];
  error?: string;
  coverImage?: string;
  isLiked?: boolean;
  isDisliked?: boolean;
  isNew?: boolean;
  // For paired generations (v1, v2 of same prompt)
  groupId?: string;
  variationNumber?: number; // 1, 2, etc.
}

// Each generation can have multiple versions (v1, v2, etc.)
export interface GenerationVersion {
  id: string;
  version: number;
  status?: GenerationStatus;
  progress?: number;
  statusMessage?: string;
  duration?: number;
  audioUrl?: string;
  waveformData?: number[];
  error?: string;
}

// User Profile
export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  credits: number;
  maxCredits: number;
}

// WebSocket Events
export type WSEventType =
  | 'GENERATION_STARTED'
  | 'GENERATION_PROGRESS'
  | 'GENERATION_COMPLETE'
  | 'GENERATION_FAILED'
  | 'VARIATION_PROGRESS'
  | 'VARIATION_COMPLETE'
  | 'VARIATION_FAILED'
  | 'CREDITS_UPDATED';

export interface WSEvent {
  type: WSEventType;
  payload: unknown;
}

export interface GenerationProgressPayload {
  generationId: string;
  progress: number;
  message?: string;
}

export interface GenerationCompletePayload {
  generationId: string;
  versions: GenerationVersion[];
  coverImage: string;
  title: string;
}

export interface GenerationFailedPayload {
  generationId: string;
  error: string;
}

// API Request/Response Types
export interface CreateGenerationRequest {
  prompt: string;
}

export interface CreateGenerationResponse {
  success: boolean;
  generation?: Generation;
  error?: string;
}

// Prompt Box State
export interface PromptBoxState {
  isExpanded: boolean;
  isFocused: boolean;
  prompt: string;
}

// Recent Generation Item for display
export interface RecentGenerationDisplay {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  status: GenerationStatus;
  progress: number;
}
