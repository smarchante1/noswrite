/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  User,
  MessageSquare,
  Layout,
  BookOpen,
  FileText,
  Save,
  Download,
  Maximize2,
  Grid,
  MapPin,
  Users,
  Settings,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Chapter,
  Act,
  Beat,
  Character,
  Dialogue,
  Page,
  Panel,
  Location,
  Bubble,
} from './types';

const CHARACTER_PALETTE = [
  '#e11d48', // Rose 600
  '#ea580c', // Orange 600
  '#d97706', // Amber 600
  '#16a34a', // Green 600
  '#0d9488', // Teal 600
  '#2563eb', // Blue 600
  '#4f46e5', // Indigo 600
  '#9333ea', // Purple 600
  '#db2777', // Pink 600
  '#475569', // Slate 600
];

const INITIAL_CHAPTER: Chapter = {
  id: 'chapter-1',
  title: 'Untitled Chapter',
  acts: [
    { id: 'act-1', title: 'Act I: Setup', beats: [], characterIds: [] },
    {
      id: 'act-2',
      title: 'Act II: Confrontation',
      beats: [],
      characterIds: [],
    },
    { id: 'act-3', title: 'Act III: Resolution', beats: [], characterIds: [] },
  ],
  pages: [],
  characters: [],
  locations: [],
};

// --- CHARACTER COLOR PICKER COMPONENT ---
interface CharacterColorPickerProps {
  char: Character;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (color: string) => void;
}

function CharacterColorPicker({
  char,
  isOpen,
  onToggle,
  onSelect,
}: CharacterColorPickerProps) {
  return (
    <div className="relative shrink-0">
      <button
        onClick={onToggle}
        className="w-4 h-4 rounded-full border border-yot-accent shadow-sm transition-transform hover:scale-110"
        style={{ backgroundColor: char.color }}
      />

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop to close on click outside */}
            <div className="fixed inset-0 z-40" onClick={onToggle} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 5 }}
              className="absolute left-0 top-6 z-50 p-2 bg-white rounded-xl border border-yot-accent shadow-xl w-32"
            >
              <div className="grid grid-cols-5 gap-1.5">
                {CHARACTER_PALETTE.map((color) => (
                  <button
                    key={color}
                    onClick={() => onSelect(color)}
                    className={`w-4 h-4 rounded-full border transition-all hover:scale-110 ${
                      char.color === color
                        ? 'border-yot-dark ring-2 ring-yot-dark/20 scale-110'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- STORYBOARD BUBBLE COMPONENT ---
interface StoryboardBubbleProps {
  key?: string | number;
  pageId: string;
  panelId: string;
  bubble: Bubble;
  chapter: Chapter;
  updateBubble: (
    pageId: string,
    panelId: string,
    bubbleId: string,
    updates: Partial<Bubble>,
  ) => void;
  deleteBubble: (pageId: string, panelId: string, bubbleId: string) => void;
}

function StoryboardBubble({
  pageId,
  panelId,
  bubble,
  chapter,
  updateBubble,
  deleteBubble,
}: StoryboardBubbleProps) {
  const startDragging = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const parent = (e.currentTarget as HTMLElement).closest(
      '.manga-panel-content',
    );
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const startX = e.pageX;
    const startY = e.pageY;
    const initialX = bubble.x;
    const initialY = bubble.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = ((moveEvent.pageX - startX) / rect.width) * 100;
      const deltaY = ((moveEvent.pageY - startY) / rect.height) * 100;
      updateBubble(pageId, panelId, bubble.id, {
        x: Math.max(0, Math.min(100 - bubble.w, initialX + deltaX)),
        y: Math.max(0, Math.min(100 - bubble.h, initialY + deltaY)),
      });
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const parent = (e.currentTarget as HTMLElement).closest(
      '.manga-panel-content',
    );
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const startX = e.pageX;
    const startY = e.pageY;
    const initialW = bubble.w;
    const initialH = bubble.h;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = ((moveEvent.pageX - startX) / rect.width) * 100;
      const deltaY = ((moveEvent.pageY - startY) / rect.height) * 100;
      updateBubble(pageId, panelId, bubble.id, {
        w: Math.max(10, Math.min(100 - bubble.x, initialW + deltaX)),
        h: Math.max(10, Math.min(100 - bubble.y, initialH + deltaY)),
      });
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const dialogue = chapter.acts
    .flatMap((a) => a.beats)
    .flatMap((b) => b.dialogue)
    .find((d) => d.id === bubble.dialogueId);
  const character = dialogue
    ? chapter.characters.find((c) => c.id === dialogue.characterId)
    : null;

  return (
    <div
      className="absolute group cursor-move"
      style={{
        left: `${bubble.x}%`,
        top: `${bubble.y}%`,
        width: `${bubble.w}%`,
        height: `${bubble.h}%`,
        zIndex: 100,
      }}
      onMouseDown={startDragging}
    >
      {/* Bubble Body */}
      <div className="w-full h-full bg-white border-2 border-yot-dark rounded-[20px] p-2 flex flex-col items-center justify-center shadow-md relative overflow-hidden">
        <div className="flex flex-col gap-0.5 w-full h-full justify-center items-center overflow-hidden">
          {dialogue && (
            <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 truncate w-full text-center">
              {character?.name || 'Unknown'}
            </p>
          )}
          <select
            value={bubble.dialogueId}
            onChange={(e) =>
              updateBubble(pageId, panelId, bubble.id, {
                dialogueId: e.target.value,
              })
            }
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full bg-transparent border-none outline-none text-[11px] font-medium text-yot-dark text-center leading-tight appearance-none cursor-pointer"
          >
            <option value="">Select Dialogue</option>
            {chapter.acts
              .flatMap((a) => a.beats)
              .flatMap((b) => b.dialogue)
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.text}
                </option>
              ))}
          </select>
          {!bubble.dialogueId && (
            <span className="text-[10px] text-slate-300 italic">Empty</span>
          )}
        </div>
      </div>

      {/* Bubble Tail */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-yot-dark rotate-45 -z-10 shadow-sm" />

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteBubble(pageId, panelId, bubble.id);
        }}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20"
      >
        <Trash2 size={10} />
      </button>

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity z-20"
        onMouseDown={startResizing}
      >
        <div className="w-full h-full border-r-2 border-b-2 border-yot-secondary/50" />
      </div>
    </div>
  );
}

// --- STORYBOARD PANEL COMPONENT ---
interface StoryboardPanelProps {
  key?: string | number;
  pageId: string;
  panel: Panel;
  idx: number;
  chapter: Chapter;
  updatePanel: (
    pageId: string,
    panelId: string,
    updates: Partial<Panel>,
  ) => void;
  updatePanelLayout: (
    pageId: string,
    panelId: string,
    updates: Partial<Panel['layoutData']>,
  ) => void;
  addBubbleToPanel: (pageId: string, panelId: string) => void;
  updateBubble: (
    pageId: string,
    panelId: string,
    bubbleId: string,
    updates: Partial<Bubble>,
  ) => void;
  deleteBubble: (pageId: string, panelId: string, bubbleId: string) => void;
  maxZIndex: number;
  setMaxZIndex: (z: number) => void;
  otherPanels: Panel[];
}

function StoryboardPanel({
  pageId,
  panel,
  idx,
  chapter,
  updatePanel,
  updatePanelLayout,
  addBubbleToPanel,
  updateBubble,
  deleteBubble,
  maxZIndex,
  setMaxZIndex,
  otherPanels,
}: StoryboardPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    const newZ = maxZIndex + 1;
    setMaxZIndex(newZ);
    updatePanelLayout(pageId, panel.id, { zIndex: newZ });
  };

  const startDragging = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const parent = (e.currentTarget as HTMLElement).closest(
      '.manga-page-container',
    );
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const startX = e.pageX;
    const startY = e.pageY;
    const initialX = panel.layoutData.x;
    const initialY = panel.layoutData.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = ((moveEvent.pageX - startX) / rect.width) * 100;
      const deltaY = ((moveEvent.pageY - startY) / rect.height) * 100;

      let newX = initialX + deltaX;
      let newY = initialY + deltaY;

      // Default snapping (5% increments)
      newX = Math.round(newX / 5) * 5;
      newY = Math.round(newY / 5) * 5;

      // Snapping to other panels
      const threshold = 2; // 2% threshold
      otherPanels.forEach((other) => {
        const ox = other.layoutData.x;
        const oy = other.layoutData.y;
        const ow = other.layoutData.w;
        const oh = other.layoutData.h;

        // X-axis snapping
        if (Math.abs(newX - ox) < threshold) newX = ox;
        if (Math.abs(newX - (ox + ow)) < threshold) newX = ox + ow;
        if (Math.abs(newX + panel.layoutData.w - ox) < threshold)
          newX = ox - panel.layoutData.w;
        if (Math.abs(newX + panel.layoutData.w - (ox + ow)) < threshold)
          newX = ox + ow - panel.layoutData.w;

        // Y-axis snapping
        if (Math.abs(newY - oy) < threshold) newY = oy;
        if (Math.abs(newY - (oy + oh)) < threshold) newY = oy + oh;
        if (Math.abs(newY + panel.layoutData.h - oy) < threshold)
          newY = oy - panel.layoutData.h;
        if (Math.abs(newY + panel.layoutData.h - (oy + oh)) < threshold)
          newY = oy + oh - panel.layoutData.h;
      });

      // Bounds
      newX = Math.max(0, Math.min(100 - panel.layoutData.w, newX));
      newY = Math.max(0, Math.min(100 - panel.layoutData.h, newY));

      // Collision Detection: Prevent overlapping by stopping at the edge
      const hasCollision = (tx: number, ty: number) => {
        return otherPanels.some((other) => {
          const ox = other.layoutData.x;
          const oy = other.layoutData.y;
          const ow = other.layoutData.w;
          const oh = other.layoutData.h;
          return !(
            tx + panel.layoutData.w <= ox ||
            tx >= ox + ow ||
            ty + panel.layoutData.h <= oy ||
            ty >= oy + oh
          );
        });
      };

      if (!hasCollision(newX, newY)) {
        updatePanelLayout(pageId, panel.id, { x: newX, y: newY });
      } else {
        // Try moving only X or only Y to allow "sliding" but more reliably
        if (!hasCollision(newX, panel.layoutData.y)) {
          updatePanelLayout(pageId, panel.id, { x: newX });
        } else if (!hasCollision(panel.layoutData.x, newY)) {
          updatePanelLayout(pageId, panel.id, { y: newY });
        }
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const startResizingBR = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const parent = (e.currentTarget as HTMLElement).closest(
      '.manga-page-container',
    );
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const startX = e.pageX;
    const startY = e.pageY;
    const initialW = panel.layoutData.w;
    const initialH = panel.layoutData.h;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = ((moveEvent.pageX - startX) / rect.width) * 100;
      const deltaY = ((moveEvent.pageY - startY) / rect.height) * 100;

      let newW = initialW + deltaX;
      let newH = initialH + deltaY;

      // Default snapping (5% increments)
      newW = Math.round(newW / 5) * 5;
      newH = Math.round(newH / 5) * 5;

      // Snapping to other panels
      const threshold = 2;
      otherPanels.forEach((other) => {
        const ox = other.layoutData.x;
        const oy = other.layoutData.y;
        const ow = other.layoutData.w;
        const oh = other.layoutData.h;

        // Width snapping
        if (Math.abs(panel.layoutData.x + newW - ox) < threshold)
          newW = ox - panel.layoutData.x;
        if (Math.abs(panel.layoutData.x + newW - (ox + ow)) < threshold)
          newW = ox + ow - panel.layoutData.x;

        // Height snapping
        if (Math.abs(panel.layoutData.y + newH - oy) < threshold)
          newH = oy - panel.layoutData.y;
        if (Math.abs(panel.layoutData.y + newH - (oy + oh)) < threshold)
          newH = oy + oh - panel.layoutData.y;
      });

      // Bounds
      newW = Math.max(10, Math.min(100 - panel.layoutData.x, newW));
      newH = Math.max(10, Math.min(100 - panel.layoutData.y, newH));

      // Collision Detection: Prevent overlapping by stopping at the edge
      const hasCollision = (tw: number, th: number) => {
        return otherPanels.some((other) => {
          const ox = other.layoutData.x;
          const oy = other.layoutData.y;
          const ow = other.layoutData.w;
          const oh = other.layoutData.h;
          return !(
            panel.layoutData.x + tw <= ox ||
            panel.layoutData.x >= ox + ow ||
            panel.layoutData.y + th <= oy ||
            panel.layoutData.y >= oy + oh
          );
        });
      };

      if (!hasCollision(newW, newH)) {
        updatePanelLayout(pageId, panel.id, { w: newW, h: newH });
      } else {
        if (!hasCollision(newW, panel.layoutData.h)) {
          updatePanelLayout(pageId, panel.id, { w: newW });
        } else if (!hasCollision(panel.layoutData.w, newH)) {
          updatePanelLayout(pageId, panel.id, { h: newH });
        }
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const startResizingBL = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const parent = (e.currentTarget as HTMLElement).closest(
      '.manga-page-container',
    );
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const startX = e.pageX;
    const startY = e.pageY;
    const initialX = panel.layoutData.x;
    const initialW = panel.layoutData.w;
    const initialH = panel.layoutData.h;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = ((moveEvent.pageX - startX) / rect.width) * 100;
      const deltaY = ((moveEvent.pageY - startY) / rect.height) * 100;

      let newX = initialX + deltaX;
      let newW = initialW - deltaX;
      let newH = initialH + deltaY;

      // Snapping
      newX = Math.round(newX / 5) * 5;
      newW = initialX + initialW - newX;
      newH = Math.round(newH / 5) * 5;

      // Bounds
      if (newW < 10) {
        newW = 10;
        newX = initialX + initialW - 10;
      }
      if (newX < 0) {
        newX = 0;
        newW = initialX + initialW;
      }
      newH = Math.max(10, Math.min(100 - panel.layoutData.y, newH));

      // Collision
      const hasCollision = (tx: number, tw: number, th: number) => {
        return otherPanels.some((other) => {
          const ox = other.layoutData.x;
          const oy = other.layoutData.y;
          const ow = other.layoutData.w;
          const oh = other.layoutData.h;
          return !(
            tx + tw <= ox ||
            tx >= ox + ow ||
            panel.layoutData.y + th <= oy ||
            panel.layoutData.y >= oy + oh
          );
        });
      };

      if (!hasCollision(newX, newW, newH)) {
        updatePanelLayout(pageId, panel.id, { x: newX, w: newW, h: newH });
      } else {
        if (!hasCollision(newX, newW, panel.layoutData.h)) {
          updatePanelLayout(pageId, panel.id, { x: newX, w: newW });
        } else if (
          !hasCollision(panel.layoutData.x, panel.layoutData.w, newH)
        ) {
          updatePanelLayout(pageId, panel.id, { h: newH });
        }
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      className="absolute bg-white border-2 border-yot-dark p-4 flex flex-col gap-2 group shadow-sm transition-shadow hover:shadow-md"
      style={{
        left: `${panel.layoutData.x}%`,
        top: `${panel.layoutData.y}%`,
        width: `${panel.layoutData.w}%`,
        height: `${panel.layoutData.h}%`,
        zIndex: panel.layoutData.zIndex || 1,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Drag Handle (Title) */}
      <div
        className="flex justify-between items-center cursor-move bg-yot-accent/20 p-1 rounded -m-1 mb-1"
        onMouseDown={startDragging}
      >
        <div className="flex items-center gap-2">
          <span className="font-cinzel font-black text-[10px] text-yot-dark opacity-50 uppercase tracking-widest">
            Panel {idx + 1}
          </span>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              addBubbleToPanel(pageId, panel.id);
            }}
            className="p-0.5 bg-yot-secondary text-white rounded hover:bg-yot-primary transition-colors"
            title="Add Speech Bubble"
          >
            <MessageSquare size={10} />
          </button>
        </div>
        <Maximize2
          size={10}
          className="text-yot-secondary opacity-30 group-hover:opacity-100 transition-opacity"
        />
      </div>

      <div className="flex-1 relative manga-panel-content">
        <textarea
          value={panel.composition}
          onChange={(e) =>
            updatePanel(pageId, panel.id, { composition: e.target.value })
          }
          placeholder="Action/Composition..."
          className="w-full h-full bg-transparent border-none outline-none resize-none text-[14px] text-slate-500 font-light leading-tight"
        />

        {/* Speech Bubbles */}
        {(panel.bubbles || []).map((bubble) => (
          <StoryboardBubble
            key={bubble.id}
            pageId={pageId}
            panelId={panel.id}
            bubble={bubble}
            chapter={chapter}
            updateBubble={updateBubble}
            deleteBubble={deleteBubble}
          />
        ))}
      </div>

      {/* Resize Handle (Bottom-Right) */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize flex items-end justify-end p-0.5"
        onMouseDown={startResizingBR}
      >
        <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-yot-secondary opacity-30 group-hover:opacity-100" />
      </div>

      {/* Resize Handle (Bottom-Left) */}
      <div
        className="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize flex items-end justify-start p-0.5"
        onMouseDown={startResizingBL}
      >
        <div className="w-1.5 h-1.5 border-l-2 border-b-2 border-yot-secondary opacity-30 group-hover:opacity-100" />
      </div>
    </div>
  );
}

export default function App() {
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    const saved = localStorage.getItem('noswrite-chapters');
    if (saved) return JSON.parse(saved);

    // Migration: Check if there's an old single chapter saved
    const oldSaved = localStorage.getItem('noswrite-chapter');
    if (oldSaved) {
      const oldChapter = JSON.parse(oldSaved);
      return [oldChapter];
    }

    return [INITIAL_CHAPTER];
  });

  const [activeChapterId, setActiveChapterId] = useState<string>(() => {
    const saved = localStorage.getItem('noswrite-active-chapter-id');
    if (saved) return saved;

    // Migration: Check if there's an old single chapter saved
    const oldSaved = localStorage.getItem('noswrite-chapter');
    if (oldSaved) {
      const oldChapter = JSON.parse(oldSaved);
      return oldChapter.id;
    }

    return INITIAL_CHAPTER.id;
  });

  const chapter = chapters.find((c) => c.id === activeChapterId) || chapters[0];

  const setChapter = (updater: Chapter | ((prev: Chapter) => Chapter)) => {
    setChapters((prev) =>
      prev.map((c) => {
        if (c.id === activeChapterId) {
          return typeof updater === 'function' ? (updater as any)(c) : updater;
        }
        return c;
      }),
    );
  };

  const [activeTab, setActiveTab] = useState<
    'outline' | 'dialogue' | 'storyboard'
  >('outline');
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(10);
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(
    null,
  );
  const [isChapterListOpen, setIsChapterListOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('noswrite-chapters', JSON.stringify(chapters));
    localStorage.setItem('noswrite-active-chapter-id', activeChapterId);
  }, [chapters, activeChapterId]);

  const addChapter = () => {
    const newChapter: Chapter = {
      ...INITIAL_CHAPTER,
      id: `chapter-${Date.now()}`,
      title: `New Chapter ${chapters.length + 1}`,
    };
    setChapters((prev) => [...prev, newChapter]);
    setActiveChapterId(newChapter.id);
    setIsChapterListOpen(false);
  };

  const deleteChapter = (id: string) => {
    if (chapters.length <= 1) return;
    setChapters((prev) => prev.filter((c) => c.id !== id));
    if (activeChapterId === id) {
      setActiveChapterId(
        chapters.find((c) => c.id !== id)?.id || chapters[0].id,
      );
    }
  };

  // --- ACTS ---
  const updateActTitle = (actId: string, title: string) => {
    setChapter((prev) => ({
      ...prev,
      acts: prev.acts.map((act) =>
        act.id === actId ? { ...act, title } : act,
      ),
    }));
  };

  const updateActLocation = (actId: string, locationId: string) => {
    setChapter((prev) => ({
      ...prev,
      acts: prev.acts.map((act) =>
        act.id === actId ? { ...act, locationId } : act,
      ),
    }));
  };

  const toggleActCharacter = (actId: string, charId: string) => {
    setChapter((prev) => ({
      ...prev,
      acts: prev.acts.map((act) => {
        if (act.id !== actId) return act;
        const exists = act.characterIds.includes(charId);
        return {
          ...act,
          characterIds: exists
            ? act.characterIds.filter((id) => id !== charId)
            : [...act.characterIds, charId],
        };
      }),
    }));
  };

  // --- BEATS ---
  const addBeat = (actId: string) => {
    const newBeat: Beat = {
      id: `beat-${Date.now()}`,
      title: 'New Beat',
      description: '',
      dialogue: [],
      characterIds: [],
    };
    setChapter((prev) => ({
      ...prev,
      acts: prev.acts.map((act) =>
        act.id === actId ? { ...act, beats: [...act.beats, newBeat] } : act,
      ),
    }));
  };

  const updateBeat = (
    actId: string,
    beatId: string,
    updates: Partial<Beat>,
  ) => {
    setChapter((prev) => ({
      ...prev,
      acts: prev.acts.map((act) =>
        act.id === actId
          ? {
              ...act,
              beats: act.beats.map((beat) =>
                beat.id === beatId ? { ...beat, ...updates } : beat,
              ),
            }
          : act,
      ),
    }));
  };

  const deleteBeat = (actId: string, beatId: string) => {
    setChapter((prev) => ({
      ...prev,
      acts: prev.acts.map((act) =>
        act.id === actId
          ? { ...act, beats: act.beats.filter((beat) => beat.id !== beatId) }
          : act,
      ),
    }));
  };

  const toggleBeatCharacter = (
    actId: string,
    beatId: string,
    charId: string,
  ) => {
    setChapter((prev) => ({
      ...prev,
      acts: prev.acts.map((act) => {
        if (act.id !== actId) return act;
        return {
          ...act,
          beats: act.beats.map((beat) => {
            if (beat.id !== beatId) return beat;
            const exists = beat.characterIds.includes(charId);
            return {
              ...beat,
              characterIds: exists
                ? beat.characterIds.filter((id) => id !== charId)
                : [...beat.characterIds, charId],
            };
          }),
        };
      }),
    }));
  };

  // --- CHARACTERS ---
  const addCharacter = () => {
    const newChar: Character = {
      id: `char-${Date.now()}`,
      name: 'New Character',
      color:
        CHARACTER_PALETTE[chapter.characters.length % CHARACTER_PALETTE.length],
    };
    setChapter((prev) => ({
      ...prev,
      characters: [...prev.characters, newChar],
    }));
  };

  const updateCharacter = (id: string, updates: Partial<Character>) => {
    setChapter((prev) => ({
      ...prev,
      characters: prev.characters.map((c) =>
        c.id === id ? { ...c, ...updates } : c,
      ),
    }));
  };

  const deleteCharacter = (id: string) => {
    setChapter((prev) => ({
      ...prev,
      characters: prev.characters.filter((c) => c.id !== id),
      acts: prev.acts.map((act) => ({
        ...act,
        characterIds: act.characterIds.filter((cid) => cid !== id),
        beats: act.beats.map((beat) => ({
          ...beat,
          characterIds: beat.characterIds.filter((cid) => cid !== id),
          dialogue: beat.dialogue.filter((d) => d.characterId !== id),
        })),
      })),
    }));
  };

  // --- LOCATIONS ---
  const addLocation = () => {
    const newLoc: Location = {
      id: `loc-${Date.now()}`,
      name: 'New Location',
      description: '',
    };
    setChapter((prev) => ({
      ...prev,
      locations: [...prev.locations, newLoc],
    }));
  };

  const updateLocation = (id: string, updates: Partial<Location>) => {
    setChapter((prev) => ({
      ...prev,
      locations: prev.locations.map((l) =>
        l.id === id ? { ...l, ...updates } : l,
      ),
    }));
  };

  const deleteLocation = (id: string) => {
    setChapter((prev) => ({
      ...prev,
      locations: prev.locations.filter((l) => l.id !== id),
      acts: prev.acts.map((act) =>
        act.locationId === id ? { ...act, locationId: undefined } : act,
      ),
    }));
  };

  // --- DIALOGUE ---
  const addDialogueToBeat = (
    actId: string,
    beatId: string,
    characterId: string,
  ) => {
    const newDialogue: Dialogue = {
      id: `diag-${Date.now()}`,
      characterId,
      text: '',
    };
    setChapter((prev) => ({
      ...prev,
      acts: prev.acts.map((act) =>
        act.id === actId
          ? {
              ...act,
              beats: act.beats.map((beat) =>
                beat.id === beatId
                  ? { ...beat, dialogue: [...beat.dialogue, newDialogue] }
                  : beat,
              ),
            }
          : act,
      ),
    }));
  };

  const updateDialogue = (
    actId: string,
    beatId: string,
    dialogueId: string,
    text: string,
  ) => {
    setChapter((prev) => ({
      ...prev,
      acts: prev.acts.map((act) =>
        act.id === actId
          ? {
              ...act,
              beats: act.beats.map((beat) =>
                beat.id === beatId
                  ? {
                      ...beat,
                      dialogue: beat.dialogue.map((d) =>
                        d.id === dialogueId ? { ...d, text } : d,
                      ),
                    }
                  : beat,
              ),
            }
          : act,
      ),
    }));
  };

  const deleteDialogue = (
    actId: string,
    beatId: string,
    dialogueId: string,
  ) => {
    setChapter((prev) => ({
      ...prev,
      acts: prev.acts.map((act) =>
        act.id === actId
          ? {
              ...act,
              beats: act.beats.map((beat) =>
                beat.id === beatId
                  ? {
                      ...beat,
                      dialogue: beat.dialogue.filter(
                        (d) => d.id !== dialogueId,
                      ),
                    }
                  : beat,
              ),
            }
          : act,
      ),
    }));
  };

  // --- STORYBOARD ---
  const addPage = () => {
    const newPage: Page = {
      id: `page-${Date.now()}`,
      pageNumber: chapter.pages.length + 1,
      panelCount: 0,
      panels: [],
    };
    setChapter((prev) => ({
      ...prev,
      pages: [...prev.pages, newPage],
    }));
  };

  const clearPage = (pageId: string) => {
    setChapter((prev) => ({
      ...prev,
      pages: prev.pages.map((p) =>
        p.id === pageId ? { ...p, panels: [], panelCount: 0 } : p,
      ),
    }));
  };

  const deletePage = (pageId: string) => {
    setChapter((prev) => ({
      ...prev,
      pages: prev.pages
        .filter((p) => p.id !== pageId)
        .map((p, idx) => ({ ...p, pageNumber: idx + 1 })),
    }));
    setPageToDelete(null);
  };

  const updatePage = (pageId: string, panelCount: number) => {
    setChapter((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => {
        if (p.id !== pageId) return p;

        let newPanels = [...p.panels];
        if (panelCount > p.panels.length) {
          for (let i = p.panels.length; i < panelCount; i++) {
            newPanels.push({
              id: `panel-${Date.now()}-${i}`,
              composition: '',
              bubbles: [],
              layoutData: {
                x: 0,
                y: (i * 10) % 100,
                w: 100,
                h: 25,
                zIndex: i + 1,
              },
            });
          }
        } else {
          newPanels = newPanels.slice(0, panelCount);
        }

        return { ...p, panelCount, panels: newPanels };
      }),
    }));
  };

  const updatePanel = (
    pageId: string,
    panelId: string,
    updates: Partial<Panel>,
  ) => {
    setChapter((prev) => ({
      ...prev,
      pages: prev.pages.map((p) =>
        p.id === pageId
          ? {
              ...p,
              panels: p.panels.map((pan) =>
                pan.id === panelId ? { ...pan, ...updates } : pan,
              ),
            }
          : p,
      ),
    }));
  };

  const updatePanelLayout = (
    pageId: string,
    panelId: string,
    updates: Partial<Panel['layoutData']>,
  ) => {
    setChapter((prev) => ({
      ...prev,
      pages: prev.pages.map((p) =>
        p.id === pageId
          ? {
              ...p,
              panels: p.panels.map((pan) =>
                pan.id === panelId
                  ? { ...pan, layoutData: { ...pan.layoutData, ...updates } }
                  : pan,
              ),
            }
          : p,
      ),
    }));
  };

  const addBubbleToPanel = (pageId: string, panelId: string) => {
    const newBubble: Bubble = {
      id: `bubble-${Date.now()}`,
      dialogueId: '',
      x: 25,
      y: 25,
      w: 50,
      h: 30,
    };
    setChapter((prev) => ({
      ...prev,
      pages: prev.pages.map((p) =>
        p.id === pageId
          ? {
              ...p,
              panels: p.panels.map((pan) =>
                pan.id === panelId
                  ? { ...pan, bubbles: [...(pan.bubbles || []), newBubble] }
                  : pan,
              ),
            }
          : p,
      ),
    }));
  };

  const updateBubble = (
    pageId: string,
    panelId: string,
    bubbleId: string,
    updates: Partial<Bubble>,
  ) => {
    setChapter((prev) => ({
      ...prev,
      pages: prev.pages.map((p) =>
        p.id === pageId
          ? {
              ...p,
              panels: p.panels.map((pan) =>
                pan.id === panelId
                  ? {
                      ...pan,
                      bubbles: pan.bubbles.map((b) =>
                        b.id === bubbleId ? { ...b, ...updates } : b,
                      ),
                    }
                  : pan,
              ),
            }
          : p,
      ),
    }));
  };

  const deleteBubble = (pageId: string, panelId: string, bubbleId: string) => {
    setChapter((prev) => ({
      ...prev,
      pages: prev.pages.map((p) =>
        p.id === pageId
          ? {
              ...p,
              panels: p.panels.map((pan) =>
                pan.id === panelId
                  ? {
                      ...pan,
                      bubbles: pan.bubbles.filter((b) => b.id !== bubbleId),
                    }
                  : pan,
              ),
            }
          : p,
      ),
    }));
  };

  const addPanelToPage = (pageId: string) => {
    setChapter((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => {
        if (p.id !== pageId) return p;

        const lastPanel = p.panels[p.panels.length - 1];
        let newX = 0;
        let newY = 0;
        let newW = 100;
        let newH = 25;

        if (lastPanel) {
          newW = lastPanel.layoutData.w;
          newH = lastPanel.layoutData.h;

          // Try to place next to last panel
          newX = lastPanel.layoutData.x + lastPanel.layoutData.w;
          newY = lastPanel.layoutData.y;

          // If exceeds width, go to next row
          if (newX + newW > 100) {
            newX = 0;
            newY = lastPanel.layoutData.y + lastPanel.layoutData.h;
          }

          // If exceeds height, just cap it
          if (newY + newH > 100) {
            newY = 100 - newH;
          }
        }

        // Collision Check & Adjust: If the spot is taken, find the next available spot
        let attempts = 0;
        const maxAttempts = 20;
        while (attempts < maxAttempts) {
          const hasCollision = p.panels.some((other) => {
            const ox = other.layoutData.x;
            const oy = other.layoutData.y;
            const ow = other.layoutData.w;
            const oh = other.layoutData.h;
            return !(
              newX + newW <= ox ||
              newX >= ox + ow ||
              newY + newH <= oy ||
              newY >= oy + oh
            );
          });

          if (!hasCollision) break;

          // Move to next spot
          newX += 5; // Move by 5% grid
          if (newX + newW > 100) {
            newX = 0;
            newY += 5;
          }
          if (newY + newH > 100) {
            // If we can't find a spot, just stop or overlap (though user said no overlap)
            // We'll just stop at the bottom
            newY = 100 - newH;
            break;
          }
          attempts++;
        }

        const newPanel: Panel = {
          id: `panel-${Date.now()}`,
          composition: '',
          bubbles: [],
          layoutData: {
            x: newX,
            y: newY,
            w: newW,
            h: newH,
            zIndex: maxZIndex + 1,
          },
        };

        return {
          ...p,
          panels: [...p.panels, newPanel],
          panelCount: p.panels.length + 1,
        };
      }),
    }));
    setMaxZIndex((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-yot-bg flex flex-col">
      {/* Cinematic Header */}
      <header className="bg-yot-dark p-8 md:p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://pub-c762db5339954ab98813a32e9aaa79ff.r2.dev/chapter16/YOTCH-16_001.png"
            alt="Background"
            className="w-full h-full object-cover grayscale"
            style={{ objectPosition: 'center 45%' }}
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yot-secondary/20 rounded-full text-yot-secondary text-[10px] font-black uppercase tracking-[0.3em] mb-4 border border-yot-secondary/30">
              <Sparkles size={12} /> Chapter Planning Tool
            </div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-5xl md:text-7xl text-white leading-none">
                Nos<span className="text-yot-secondary">Write</span>
              </h1>
            </div>
            <input
              value={chapter.title}
              onChange={(e) =>
                setChapter((prev) => ({ ...prev, title: e.target.value }))
              }
              className="text-xl text-slate-400 bg-transparent border-none outline-none focus:ring-0 w-full max-w-md font-light italic"
              placeholder="Enter Chapter Title..."
            />
          </div>
          <div className="flex gap-4">
            <button className="yot-btn-outline !border-white !text-white hover:!bg-white hover:!text-yot-dark flex items-center gap-2">
              <Save size={16} /> Save
            </button>
            <button className="yot-btn-primary bg-white !text-yot-dark hover:!bg-yot-accent flex items-center gap-2">
              <Download size={16} /> Export
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="flex items-center justify-center gap-4 md:gap-12 p-6 border-b border-yot-accent bg-white sticky top-0 z-50 shadow-sm">
        {/* Chapter Selector */}
        <div className="relative">
          <button
            onClick={() => setIsChapterListOpen(!isChapterListOpen)}
            className="flex items-center gap-2 bg-yot-accent/50 hover:bg-yot-accent text-yot-primary px-4 py-3 rounded-2xl border border-yot-secondary/10 transition-all"
          >
            <BookOpen size={18} className="text-yot-secondary" />
            <span className="font-cinzel font-black text-xs uppercase tracking-widest">
              Chapters
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform ${isChapterListOpen ? 'rotate-180' : ''}`}
            />
          </button>

          <AnimatePresence>
            {isChapterListOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsChapterListOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute left-0 top-full mt-2 z-50 w-64 bg-white border border-yot-accent rounded-2xl shadow-2xl overflow-hidden"
                >
                  <div className="p-4 border-b border-yot-accent bg-yot-bg flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Your Chapters
                    </span>
                    <button
                      onClick={addChapter}
                      className="p-1 bg-yot-secondary text-white rounded-lg hover:bg-yot-primary transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {chapters.map((c) => (
                      <div
                        key={c.id}
                        className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                          c.id === activeChapterId
                            ? 'bg-yot-accent text-yot-primary border-l-4 border-yot-secondary'
                            : 'hover:bg-yot-bg border-l-4 border-transparent'
                        }`}
                        onClick={() => {
                          setActiveChapterId(c.id);
                          setIsChapterListOpen(false);
                        }}
                      >
                        <div className="flex-1 truncate pr-4">
                          <div className="text-sm font-bold text-slate-700 truncate">
                            {c.title}
                          </div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-widest">
                            {c.acts.length} Acts
                          </div>
                        </div>
                        {chapters.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChapter(c.id);
                            }}
                            className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-8 bg-yot-accent mx-2 hidden md:block" />

        {[
          { id: 'outline', label: 'Outline', icon: FileText },
          { id: 'dialogue', label: 'Dialogue', icon: MessageSquare },
          { id: 'storyboard', label: 'Storyboard', icon: Layout },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all group ${
              activeTab === tab.id
                ? 'bg-yot-accent text-yot-primary shadow-inner border border-yot-secondary/20'
                : 'text-slate-400 hover:text-yot-primary hover:bg-yot-accent/30'
            }`}
          >
            <tab.icon
              className={`w-5 h-5 ${activeTab === tab.id ? 'text-yot-secondary' : 'text-slate-300 group-hover:text-yot-secondary'}`}
            />
            <span className="font-cinzel font-black uppercase text-xs tracking-widest">
              {tab.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-6 md:p-12 max-w-7xl">
        <AnimatePresence mode="wait">
          {activeTab === 'outline' && (
            <motion.div
              key="outline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12"
            >
              {/* Sidebar: Characters & Locations */}
              <aside className="lg:col-span-3 space-y-12">
                {/* Characters */}
                <div className="yot-card p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg text-yot-primary">Characters</h3>
                    <button
                      onClick={addCharacter}
                      className="text-yot-secondary hover:bg-yot-accent p-1 rounded-full transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {chapter.characters.map((char) => (
                      <div
                        key={char.id}
                        className="flex items-center gap-3 group"
                      >
                        <CharacterColorPicker
                          char={char}
                          isOpen={activeColorPicker === char.id}
                          onToggle={() =>
                            setActiveColorPicker(
                              activeColorPicker === char.id ? null : char.id,
                            )
                          }
                          onSelect={(color) => {
                            updateCharacter(char.id, { color });
                            setActiveColorPicker(null);
                          }}
                        />
                        <input
                          value={char.name}
                          onChange={(e) =>
                            updateCharacter(char.id, { name: e.target.value })
                          }
                          className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-700"
                        />
                        <button
                          onClick={() => deleteCharacter(char.id)}
                          className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Locations */}
                <div className="yot-card p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg text-yot-primary">Locations</h3>
                    <button
                      onClick={addLocation}
                      className="text-yot-secondary hover:bg-yot-accent p-1 rounded-full transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {chapter.locations.map((loc) => (
                      <div
                        key={loc.id}
                        className="flex items-center gap-3 group"
                      >
                        <MapPin
                          size={14}
                          className="text-yot-secondary shrink-0"
                        />
                        <input
                          value={loc.name}
                          onChange={(e) =>
                            updateLocation(loc.id, { name: e.target.value })
                          }
                          className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-700"
                        />
                        <button
                          onClick={() => deleteLocation(loc.id)}
                          className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>

              {/* Main Outline */}
              <div className="lg:col-span-9 space-y-12">
                {chapter.acts.map((act) => (
                  <section key={act.id} className="yot-card p-10 space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-yot-accent pb-6">
                      <div className="flex-1 w-full">
                        <input
                          value={act.title}
                          onChange={(e) =>
                            updateActTitle(act.id, e.target.value)
                          }
                          className="text-3xl md:text-4xl font-black text-yot-primary bg-transparent border-none outline-none w-full uppercase tracking-tighter"
                        />
                        <div className="flex flex-wrap gap-4 mt-4">
                          {/* Location Selector */}
                          <div className="flex items-center gap-2 bg-yot-accent/50 px-3 py-1 rounded-full">
                            <MapPin size={14} className="text-yot-secondary" />
                            <select
                              value={act.locationId || ''}
                              onChange={(e) =>
                                updateActLocation(act.id, e.target.value)
                              }
                              className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-yot-primary"
                            >
                              <option value="">No Location</option>
                              {chapter.locations.map((l) => (
                                <option key={l.id} value={l.id}>
                                  {l.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          {/* Act Characters */}
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-slate-400" />
                            <div className="flex flex-wrap gap-2">
                              {chapter.characters.map((char) => (
                                <button
                                  key={char.id}
                                  onClick={() =>
                                    toggleActCharacter(act.id, char.id)
                                  }
                                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                    act.characterIds.includes(char.id)
                                      ? 'bg-yot-secondary text-white border-yot-secondary'
                                      : 'bg-white text-slate-400 border-slate-200 hover:border-yot-secondary'
                                  }`}
                                >
                                  {char.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => addBeat(act.id)}
                        className="yot-btn-primary whitespace-nowrap"
                      >
                        Add Beat
                      </button>
                    </div>

                    <div className="space-y-6">
                      {act.beats.map((beat) => (
                        <div
                          key={beat.id}
                          className="p-8 bg-yot-bg rounded-3xl border border-yot-accent hover:border-yot-secondary transition-all group"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <input
                              value={beat.title}
                              onChange={(e) =>
                                updateBeat(act.id, beat.id, {
                                  title: e.target.value,
                                })
                              }
                              className="text-xl font-black text-yot-primary bg-transparent border-none outline-none w-full uppercase"
                            />
                            <button
                              onClick={() => deleteBeat(act.id, beat.id)}
                              className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          <textarea
                            value={beat.description}
                            onChange={(e) =>
                              updateBeat(act.id, beat.id, {
                                description: e.target.value,
                              })
                            }
                            placeholder="Beat description..."
                            className="w-full bg-transparent border-none outline-none resize-none min-h-[80px] text-slate-500 font-light leading-relaxed"
                          />
                          <div className="mt-4 pt-4 border-t border-yot-accent flex flex-wrap gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">
                              Beat Cast:
                            </span>
                            {chapter.characters
                              .filter((c) => act.characterIds.includes(c.id))
                              .map((char) => (
                                <button
                                  key={char.id}
                                  onClick={() =>
                                    toggleBeatCharacter(
                                      act.id,
                                      beat.id,
                                      char.id,
                                    )
                                  }
                                  className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border transition-all ${
                                    beat.characterIds.includes(char.id)
                                      ? 'bg-yot-primary text-white border-yot-primary'
                                      : 'bg-white text-slate-300 border-slate-100 hover:border-yot-primary'
                                  }`}
                                >
                                  {char.name}
                                </button>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'dialogue' && (
            <motion.div
              key="dialogue"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {chapter.acts.map((act) => (
                <div key={act.id} className="space-y-8">
                  <div className="flex items-center gap-4">
                    <h2 className="text-3xl text-yot-primary">{act.title}</h2>
                    <div className="h-px flex-1 bg-yot-accent"></div>
                    {act.locationId && (
                      <div className="flex items-center gap-2 text-yot-secondary text-xs font-black uppercase tracking-widest">
                        <MapPin size={14} />{' '}
                        {
                          chapter.locations.find((l) => l.id === act.locationId)
                            ?.name
                        }
                      </div>
                    )}
                  </div>

                  <div className="grid gap-8">
                    {act.beats.map((beat) => (
                      <div key={beat.id} className="yot-card p-10">
                        <h4 className="text-xl text-yot-primary mb-8 border-b border-yot-accent pb-4 flex justify-between items-center">
                          {beat.title}
                          <span className="text-[10px] font-light text-slate-400 italic">
                            Beat Script
                          </span>
                        </h4>

                        <div className="space-y-8">
                          {beat.dialogue.map((diag) => {
                            const char = chapter.characters.find(
                              (c) => c.id === diag.characterId,
                            );
                            return (
                              <div
                                key={diag.id}
                                className="flex gap-8 items-start group"
                              >
                                <div className="w-32 shrink-0 text-right">
                                  <div
                                    className="font-cinzel font-black text-xs uppercase tracking-[0.2em] mb-1"
                                    style={{ color: char?.color || 'inherit' }}
                                  >
                                    {char?.name || 'Unknown'}
                                  </div>
                                  <div
                                    className="w-full h-1 rounded-full"
                                    style={{
                                      backgroundColor: char?.color || '#eee',
                                      opacity: 0.3,
                                    }}
                                  />
                                </div>
                                <div className="flex-1 relative">
                                  <textarea
                                    value={diag.text}
                                    onChange={(e) =>
                                      updateDialogue(
                                        act.id,
                                        beat.id,
                                        diag.id,
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Type dialogue line..."
                                    className="w-full bg-transparent border-none outline-none resize-none text-lg text-slate-600 font-light leading-relaxed italic"
                                    rows={1}
                                    onInput={(e) => {
                                      const target =
                                        e.target as HTMLTextAreaElement;
                                      target.style.height = 'auto';
                                      target.style.height =
                                        target.scrollHeight + 'px';
                                    }}
                                  />
                                  <button
                                    onClick={() =>
                                      deleteDialogue(act.id, beat.id, diag.id)
                                    }
                                    className="absolute -right-8 top-1 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                          <div className="flex flex-wrap gap-3 pt-6 border-t border-yot-accent/50">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 self-center mr-2">
                              Add Line:
                            </span>
                            {chapter.characters
                              .filter((c) => beat.characterIds.includes(c.id))
                              .map((char) => (
                                <button
                                  key={char.id}
                                  onClick={() =>
                                    addDialogueToBeat(act.id, beat.id, char.id)
                                  }
                                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest border border-yot-accent hover:border-yot-secondary hover:bg-yot-accent transition-all text-yot-primary"
                                >
                                  <Plus size={12} /> {char.name}
                                </button>
                              ))}
                            {beat.characterIds.length === 0 && (
                              <p className="text-xs italic text-slate-400">
                                Assign characters to this beat in the Outline to
                                start scripting.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'storyboard' && (
            <motion.div
              key="storyboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-4xl text-yot-primary">Storyboard</h2>
                <button
                  onClick={addPage}
                  className="yot-btn-primary flex items-center gap-2"
                >
                  <Plus size={16} /> New Page
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
                {chapter.pages.map((page) => (
                  <div key={page.id} className="space-y-8">
                    <div className="flex justify-between items-center border-b border-yot-accent pb-4">
                      <h3 className="text-2xl text-yot-primary">
                        Page {page.pageNumber}
                      </h3>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                          <Grid size={16} className="text-yot-secondary" />
                          <select
                            value={page.panelCount}
                            onChange={(e) =>
                              updatePage(page.id, parseInt(e.target.value))
                            }
                            className="bg-transparent border-none outline-none font-cinzel font-black text-xs uppercase tracking-widest text-yot-primary"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                              <option key={n} value={n}>
                                {n} Panels
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Manga Page Thumbnail */}
                    <div className="manga-page-container aspect-[1/1.414] bg-white border-8 border-yot-dark shadow-2xl relative overflow-hidden group/page">
                      {page.panels.map((panel, idx) => (
                        <StoryboardPanel
                          key={panel.id}
                          pageId={page.id}
                          panel={panel}
                          idx={idx}
                          chapter={chapter}
                          updatePanel={updatePanel}
                          updatePanelLayout={updatePanelLayout}
                          addBubbleToPanel={addBubbleToPanel}
                          updateBubble={updateBubble}
                          deleteBubble={deleteBubble}
                          maxZIndex={maxZIndex}
                          setMaxZIndex={setMaxZIndex}
                          otherPanels={page.panels.filter(
                            (p) => p.id !== panel.id,
                          )}
                        />
                      ))}

                      {/* Add/Clear Panel Buttons Overlay */}
                      <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 opacity-0 group-hover/page:opacity-100 transition-opacity">
                        <button
                          onClick={() => addPanelToPage(page.id)}
                          className="w-12 h-12 bg-yot-primary text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                          title="Add Panel to Page"
                        >
                          <Plus size={24} />
                        </button>
                        <button
                          onClick={() => clearPage(page.id)}
                          className="w-12 h-12 bg-red-500 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                          title="Clear Page"
                        >
                          <Trash2 size={24} />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setPageToDelete(page.id)}
                        className="text-slate-300 hover:text-red-500 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors"
                      >
                        <Trash2 size={14} /> Delete Page
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {chapter.pages.length === 0 && (
                <div className="yot-card py-32 text-center">
                  <Layout size={64} className="text-yot-accent mx-auto mb-6" />
                  <p className="text-xl text-slate-400 font-light italic">
                    Your storyboard is empty. Create your first page to start
                    layouting.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {pageToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-yot-dark/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="yot-card p-12 max-w-md w-full text-center space-y-8"
            >
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={40} />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl text-yot-primary">Delete Page?</h3>
                <p className="text-slate-500 font-light italic">
                  Are you sure you want to delete this page? This action cannot
                  be undone and all panel data will be lost.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setPageToDelete(null)}
                  className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 text-slate-400 font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deletePage(pageToDelete)}
                  className="flex-1 px-6 py-4 rounded-2xl bg-red-600 text-white font-black uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="p-12 bg-yot-dark text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl text-white mb-4">NosWrite</h2>
          <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em] mb-8">
            The Ultimate Manga Planning Suite
          </p>
          <div className="h-px w-24 bg-yot-secondary mx-auto mb-8"></div>
          <p className="text-slate-600 text-[10px] uppercase tracking-widest">
            &copy; 2026 NosWrite &bull; Built for the next generation of Mangaka
          </p>
        </div>
      </footer>
    </div>
  );
}
