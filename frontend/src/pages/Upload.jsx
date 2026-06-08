import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { UploadDropzone } from '../components/upload/UploadDropzone';
import { useAppContext } from '../context/AppContext';
import { uploadDocuments } from '../services/uploadService';
import { getDocuments } from '../services/documentService';
import { FileText, CheckCircle2, Clock } from 'lucide-react';
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
    <div className="flex flex-col gap-6 md:gap-8 max-w-5xl mx-auto pb-10">
      
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-text-main">Knowledge Base</h2>
        <p className="text-text-muted">Upload and manage documents to empower your AI assistant.</p>
      </div>

      <Card hoverable className="border-primary-500/10">
        <UploadDropzone onUpload={handleUpload} isUploading={isUploading} progress={progress} />
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-main flex items-center gap-2">
            <Clock size={18} className="text-primary-500" />
            Recently Uploaded
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 text-text-muted text-xs uppercase tracking-wider">
                <th className="pb-3 font-semibold pl-2">File Name</th>
                <th className="pb-3 font-semibold">Size</th>
                <th className="pb-3 font-semibold">Upload Date</th>
                <th className="pb-3 font-semibold pr-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loadingDocs ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/40">
                    <td className="py-4 pl-2"><Skeleton className="h-4 w-48" /></td>
                    <td className="py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-4 pr-2 flex justify-end"><Skeleton className="h-6 w-20 rounded-full" /></td>
                  </tr>
                ))
              ) : recentDocs.length > 0 ? (
                recentDocs.map((doc, i) => (
                  <tr key={doc.id || i} className="border-b border-border/40 last:border-0 hover:bg-bg-hover/40 transition-colors group">
                    <td className="py-4 pl-2 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-bg-hover flex items-center justify-center shrink-0 group-hover:bg-primary-500/10 transition-colors">
                        <FileText size={16} className="text-text-muted group-hover:text-primary-500 transition-colors" />
                      </div>
                      <span className="text-text-main font-medium">{doc.filename}</span>
                    </td>
                    <td className="py-4 text-text-muted">{formatSize(doc.file_size)}</td>
                    <td className="py-4 text-text-muted font-mono text-xs">{doc.upload_date ? new Date(doc.upload_date).toLocaleDateString() : 'Today'}</td>
                    <td className="py-4 pr-2 text-right">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-500">
                        <CheckCircle2 size={12} strokeWidth={3} /> Ready
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-bg-hover flex items-center justify-center mb-3 text-text-muted">
                        <FileText size={24} />
                      </div>
                      <p className="text-text-main font-medium text-sm">No recent uploads</p>
                      <p className="text-text-muted text-xs mt-1">Upload a document to get started.</p>
                    </div>
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
