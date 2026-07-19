/**
 * ============================================================================
 * AI TASK INPUT COMPONENT
 * ============================================================================
 * Component cho phép người dùng nhập mô tả công việc bằng ngôn ngữ tự nhiên
 * và sử dụng AI để parse thành dữ liệu task có cấu trúc.
 * 
 * Features:
 * - Input field cho natural language (Avionics style)
 * - Button "Phân tích bằng AI" (Contrast adjusted)
 * - Show dateText/timeText + resolved deadline
 * - Callback onParsed để fill form
 * ============================================================================
 */

import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useI18n } from '../../utils/i18n';

// Extract all URLs to push into notes so links aren't lost
const extractUrls = (text) => {
  if (!text) return [];
  const matches = text.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/gi);
  return matches || [];
};

export const AITaskInput = ({ onParsed, onError }) => {
  const { t, locale } = useI18n();
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [parseResult, setParseResult] = useState(null);

  const handleParse = async () => {
    if (!text || text.trim().length === 0) {
      setError(t('tasks.aiInput.errorEmpty'));
      return;
    }

    if (text.length > 500) {
      setError(t('tasks.aiInput.errorTooLong'));
      return;
    }

    setError(null);
    setSuccess(false);
    setParseResult(null);
    setIsLoading(true);

    try {
      const response = await api.post('/tasks/ai-parse', { text });

      if (response.data.success) {
        const parsedData = response.data.data;
        const urls = extractUrls(text);
        const mergedData = {
          ...parsedData,
          // Append all detected URLs into notes (one per line), preserving any existing notes
          notes: [parsedData.notes, urls.length ? urls.join('\n') : null]
            .filter(Boolean)
            .join('\n')
        };

        setParseResult(mergedData);
        setSuccess(true);
        
        // Callback với data đã parse (có deadline đã resolve)
        if (onParsed) {
          onParsed(mergedData);
        }

        // Clear input after 2 seconds
        setTimeout(() => {
          setText('');
          setSuccess(false);
        }, 2000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || t('tasks.toasts.aiError');
      setError(errorMsg);
      
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleParse();
    }
  };

  // Format deadline for display
  const formatDeadline = (isoStr) => {
    if (!isoStr) return '—';
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString(locale, {
        weekday: 'short',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-3 font-mono text-xs border border-brand-border/40 p-4 bg-brand-base/10 relative overflow-hidden">
      {/* HUD Corner Tag */}
      <div className="absolute top-1.5 right-2 text-[6px] text-brand-sub/20 uppercase tracking-widest">[AI-PILOT-PARSER]</div>

      {/* Header */}
      <div className="flex items-center gap-1.5">
        <Sparkles size={13} className="text-brand-primary animate-pulse" />
        <label className="text-[9px] font-bold uppercase tracking-widest text-brand-sub">
          {t('tasks.aiInput.title')}
        </label>
      </div>

      {/* Input area */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          rows={2}
          maxLength={500}
          placeholder={t('tasks.aiInput.placeholder')}
          className="w-full px-3 py-2 border border-brand-border bg-brand-base text-brand-main placeholder-brand-sub/40 text-[11px] outline-none transition-colors resize-none disabled:opacity-50 rounded-none font-sans"
        />
        
        <div className="absolute bottom-2 right-2 text-[8px] text-brand-sub/70">
          {text.length}/500
        </div>
      </div>

      {/* Parse button */}
      <button
        type="button"
        onClick={handleParse}
        disabled={isLoading || !text.trim()}
        className="w-full py-2 bg-brand-primary hover:bg-brand-primary/90 text-white dark:text-brand-card font-bold border border-brand-primary transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 text-[10px] uppercase tracking-widest rounded-none shadow-[0_0_10px_rgba(0,240,255,0.1)] cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 size={12} className="animate-spin" />
            {t('tasks.aiInput.parsing')}
          </>
        ) : success ? (
          <>
            <CheckCircle2 size={12} />
            {t('tasks.aiInput.success')}
          </>
        ) : (
          <>
            <Sparkles size={12} />
            {t('tasks.aiInput.submit')}
          </>
        )}
      </button>

      {/* Parse result */}
      {parseResult && success && (
        <div className="p-3 bg-brand-low/5 border border-brand-low/20 space-y-1 animate-in fade-in duration-200 rounded-none">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={13} className="text-brand-low-text flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-[10px] text-brand-low-text font-mono uppercase tracking-wider">
              <p className="font-bold">{t('tasks.aiInput.extractedTitle')}</p>
              {parseResult.deadline && (
                <p className="mt-1">
                  ⏰ DEADLINE: <strong className="text-brand-main">{formatDeadline(parseResult.deadline)}</strong>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-brand-high/5 border border-brand-high/20 animate-in fade-in duration-200 rounded-none">
          <AlertCircle size={13} className="text-brand-high-text flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-brand-high-text font-mono uppercase tracking-wider">{error}</p>
        </div>
      )}

      {/* Info text */}
      <p className="text-[8px] text-brand-sub leading-normal uppercase tracking-wider">
        {t('tasks.aiInput.hint')}
      </p>
    </div>
  );
};
