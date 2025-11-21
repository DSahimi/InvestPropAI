import React, { useState } from 'react';
import { Wand2, Video, Download, Loader2, Image as ImageIcon, Search } from 'lucide-react';
import { generateImageEdit, generateVeoVideo, performMarketResearch } from '../services/geminiService';
import { ToolTab } from '../types';

interface Props {
  originalImage: string;
  activeTab: ToolTab;
  address: string;
}

const GeminiTools: React.FC<Props> = ({ originalImage, activeTab, address }) => {
  // Image Editor State
  const [editorPrompt, setEditorPrompt] = useState('');
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Veo State
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [videoPrompt, setVideoPrompt] = useState('Cinematic flyover of this property on a sunny day');

  // Market Research State
  const [researchQuery, setResearchQuery] = useState(`What is a fair rental price for a house at ${address}?`);
  const [researchResult, setResearchResult] = useState<{text: string, sources: any[]} | null>(null);
  const [isResearching, setIsResearching] = useState(false);

  const handleGenerateEdit = async () => {
    if (!editorPrompt) return;
    setIsEditing(true);
    try {
      // Strip data prefix if present for sending to API logic (though service handles it usually, 
      // the service expects base64 without prefix for `data`)
      // Actually, my service implementation expects base64 string for `inlineData.data`.
      const base64Data = originalImage.split(',')[1];
      const result = await generateImageEdit(base64Data, editorPrompt);
      setEditedImage(result);
    } catch (e) {
      alert("Failed to generate image edit.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleGenerateVideo = async () => {
    setIsVideoGenerating(true);
    try {
      const base64Data = originalImage.split(',')[1];
      const result = await generateVeoVideo(base64Data, videoPrompt);
      setVideoUrl(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(`Failed to generate video: ${msg}. Note: Veo requires a paid project API key.`);
    } finally {
      setIsVideoGenerating(false);
    }
  };

  const handleResearch = async () => {
    setIsResearching(true);
    try {
      const result = await performMarketResearch(researchQuery);
      setResearchResult(result);
    } catch (e) {
      alert("Market research failed.");
    } finally {
      setIsResearching(false);
    }
  }

  if (activeTab === 'details') return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Market Research Tool */}
      {activeTab === 'market-research' && (
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-600" />
              Market Research
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Powered by Gemini 2.5 Flash & Google Search
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
               <label className="block text-xs font-medium text-slate-700 mb-1">Research Query</label>
               <div className="flex gap-2">
                 <input 
                    type="text"
                    value={researchQuery}
                    onChange={(e) => setResearchQuery(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ask about rental rates, crime, or schools..."
                 />
                 <button
                    onClick={handleResearch}
                    disabled={isResearching}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                 >
                    {isResearching ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Search'}
                 </button>
               </div>
            </div>

            {researchResult && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="prose prose-sm max-w-none text-slate-700">
                  <p className="whitespace-pre-line">{researchResult.text}</p>
                </div>
                {researchResult.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Sources</p>
                    <ul className="space-y-1">
                      {researchResult.sources.map((chunk, idx) => (
                        <li key={idx}>
                          {chunk.web?.uri && (
                             <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block">
                               {chunk.web.title || chunk.web.uri}
                             </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Editor Tool */}
      {activeTab === 'image-editor' && (
        <div className="p-6">
           <div className="mb-4 bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-800 flex items-start gap-2">
            <Wand2 className="w-4 h-4 mt-0.5 shrink-0" />
            <p>Powered by <strong>Gemini 2.5 Flash Image</strong>. Try prompts like "Add a pool", "Make it sunset", or "Modernize the exterior".</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase">Original</p>
              <div className="aspect-[4/3] bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200">
                <img src={originalImage} alt="Original" className="w-full h-full object-cover" />
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase">AI Result</p>
              <div className="aspect-[4/3] bg-slate-50 rounded-xl overflow-hidden relative border border-slate-200 flex items-center justify-center group">
                {editedImage ? (
                  <>
                    <img src={editedImage} alt="Edited" className="w-full h-full object-cover" />
                    <a href={editedImage} download="propvest-edit.png" className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                      <Download className="w-4 h-4 text-slate-700" />
                    </a>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Result will appear here</p>
                  </div>
                )}
                {isEditing && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
                      <p className="text-sm font-medium text-indigo-900">Generating changes...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <input 
              type="text" 
              placeholder="Describe your edit (e.g., 'Add a modern fence')"
              value={editorPrompt}
              onChange={(e) => setEditorPrompt(e.target.value)}
              className="flex-1 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button 
              onClick={handleGenerateEdit}
              disabled={!editorPrompt || isEditing}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <Wand2 className="w-4 h-4" />
              Generate
            </button>
          </div>
        </div>
      )}

      {/* Veo Animator Tool */}
      {activeTab === 'veo-animator' && (
        <div className="p-6">
          <div className="mb-4 bg-purple-50 border border-purple-100 rounded-lg p-3 text-sm text-purple-900 flex items-start gap-2">
            <Video className="w-4 h-4 mt-0.5 shrink-0" />
            <p>Powered by <strong>Veo</strong>. Generates high-quality video from the property image. Note: This process takes 1-2 minutes.</p>
          </div>

          <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden relative mb-6 flex items-center justify-center">
            {videoUrl ? (
              <video 
                src={videoUrl} 
                controls 
                autoPlay 
                loop 
                className="w-full h-full object-contain"
              />
            ) : (
              <>
                <img src={originalImage} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm" alt="bg" />
                <div className="relative z-10 text-center text-white p-6 max-w-md">
                   <Video className="w-16 h-16 mx-auto mb-4 opacity-80" />
                   <p className="text-lg font-medium opacity-90">Transform this photo into video</p>
                </div>
              </>
            )}

            {isVideoGenerating && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-20">
                <div className="text-center px-4">
                  <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-4" />
                  <h4 className="text-white font-bold text-lg mb-1">Generating Video with Veo</h4>
                  <p className="text-purple-200 text-sm">This may take a moment...</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
             <input 
              type="text" 
              placeholder="Describe the video movement..."
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
              className="flex-1 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <button 
              onClick={handleGenerateVideo}
              disabled={isVideoGenerating}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              Animate
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            * Requires a paid Google Cloud Project connected to AI Studio.
          </p>
        </div>
      )}
    </div>
  );
};

export default GeminiTools;
