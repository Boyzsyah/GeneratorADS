
export interface AdConceptData {
  productName: string;
  productDetails: string;
  locationDetails: string;
  characterDetails: string; // New: For character description
  shot1Action: string;      // New: Action for Shot 1
  shot2Action: string;      // New: Action for Shot 2
  dialogueDetails: string;
  visualDetails: string;
  endTitleDetails: string;
}

export interface GeneratedPromptsData {
  englishPrompt: string;
  indonesianPrompt: string;
}

export interface AdStyleOption {
  value: string;
  label: string;
  description: string; // Added description
}

export interface TextPlacementOption {
  value: string;
  label: string;
}

export interface TextEffectOption {
  value: string;
  label: string;
}

export interface CameraOption {
  value: string;
  label: string;
}