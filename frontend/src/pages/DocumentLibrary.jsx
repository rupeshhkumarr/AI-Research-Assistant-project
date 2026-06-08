import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { getDocuments, deleteDocument } from '../services/documentService';
import { useAppContext } from '../context/AppContext';
import { Trash2, Search, FileText, Database } from 'lucide-react';
import { Skeleton } from '../components/common/Skeleton';

export default function DocumentLibrary() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [docToDelete, setDocToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { addToast } = useAppContext();

  const fetchDocs = async () => {
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (err) {
      if (err.response && err.response.status !== 404) {
        addToast('Failed to load documents', 'error');
      }
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleDelete = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDocument(docToDelete.id);
      addToast('Document deleted successfully', 'success');
      setDocToDelete(null);
      fetchDocs();
    } catch (err) {
      addToast('Failed to delete document', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDocs = documents.filter((doc) =>
    doc.filename?.toLowerCase().includes(search.toLowerCase())
  );

  const formatBytes = (bytes) => {
    const num = Number(bytes);
    if (!Number.isFinite(num) || num === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(num) / Math.log(k));
    if (i < 0) return '0 B';
    return parseFloat((num / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-text-main">Library</h2>
          <p className="text-text-muted">Manage the documents indexed in your knowledge base.</p>
        </div>
        <div className="relative w-full md:w-80 group">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-500 transition-colors" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..." 
            className="pl-11 bg-bg-card border-border shadow-sm focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 transition-all rounded-xl" 
          />
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-border/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-bg-hover/50">
              <tr className="border-b border-border/60 text-text-muted text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">File Name</th>
                <th className="px-6 py-4 font-semibold">Upload Date</th>
                <th className="px-6 py-4 font-semibold">Size</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/40">
                    <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-6 py-4 flex justify-end"><Skeleton className="h-8 w-8 rounded-lg" /></td>
                  </tr>
                ))
              ) : filteredDocs.length > 0 ? (
                filteredDocs.map((doc, i) => (
                  <tr key={doc.id || i} className="border-b border-border/40 last:border-0 hover:bg-bg-hover/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-bg-hover flex items-center justify-center shrink-0 group-hover:bg-primary-500/10 transition-colors border border-border/50">
                          <FileText size={18} className="text-text-muted group-hover:text-primary-500 transition-colors" />
                        </div>
                        <span className="text-text-main font-medium">{doc.filename}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-muted font-mono text-xs">
                      {doc.upload_date ? new Date(doc.upload_date).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-text-muted">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-bg-card rounded-md text-xs font-mono border border-border/60 shadow-sm text-text-muted">
                          {formatBytes(doc.file_size)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setDocToDelete(doc)}
                        className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        title="Delete Document"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-bg-hover flex items-center justify-center mb-4 text-text-muted shadow-inner">
                        <Database size={32} />
                      </div>
                      <h3 className="text-lg font-semibold text-text-main mb-1">No documents found</h3>
                      <p className="text-text-muted text-sm max-w-sm">
                        {search ? "We couldn't find any documents matching your search. Try different keywords." : "You haven't uploaded any documents yet. Go to the Upload page to add some."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal 
        isOpen={!!docToDelete} 
        onClose={() => !isDeleting && setDocToDelete(null)}
        title="Delete Document"
      >
        <p className="text-text-main mb-6">
          Are you sure you want to delete <strong className="text-primary-500">{docToDelete?.filename}</strong>? This action cannot be undone and it will be removed from the AI's knowledge base.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDocToDelete(null)} disabled={isDeleting} className="rounded-xl">Cancel</Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isDeleting} className="rounded-xl">Delete File</Button>
        </div>
      </Modal>
    </div>
  );
}
