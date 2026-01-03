
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Very basic markdown parser for demonstration
  // In a real app, use react-markdown
  const lines = content.split('\n');
  
  return (
    <div className="prose prose-invert max-w-none space-y-2">
      {lines.map((line, i) => {
        if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold mt-4 mb-2 text-blue-300">{line.replace('### ', '')}</h3>;
        if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mt-6 mb-3 text-blue-400 border-b border-slate-700 pb-1">{line.replace('## ', '')}</h2>;
        if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold mt-8 mb-4 text-white">{line.replace('# ', '')}</h1>;
        if (line.match(/^\d+\.\s/)) return <div key={i} className="ml-4 flex gap-2"><span className="text-blue-400 font-bold">{line.split('.')[0]}.</span><span>{line.split('.').slice(1).join('.').trim()}</span></div>;
        if (line.startsWith('- ') || line.startsWith('* ')) return <div key={i} className="ml-6 flex gap-2"><span className="text-blue-400">•</span><span>{line.substring(2)}</span></div>;
        if (line.startsWith('`') && line.endsWith('`')) return <pre key={i} className="bg-slate-900 p-2 rounded font-mono text-sm border border-slate-700 overflow-x-auto my-2 text-green-300">{line.replace(/`/g, '')}</pre>;
        return <p key={i} className="text-slate-300 leading-relaxed">{line}</p>;
      })}
    </div>
  );
};

export default MarkdownRenderer;
