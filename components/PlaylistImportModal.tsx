import React, { useState } from 'react';
import { X, Youtube, Loader2, Plus, Check, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { importPlaylistFromUrl } from '../services/geminiService';

interface PlaylistImportModalProps {
  onAddTasks: (tasks: any[]) => void;
  onClose: () => void;
}

export const PlaylistImportModal: React.FC<PlaylistImportModalProps> = ({ onAddTasks, onClose }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{playlistTitle: string, videos: {title: string, number: number}[]} | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!url.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const data = await importPlaylistFromUrl(url);
      setResult(data);
      // Select all by default
      setSelectedIndices(new Set(data.videos.map((_, i) => i)));
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to scan playlist");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (index: number) => {
    const newSet = new Set(selectedIndices);
    if (newSet.has(index)) newSet.delete(index);
    else newSet.add(index);
    setSelectedIndices(newSet);
  };

  const handleImport = () => {
    if (!result) return;
    const tasksToAdd = result.videos
      .filter((_, i) => selectedIndices.has(i))
      .map(v => ({
        title: `Watch: ${v.title}`,
        priority: 'Medium',
        durationMinutes: 20, // Default duration
        category: 'Study',   // Default category
        energyRequired: 'Low'
      }));
    
    onAddTasks(tasksToAdd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-950 w-full max-w-2xl rounded-2xl border-2 border-red-900/50 shadow-[0_0_50px_rgba(220,38,38,0.1)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-900 bg-zinc-900/30 flex justify-between items-center">
            <div className="flex items-center gap-2 text-red-500">
                <Youtube className="w-6 h-6" />
                <h2 className="text-lg font-bold font-mono uppercase tracking-tighter">YouTube Uplink</h2>
            </div>
            <button onClick={onClose} className="p-1 text-zinc-500 hover:text-white rounded-full hover:bg-zinc-800 transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-6">
            {!result ? (
                <div className="space-y-4">
                    <p className="text-zinc-400 font-mono text-sm">Paste a public YouTube playlist URL to extract video titles and convert them into quests.</p>
                    <div className="flex gap-2">
                        <input 
                            type="url" 
                            value={url}
                            onChange={(e) => { setUrl(e.target.value); setError(null); }}
                            placeholder="https://www.youtube.com/playlist?list=..."
                            className="flex-1 bg-black/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none font-mono text-sm"
                        />
                        <Button variant="danger" onClick={handleScan} isLoading={isLoading} disabled={!url.trim()}>
                            SCAN LINK
                        </Button>
                    </div>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex items-center gap-2 text-red-400 text-sm font-mono">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                         <div>
                             <h3 className="text-white font-bold font-mono">{result.playlistTitle}</h3>
                             <p className="text-xs text-zinc-500 font-mono uppercase">{result.videos.length} Videos Found</p>
                         </div>
                         <button 
                            onClick={() => setResult(null)} 
                            className="text-xs text-red-400 hover:text-red-300 underline font-mono"
                         >
                            Reset Link
                         </button>
                    </div>

                    <div className="space-y-2">
                        {result.videos.map((video, idx) => {
                            const isSelected = selectedIndices.has(idx);
                            return (
                                <div 
                                    key={idx}
                                    onClick={() => toggleSelection(idx)}
                                    className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer transition-all ${
                                        isSelected 
                                        ? 'bg-red-950/20 border-red-500/50' 
                                        : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-red-500 border-red-500' : 'border-zinc-700'}`}>
                                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-mono text-zinc-300 truncate">{video.title}</div>
                                        <div className="text-[10px] text-zinc-600 font-mono uppercase">Video #{video.number}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>

        {result && (
            <div className="p-6 border-t border-zinc-900 bg-zinc-900/30 flex justify-end gap-3">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button onClick={handleImport} disabled={selectedIndices.size === 0}>
                    <Plus className="w-4 h-4 mr-2" />
                    Import {selectedIndices.size} Tasks
                </Button>
            </div>
        )}
      </div>
    </div>
  );
};