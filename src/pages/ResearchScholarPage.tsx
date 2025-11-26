import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  BookOpen, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  Users, 
  Quote,
  X,
  ChevronDown,
  Loader2,
  GraduationCap,
  Link as LinkIcon,
  Download
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { 
  searchGoogleScholar, 
  generateAPACitation, 
  generateMLACitation, 
  generateChicagoCitation,
  ScholarResult 
} from '../lib/scholarApi';
import toast from 'react-hot-toast';

type CitationStyle = 'APA' | 'MLA' | 'Chicago';

const ResearchScholarPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ScholarResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [citationStyle, setCitationStyle] = useState<CitationStyle>('APA');
  const [expandedResult, setExpandedResult] = useState<string | null>(null);

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    
    try {
      const response = await searchGoogleScholar(query);
      setResults(response.organic_results || []);
      if (response.organic_results?.length === 0) {
        toast.error('No results found. Try different keywords.');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const getCitation = (result: ScholarResult, style: CitationStyle): string => {
    switch (style) {
      case 'APA':
        return generateAPACitation(result);
      case 'MLA':
        return generateMLACitation(result);
      case 'Chicago':
        return generateChicagoCitation(result);
      default:
        return generateAPACitation(result);
    }
  };

  const copyToClipboard = async (result: ScholarResult) => {
    const citation = getCitation(result, citationStyle);
    try {
      await navigator.clipboard.writeText(citation);
      setCopiedId(result.result_id);
      toast.success(`${citationStyle} citation copied!`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error('Failed to copy citation');
    }
  };

  const getPdfLink = (result: ScholarResult): string | null => {
    if (result.resources && result.resources.length > 0) {
      const pdfResource = result.resources.find(
        r => r.file_format?.toLowerCase() === 'pdf' || r.link?.toLowerCase().endsWith('.pdf')
      );
      return pdfResource?.link || null;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-mono relative overflow-hidden selection:bg-cyan-500/30">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}>
      </div>
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-10"></div>

      <Navbar />
      
      <div className="flex h-screen relative z-10">
        <div className="hidden md:block h-full">
          <Sidebar />
        </div>
        
        <main className="flex-1 overflow-y-auto p-6 pt-24">
          <div className="max-w-6xl mx-auto pb-20">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 border-b border-slate-800 pb-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-purple-500 uppercase tracking-widest">ACADEMIC_DATABASE</span>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <GraduationCap className="w-8 h-8 text-purple-400" />
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tighter uppercase glitch-text" data-text="RESEARCH_SCHOLAR">
                  RESEARCH_SCHOLAR
                </h1>
              </div>
              <p className="text-slate-400 text-sm max-w-2xl">
                Search Google Scholar for academic papers, get citations in multiple formats, and access research materials securely.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSearch}
              className="mb-8 flex flex-col md:flex-row gap-4"
            >
              <div className="flex-1 flex items-center bg-slate-950 border border-cyan-900/50 focus-within:border-cyan-500 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300 p-2 relative group">
                <div className="pl-4 pr-2 text-cyan-500 font-mono font-bold select-none text-lg group-focus-within:text-cyan-400 transition-colors">
                  {'>'}
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ENTER_SEARCH_QUERY..."
                  className="w-full py-3 bg-transparent border-none text-cyan-400 placeholder-cyan-900/50 focus:outline-none focus:ring-0 font-mono tracking-wider text-lg"
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-8 py-4 md:py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-700 disabled:cursor-not-allowed text-white font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] min-w-[160px]"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                EXECUTE
              </button>
            </motion.form>

            {/* Citation Style Selector */}
            {results.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 flex items-center gap-4"
              >
                <span className="text-xs text-slate-500 uppercase tracking-wider">Citation Style:</span>
                <div className="flex gap-2">
                  {(['APA', 'MLA', 'Chicago'] as CitationStyle[]).map((style) => (
                    <button
                      key={style}
                      onClick={() => setCitationStyle(style)}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border ${
                        citationStyle === style
                          ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-[0_0_10px_rgba(147,51,234,0.2)]'
                          : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-purple-500/50 hover:text-purple-300'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Results */}
            <div className="space-y-4">
              {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                  <p className="text-slate-400 text-sm uppercase tracking-wider">Searching Google Scholar...</p>
                </div>
              )}

              {!loading && searched && results.length === 0 && (
                <div className="text-center py-20 border border-dashed border-slate-800">
                  <BookOpen className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500">No results found. Try different search terms.</p>
                </div>
              )}

              {!loading && !searched && (
                <div className="text-center py-20 border border-dashed border-slate-800">
                  <Search className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500">Enter a search query to find research papers</p>
                  <p className="text-slate-600 text-sm mt-2">
                    Example: "machine learning neural networks", "climate change impact"
                  </p>
                </div>
              )}

              <AnimatePresence>
                {results.map((result, index) => {
                  const pdfLink = getPdfLink(result);
                  const isExpanded = expandedResult === result.result_id;
                  
                  return (
                    <motion.div
                      key={result.result_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 transition-all group relative overflow-hidden"
                    >
                      {/* Corner Accents */}
                      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Hover background effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                      <div className="p-6 relative z-10">
                        {/* Title and PDF badge */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors flex-1">
                            <a 
                              href={result.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {result.title}
                            </a>
                          </h3>
                          {pdfLink && (
                            <span className="flex-shrink-0 px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold uppercase">
                              PDF
                            </span>
                          )}
                        </div>

                        {/* Publication info */}
                        <p className="text-sm text-slate-400 mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-500" />
                          {result.publication_info?.summary || 'Unknown source'}
                        </p>

                        {/* Snippet */}
                        <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                          {result.snippet}
                        </p>

                        {/* Citations and Versions */}
                        <div className="flex items-center gap-4 mb-4 text-xs text-slate-500">
                          {result.inline_links?.cited_by && (
                            <a 
                              href={result.inline_links.cited_by.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-purple-400 transition-colors"
                            >
                              <Quote className="w-3 h-3" />
                              Cited by {result.inline_links.cited_by.total}
                            </a>
                          )}
                          {result.inline_links?.versions && (
                            <a 
                              href={result.inline_links.versions.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-purple-400 transition-colors"
                            >
                              <FileText className="w-3 h-3" />
                              {result.inline_links.versions.total} versions
                            </a>
                          )}
                        </div>

                        {/* Citation Preview */}
                        <div 
                          className="bg-slate-950 border border-slate-800 p-4 mb-4 cursor-pointer"
                          onClick={() => setExpandedResult(isExpanded ? null : result.result_id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-purple-400 uppercase tracking-wider">
                              {citationStyle} Citation
                            </span>
                            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                          <p className={`text-sm text-slate-300 font-mono ${isExpanded ? '' : 'line-clamp-2'}`}>
                            {getCitation(result, citationStyle)}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => copyToClipboard(result)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition-all"
                          >
                            {copiedId === result.result_id ? (
                              <>
                                <Check className="w-4 h-4" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                Copy {citationStyle}
                              </>
                            )}
                          </button>

                          <a
                            href={result.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider transition-all"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View Source
                          </a>

                          {pdfLink && (
                            <>
                              <button
                                onClick={() => setSelectedPdf(pdfLink)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-bold uppercase tracking-wider transition-all border border-red-500/30"
                              >
                                <FileText className="w-4 h-4" />
                                View PDF
                              </button>
                              <a
                                href={pdfLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider transition-all"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      {/* PDF Viewer Modal */}
      <AnimatePresence>
        {selectedPdf && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedPdf(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-6xl h-[90vh] bg-slate-900 border border-slate-700 overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-red-400" />
                  <span className="text-sm text-slate-300 font-mono truncate max-w-md">
                    {selectedPdf}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={selectedPdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => setSelectedPdf(null)}
                    className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* PDF Embed */}
              <div className="flex-1 bg-slate-950">
                <iframe
                  src={`${selectedPdf}#toolbar=1&navpanes=0`}
                  className="w-full h-full"
                  title="PDF Viewer"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResearchScholarPage;
