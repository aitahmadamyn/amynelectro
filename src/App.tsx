import React, { useState, useEffect } from 'react';
import { Folder, FileText, FileCode, ChevronRight, ChevronDown, Github, Cpu, Zap, Droplets, Activity } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion } from 'framer-motion';

type FileNode = {
  path: string;
  name: string;
  type: 'file' | 'directory';
  parent?: string;
};

export default function App() {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>('/README.md');
  const [fileContent, setFileContent] = useState<string>('');
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['/docs', '/hardware', '/software']));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/files')
      .then(res => res.json())
      .then(data => {
        setFiles(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch files", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedFile) {
      fetch(`/api/file?path=${encodeURIComponent(selectedFile)}`)
        .then(res => res.text())
        .then(text => setFileContent(text))
        .catch(err => console.error("Failed to fetch file content", err));
    }
  }, [selectedFile]);

  const toggleDir = (dirPath: string) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(dirPath)) {
      newExpanded.delete(dirPath);
    } else {
      newExpanded.add(dirPath);
    }
    setExpandedDirs(newExpanded);
  };

  const renderTree = (parentPath?: string) => {
    const nodes = files.filter(f => f.parent === parentPath);
    return nodes.map(node => {
      if (node.type === 'directory') {
        const isExpanded = expandedDirs.has(node.path);
        return (
          <div key={node.path} className="ml-4">
            <div 
              className="flex items-center gap-2 py-1.5 px-2 hover:bg-zinc-800/50 rounded-md cursor-pointer text-zinc-300 hover:text-white transition-colors"
              onClick={() => toggleDir(node.path)}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <Folder size={16} className="text-blue-400" />
              <span className="text-sm font-medium">{node.name}</span>
            </div>
            {isExpanded && renderTree(node.path)}
          </div>
        );
      } else {
        const isSelected = selectedFile === node.path;
        const isCode = node.name.endsWith('.ino');
        return (
          <div 
            key={node.path} 
            className={`ml-8 flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200'}`}
            onClick={() => setSelectedFile(node.path)}
          >
            {isCode ? <FileCode size={16} className={isSelected ? "text-blue-400" : "text-emerald-400"} /> : <FileText size={16} className={isSelected ? "text-blue-400" : "text-zinc-500"} />}
            <span className="text-sm">{node.name}</span>
          </div>
        );
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-zinc-200 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-[#161b22] border-b border-zinc-800 py-4 px-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
            <Cpu className="text-blue-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight">SmartNexus-MA</h1>
            <p className="text-xs text-zinc-400 font-medium">Smart Solar Irrigation Prototype</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800">
            <Zap size={14} className="text-yellow-400" /> Solar Powered
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800">
            <Droplets size={14} className="text-blue-400" /> Smart Irrigation
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800">
            <Activity size={14} className="text-emerald-400" /> ESP32 Control
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 bg-[#0d1117] border-r border-zinc-800 flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Github size={14} /> Repository Files
            </h2>
            {loading ? (
              <div className="animate-pulse flex flex-col gap-2 mt-4">
                <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
                <div className="h-4 bg-zinc-800 rounded w-1/2 ml-4"></div>
                <div className="h-4 bg-zinc-800 rounded w-2/3 ml-4"></div>
              </div>
            ) : (
              <div className="-ml-4">
                {renderTree(undefined)}
              </div>
            )}
          </div>
          <div className="p-4 mt-auto">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-blue-400 mb-1">System Status</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                This repository contains the complete electronic architecture, BOM, wiring diagrams, and ESP32 code for the SmartNexus-MA prototype.
              </p>
            </div>
          </div>
        </div>

        {/* File Viewer */}
        <div className="flex-1 flex flex-col bg-[#0d1117] overflow-hidden">
          {selectedFile ? (
            <>
              <div className="bg-[#161b22] border-b border-zinc-800 py-2 px-4 flex items-center gap-2">
                {selectedFile.endsWith('.ino') ? <FileCode size={16} className="text-emerald-400" /> : <FileText size={16} className="text-zinc-400" />}
                <span className="text-sm font-mono text-zinc-300">{selectedFile.replace(/^\//, '')}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-8">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={selectedFile}
                  className="max-w-4xl mx-auto bg-[#0d1117]"
                >
                  {selectedFile.endsWith('.ino') ? (
                    <pre className="bg-[#161b22] p-6 rounded-xl border border-zinc-800 overflow-x-auto">
                      <code className="text-sm font-mono text-emerald-300 leading-relaxed">
                        {fileContent}
                      </code>
                    </pre>
                  ) : (
                    <div className="prose prose-invert prose-blue max-w-none prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h2:border-b prose-h2:border-zinc-800 prose-h2:pb-2 prose-a:text-blue-400 prose-code:text-emerald-300 prose-code:bg-zinc-800/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-pre:bg-[#161b22] prose-pre:border prose-pre:border-zinc-800 prose-th:bg-zinc-800/50 prose-th:p-3 prose-td:p-3 prose-td:border-t prose-td:border-zinc-800">
                      <Markdown>{fileContent}</Markdown>
                    </div>
                  )}
                </motion.div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-500 flex-col gap-4">
              <Github size={48} className="opacity-20" />
              <p>Select a file to view its contents</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
