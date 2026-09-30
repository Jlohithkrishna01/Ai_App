import React from 'react';
import { FileText, Image as ImageIcon, FileSpreadsheet, FileCode, X, Loader2 } from 'lucide-react';
import { UploadedFileInfo } from '../../types';

interface FilePreviewChipProps {
  fileInfo: UploadedFileInfo | null;
  isLoading?: boolean;
  onRemove?: () => void;
  className?: string;
}

export const FilePreviewChip: React.FC<FilePreviewChipProps> = ({
  fileInfo,
  isLoading = false,
  onRemove,
  className = '',
}) => {
  if (!fileInfo && !isLoading) return null;

  const getIcon = (type?: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('pdf')) return <FileText className="w-4 h-4 text-rose-500" />;
    if (t.includes('doc')) return <FileText className="w-4 h-4 text-blue-500" />;
    if (t.includes('csv') || t.includes('xls')) return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
    if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(t)) return <ImageIcon className="w-4 h-4 text-purple-500" />;
    return <FileCode className="w-4 h-4 text-amber-500" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-100 dark:bg-dark-card text-xs text-gray-800 dark:text-gray-200 shadow-sm animate-in fade-in duration-150 ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
      ) : (
        getIcon(fileInfo?.file_type)
      )}

      <div className="flex flex-col max-w-[180px] sm:max-w-[240px]">
        <span className="font-medium truncate">{fileInfo?.file_name || 'Uploading file...'}</span>
        {fileInfo?.file_size ? (
          <span className="text-[10px] text-gray-400">{formatSize(fileInfo.file_size)}</span>
        ) : null}
      </div>

      {onRemove && !isLoading && (
        <button
          onClick={onRemove}
          type="button"
          className="ml-1 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          title="Remove file"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
