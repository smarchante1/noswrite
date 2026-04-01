export interface Character {
  id: string;
  name: string;
  color: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
}

export interface Dialogue {
  id: string;
  characterId: string;
  text: string;
}

export interface Beat {
  id: string;
  title: string;
  description: string;
  dialogue: Dialogue[];
  characterIds: string[]; // Assigned characters for this beat
}

export interface Act {
  id: string;
  title: string;
  beats: Beat[];
  locationId?: string; // Assigned location for this act
  characterIds: string[]; // Assigned characters for this act
}

export interface Bubble {
  id: string;
  dialogueId: string;
  x: number; // Percentage within panel
  y: number; // Percentage within panel
  w: number; // Percentage within panel
  h: number; // Percentage within panel
}

export interface Panel {
  id: string;
  composition: string;
  bubbles: Bubble[];
  layoutData: {
    x: number;
    y: number;
    w: number; // Percentage width
    h: number; // Percentage height
    zIndex?: number;
  };
}

export interface Page {
  id: string;
  pageNumber: number;
  panelCount: number;
  panels: Panel[];
}

export interface Chapter {
  id: string;
  title: string;
  acts: Act[];
  pages: Page[];
  characters: Character[];
  locations: Location[];
}
