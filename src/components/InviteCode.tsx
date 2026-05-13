'use client';

import { useState } from 'react';

interface InviteCodeProps {
  code: string;
}

/** 显示邀请码，支持一键复制 */
export default function InviteCode({ code }: InviteCodeProps) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="inline-flex items-center gap-2 bg-teal-50 dark:bg-teal-900/20 rounded-xl px-3 py-2">
      <span className="text-xs text-zinc-500 dark:text-zinc-400">
        邀请码
      </span>
      <span className="font-mono font-bold text-teal-700 dark:text-teal-300 tracking-widest text-sm">
        {code}
      </span>
      <button
        onClick={copy}
        className="text-teal-500 hover:text-teal-700 dark:hover:text-teal-300 transition-colors p-0.5"
        aria-label="复制邀请码"
      >
        {copied ? (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    </div>
  );
}
