import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { getDocuments, deleteDocument } from '../services/documentService';
import { useAppContext } from '../context/AppContext';
import { Trash2, Search, FileText } from 'lucide-react';
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
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-main mb-1">Document Library</h2>
          <p className="text-text-muted">Manage your indexed files.</p>
        </div>
        <div className="relative w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..." 
            className="pl-10 bg-bg-card" 
          />
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-bg-hover">
              <tr className="border-b border-border text-text-muted text-sm">
                <th className="px-6 py-4 font-medium">File Name</th>
                <th className="px-6 py-4 font-medium">Upload Date/Time</th>
                <th className="px-6 py-4 font-medium">Size</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-8 rounded-lg float-right" /></td>
                  </tr>
                ))
              ) : filteredDocs.length > 0 ? (
                filteredDocs.map((doc, i) => (
                  <tr key={doc.id || i} className="border-b border-border/50 last:border-0 hover:bg-bg-hover/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-bg-hover flex items-center justify-center shrink-0">
                          <FileText size={16} className="text-primary-500" />
                        </div>
                        <span className="text-text-main font-medium">{doc.filename}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-muted">{doc.upload_date ? new Date(doc.upload_date).toLocaleString() : 'N/A'}</td>
                    <td className="px-6 py-4 text-text-muted">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-bg-card rounded text-xs text-text-muted font-medium border border-border">
                          {formatBytes(doc.file_size)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setDocToDelete(doc)}
                        className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-text-muted">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-bg-hover flex items-center justify-center mb-4 text-text-muted">
                        <FileText size={32} />
                      </div>
                      <h3 className="text-lg font-medium text-text-main mb-1">No documents found</h3>
                      <p className="text-text-muted mb-6">
                        {search ? "We couldn't find any documents matching your search." : "You haven't uploaded any documents yet."}
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
        <p className="text-gray-300 mb-6">
          Are you sure you want to delete <strong>{docToDelete?.filename}</strong>? This action cannot be undone and it will be removed from the AI's knowledge base.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDocToDelete(null)} disabled={isDeleting}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>Delete File</Button>
        </div>
      </Modal>
    </div>
  );
}
