// /components/interview/InterviewArtifacts.tsx
'use client';

import { useState, useRef } from 'react';
import {
  InterviewArtifact,
} from '@/lib/api/projectApplications';
import {
  uploadInterviewArtifact,
  detachArtifact,
} from '@/lib/api/artifacts';

// ─────────────────────────────────────────────
// Иконка файла (по типу артефакта)
// ─────────────────────────────────────────────
function ArtifactIcon({ type, name }: { type: string; name: string }) {
  const lowerName = name.toLowerCase();

  if (lowerName.endsWith('.pdf') || type.toLowerCase().includes('pdf')) {
    return (
      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  }
  if (['.doc', '.docx'].some(ext => lowerName.endsWith(ext)) || type.toLowerCase().includes('word')) {
    return (
      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  }
  if (['.xls', '.xlsx', '.csv'].some(ext => lowerName.endsWith(ext)) || type.toLowerCase().includes('excel')) {
    return (
      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  }
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].some(ext => lowerName.endsWith(ext)) || type.toLowerCase().includes('image')) {
    return (
      <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  }

  return (
    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

// ─────────────────────────────────────────────
// Карточка одного артефакта
// ─────────────────────────────────────────────
interface ArtifactCardProps {
  artifact: InterviewArtifact;
  interviewId: string;
  onDetach: (artifactId: string) => Promise<void>;
  isDetaching?: boolean;
}

function ArtifactCard({ artifact, interviewId, onDetach, isDetaching }: ArtifactCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (artifact.url) {
      e.preventDefault();
      window.open(artifact.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <li
      className="p-3 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 p-2 bg-gray-100 rounded-lg">
          <ArtifactIcon type={artifact.type} name={artifact.name} />
        </div>

        <div className="flex-1 min-w-0">
          <h5
            className="font-medium text-[#000150] truncate text-[14px]"
            title={artifact.name}
          >
            {artifact.name}
          </h5>
          {artifact.description && (
            <p className="text-[12px] text-gray-500 truncate mt-0.5">
              {artifact.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1 text-[12px] text-gray-400">
            <span>{artifact.type}</span>
            {artifact.created_at && (
              <>
                <span>•</span>
                <span>{new Date(artifact.created_at).toLocaleDateString('ru-RU')}</span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDetach(artifact.id);
          }}
          disabled={isDetaching}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Открепить артефакт"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </li>
  );
}

// ─────────────────────────────────────────────
// Основной компонент секции артефактов
// ─────────────────────────────────────────────
interface InterviewArtifactsProps {
  interviewId: string;
  artifacts: InterviewArtifact[];
  onArtifactsChange: () => Promise<void>;
}

export default function InterviewArtifacts({
  interviewId,
  artifacts = [],
  onArtifactsChange,
}: InterviewArtifactsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [detachingId, setDetachingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      await uploadInterviewArtifact(interviewId, file);
      await onArtifactsChange();
      if (fileInputRef.current) fileInputRef.current.value = '';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Artifact upload error:', err);
      setError(err.message || 'Ошибка при загрузке файла');
    } finally {
      setUploading(false);
    }
  };

  const handleDetach = async (artifactId: string) => {
    try {
      setDetachingId(artifactId);
      setError(null);
      await detachArtifact(artifactId, 'INTERVIEW', interviewId);
      await onArtifactsChange();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Artifact detach error:', err);
      setError(err.message || 'Ошибка при откреплении артефакта');
    } finally {
      setDetachingId(null);
    }
  };

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[15px] font-semibold text-[#000150]">
          Артефакты собеседования
        </h4>
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.gif,.webp,.txt,.zip,.rar"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-3 py-1 bg-[#000150] text-white rounded-lg hover:bg-[#000150]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-[13px]"
            title="Загрузить файл"
          >
            {uploading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
            Файл
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-2 p-2 bg-red-50 text-red-700 rounded-lg text-[13px]">
          {error}
        </div>
      )}

      {Array.isArray(artifacts) && artifacts.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {artifacts.map((artifact) => (
            <ArtifactCard
              key={artifact.id}
              artifact={artifact}
              interviewId={interviewId}
              onDetach={handleDetach}
              isDetaching={detachingId === artifact.id}
            />
          ))}
        </ul>
      ) : (
        <div className="text-[13px] text-[#000150]/50 py-2">
          Артефакты не прикреплены
        </div>
      )}
    </div>
  );
}