import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { UploadDropzone } from '../components/upload/UploadDropzone';
import { useAppContext } from '../context/AppContext';
import { uploadDocuments } from '../services/uploadService';
import { getDocuments } from '../services/documentService';
import { FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Skeleton } from '../components/common/Skeleton';

export default function Upload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [recentDocs, setRecentDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const { addToast } = useAppContext();

  const fetchDocs = async () => {
    try {
      const data = await getDocuments();
      // Assume API returns array of docs, limit to 5 recent
      setRecentDocs(data.slice(0, 5));
    } catch (err) {
      if (err.response && err.response.status !== 404) {
        addToast('Failed to load recent documents', 'error');
      }
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (files) => {
    setIsUploading(true);
    setProgress(0);
    try {
      await uploadDocuments(files, (percent) => setProgress(percent));
      addToast('Documents uploaded and processed successfully!', 'success');
      fetchDocs();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Upload failed', 'error');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const formatSize = (bytes) => {
    const num = Number(bytes);
    if (!Number.isFinite(num) || num === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(num) / Math.log(k));
    if (i < 0) return '0 B';
    return parseFloat((num / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <Card>
        <h2 className="text-xl font-semibold text-text-main mb-2">Upload Documents</h2>
        <p className="text-text-muted mb-6">Upload PDFs, text, or word documents to be indexed for RAG.</p>
        
        <UploadDropzone onUpload={handleUpload} isUploading={isUploading} progress={progress} />
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-text-main mb-6">Recent Uploads</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-text-muted text-sm">
                <th className="pb-3 font-medium">File Name</th>
                <th className="pb-3 font-medium">Size</th>
                <th className="pb-3 font-medium">Upload Date/Time</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loadingDocs ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-4"><Skeleton className="h-4 w-48" /></td>
                    <td className="py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-4"><Skeleton className="h-4 w-20" /></td>
                  </tr>
                ))
              ) : recentDocs.length > 0 ? (
                recentDocs.map((doc, i) => (
                  <tr key={doc.id || i} className="border-b border-border/50 last:border-0 hover:bg-bg-hover/50 transition-colors">
                    <td className="py-4 flex items-center gap-3">
                      <FileText size={16} className="text-text-muted" />
                      <span className="text-text-main font-medium">{doc.filename}</span>
                    </td>
                    <td className="py-4 text-text-muted">{formatSize(doc.file_size)}</td>
                    <td className="py-4 text-text-muted">{doc.upload_date ? new Date(doc.upload_date).toLocaleString() : 'Just now'}</td>
                    <td className="py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                        <CheckCircle2 size={12} /> Processed
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-text-muted">
                    No documents uploaded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
