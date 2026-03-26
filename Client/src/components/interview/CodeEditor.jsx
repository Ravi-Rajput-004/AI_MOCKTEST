import { lazy, Suspense } from 'react';

const MonacoEditor = lazy(() => import('@monaco-editor/react'));

export default function CodeEditor({ value, onChange, language = 'javascript', height = '400px' }) {
  return (
    <Suspense fallback={<div className="skeleton w-full" style={{ height }} />}>
      <div className="rounded-xl overflow-hidden border border-border">
        <MonacoEditor
          height={height}
          language={language}
          value={value}
          onChange={onChange}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: 'var(--font-mono)',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 16 },
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            bracketPairColorization: { enabled: true },
            autoClosingBrackets: 'always',
            tabSize: 2,
            wordWrap: 'on',
            suggestOnTriggerCharacters: true,
            formatOnPaste: true,
          }}
        />
      </div>
    </Suspense>
  );
}
