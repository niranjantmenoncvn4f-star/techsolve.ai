
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Category, Message, DiagnosticState, GroundingChunk } from './types';
import { GeminiService } from './services/geminiService';
import TerminalOutput from './components/TerminalOutput';
import MarkdownRenderer from './components/MarkdownRenderer';

const CATEGORIES: { id: Category; label: string; icon: string; description: string }[] = [
  { id: 'hardware', label: 'Hardware', icon: '🔌', description: 'PC components, peripherals, mobile devices' },
  { id: 'software', label: 'Software', icon: '💿', description: 'OS issues, driver errors, crashes' },
  { id: 'ai', label: 'AI & ML', icon: '🧠', description: 'Model training, API integration, GPU setup' },
  { id: 'networking', label: 'Networking', icon: '🌐', description: 'WiFi, DNS, routers, latency issues' },
];

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('hardware');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [image, setImage] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState<DiagnosticState>({
    isAnalyzing: false,
    progress: 0,
    status: ''
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const geminiRef = useRef<GeminiService | null>(null);

  useEffect(() => {
    geminiRef.current = new GeminiService();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, diagnostic.isAnalyzing]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !image) return;
    if (!geminiRef.current) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
      image: image || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setImage(null);
    setDiagnostic({ isAnalyzing: true, progress: 0, status: 'Initializing diagnostic sequence...' });

    try {
      // Simulate status updates for UX
      const statusUpdates = [
        "Scanning knowledge base...",
        "Analyzing visual telemetry...",
        "Cross-referencing technical manuals...",
        "Simulating failure scenarios...",
        "Formulating remediation steps..."
      ];

      for (let i = 0; i < statusUpdates.length; i++) {
        setTimeout(() => {
          setDiagnostic(prev => ({ 
            ...prev, 
            status: statusUpdates[i], 
            progress: (i + 1) * 20 
          }));
        }, i * 800);
      }

      const response = await geminiRef.current.troubleshoot(
        messages,
        userMsg.content,
        userMsg.image,
        selectedCategory
      );

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
        groundingLinks: response.groundingLinks
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Error connecting to the diagnostic core. Please ensure your API key is valid and try again.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setDiagnostic({ isAnalyzing: false, progress: 0, status: '' });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 border-r border-slate-800 bg-slate-900/50 flex flex-col overflow-hidden`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">TechSolve AI</h1>
          <p className="text-slate-400 text-xs">Diagnostic Core v2.4.0</p>
        </div>

        <nav className="flex-1 px-4 space-y-4 overflow-y-auto">
          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Problem Domain</h2>
            <div className="space-y-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all ${
                    selectedCategory === cat.id 
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <div className="text-left">
                    <div className="font-medium text-sm">{cat.label}</div>
                    <div className="text-[10px] opacity-60 leading-tight">{cat.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Recent Logs</h2>
            {messages.length === 0 ? (
              <p className="px-2 text-xs text-slate-600 italic">No diagnostic history yet.</p>
            ) : (
              <div className="space-y-2">
                {messages.filter(m => m.role === 'user').slice(-5).map(m => (
                  <div key={m.id} className="p-2 text-xs text-slate-400 truncate hover:text-slate-200 cursor-pointer">
                    • {m.content || "Image Scan"}
                  </div>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="p-4 bg-slate-900/80">
          <div className="flex items-center gap-3 text-emerald-400 text-xs font-mono">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            SYSTEM READY
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative bg-slate-950">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="={isSidebarOpen ? 'M4 6h16M4 12h16M4 18h16' : 'M4 6h16M4 12h8m-8 6h16'}" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Domain:</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded text-xs font-mono text-blue-400">{selectedCategory.toUpperCase()}</span>
            </div>
          </div>
          <div className="flex gap-4">
             <button onClick={() => setMessages([])} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Clear Console</button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
          {messages.length === 0 && !diagnostic.isAnalyzing && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6">
              <div className="w-24 h-24 bg-blue-600/10 rounded-full flex items-center justify-center border border-blue-500/20">
                 <span className="text-5xl">🛠️</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Initialize Troubleshooting</h3>
                <p className="text-slate-400 leading-relaxed">
                  Welcome to the TechSolve AI Command Center. Describe your technical issue or upload a photo of the error. 
                  Select a domain from the sidebar for specialized diagnostics.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                {['Blue screen of death on startup', 'CUDA error during training', 'Packet loss on specific VLAN', 'Broken mechanical switch'].map(prompt => (
                  <button 
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-400 hover:border-blue-500/50 hover:text-blue-300 transition-all text-left"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4`}>
              <div className={`max-w-[85%] lg:max-w-[70%] ${m.role === 'user' ? 'order-2' : ''}`}>
                <div className={`p-5 rounded-2xl ${
                  m.role === 'user' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'bg-slate-900 border border-slate-800'
                }`}>
                  {m.image && (
                    <img src={m.image} alt="Diagnostic Input" className="mb-4 rounded-lg border border-white/10 max-h-96 object-contain bg-black" />
                  )}
                  {m.role === 'user' ? (
                    <p className="text-white whitespace-pre-wrap">{m.content}</p>
                  ) : (
                    <MarkdownRenderer content={m.content} />
                  )}

                  {m.groundingLinks && m.groundingLinks.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase">Verification Sources:</p>
                      <div className="flex flex-wrap gap-2">
                        {m.groundingLinks.map((link, idx) => (
                          link.web && (
                            <a 
                              key={idx} 
                              href={link.web.uri} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-md text-blue-400 flex items-center gap-1 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                              {link.web.title}
                            </a>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className={`mt-2 text-[10px] text-slate-600 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {new Date(m.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {diagnostic.isAnalyzing && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <TerminalOutput status={diagnostic.status} isActive={diagnostic.isAnalyzing} />
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800 max-w-xs">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-500" 
                      style={{ width: `${diagnostic.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs font-mono text-slate-500 animate-pulse uppercase tracking-widest">
                    Analyzing... {diagnostic.progress}%
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-6 bg-slate-950 border-t border-slate-800">
          <div className="max-w-4xl mx-auto space-y-4">
            {image && (
              <div className="flex items-center gap-4 bg-slate-900 p-2 rounded-lg border border-slate-800">
                <img src={image} alt="Thumbnail" className="w-12 h-12 rounded object-cover border border-slate-700" />
                <div className="flex-1 text-xs text-slate-400 truncate">Image attached for visual diagnostic</div>
                <button onClick={() => setImage(null)} className="p-1 hover:text-red-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}
            
            <div className="flex gap-4 items-end bg-slate-900 p-2 pl-4 rounded-2xl border border-slate-800 shadow-2xl ring-1 ring-white/5 focus-within:ring-blue-500/50 transition-all">
              <div className="flex-1 flex flex-col min-h-[44px]">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={`Describe your ${selectedCategory} issue...`}
                  className="w-full bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-500 py-2 resize-none max-h-40 min-h-[44px]"
                  rows={1}
                />
              </div>

              <div className="flex items-center gap-2 pb-1">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-xl transition-all"
                  title="Upload Image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>

                <button
                  onClick={handleSend}
                  disabled={diagnostic.isAnalyzing || (!input.trim() && !image)}
                  className={`p-2.5 rounded-xl transition-all ${
                    diagnostic.isAnalyzing || (!input.trim() && !image)
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-[10px] text-center text-slate-600 uppercase tracking-widest font-mono">
              Always verify voltage readings before touching internal hardware components.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
