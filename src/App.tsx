import React, { useEffect, useState } from 'react';
import { MarkdownEditor } from './components/MarkdownEditor';
import { NoteViewer } from './components/NoteViewer';

function App() {
  const [noteId, setNoteId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const note = params.get('note');
    setNoteId(note);
  }, []);

  const handleDownloadSource = () => {
    // Trigger browser download from public folder
    const a = document.createElement('a');
    a.href = '/locknote-source.zip';
    a.download = 'locknote-source.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (noteId) {
    return <NoteViewer noteId={noteId} />;
  }

  return (
    <>
      <MarkdownEditor />

      {/* Floating download button */}
      <button
        onClick={handleDownloadSource}
        aria-label="Download source zip"
        title="Download source zip"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l4-4m-4 4l-4-4M21 21H3" />
        </svg>
      </button>
    </>
  );
}

export default App;
