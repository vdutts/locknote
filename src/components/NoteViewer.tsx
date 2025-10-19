import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Lock, AlertCircle } from 'lucide-react';
import { decryptNote } from '../lib/encryption';
import { createClient } from '@blinkdotnew/sdk';
import ReactMarkdown from 'react-markdown';

const blink = createClient({
  projectId: 'locknote-secure-markdown-sharing-cqr8z2ks',
  authRequired: false
});

interface NoteViewerProps {
  noteId: string;
}

export function NoteViewer({ noteId }: NoteViewerProps) {
  const [password, setPassword] = useState('');
  const [decryptedContent, setDecryptedContent] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [encryptedContent, setEncryptedContent] = useState('');

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const notes = await blink.db.encryptedNotes.list({
          where: { id: noteId }
        });

        if (notes.length === 0) {
          setError('Note not found');
          return;
        }

        setEncryptedContent(notes[0].encryptedContent);
        
        // Update view count
        await blink.db.encryptedNotes.update(noteId, {
          viewCount: (Number(notes[0].viewCount) || 0) + 1
        });
      } catch (err) {
        console.error('Failed to fetch note:', err);
        setError('Failed to load note');
      }
    };

    fetchNote();
  }, [noteId]);

  const handleUnlock = () => {
    if (!password.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const content = decryptNote(encryptedContent, password);
      
      if (!content) {
        setError('Incorrect password');
        setIsLoading(false);
        return;
      }

      setDecryptedContent(content);
    } catch {
      setError('Incorrect password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUnlock();
    }
  };

  if (error && !encryptedContent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">Note Not Found</h2>
          <p className="text-muted-foreground mb-6">
            This note doesn't exist or has been deleted.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Create a New Note
          </Button>
        </div>
      </div>
    );
  }

  if (!decryptedContent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Lock className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-semibold text-foreground">Unlock Note</h1>
            </div>
            <p className="text-muted-foreground">Enter the password to decrypt this note</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter password"
                className="font-mono"
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <Button
              onClick={handleUnlock}
              disabled={!password.trim() || isLoading}
              className="w-full"
              size="lg"
            >
              <Lock className="w-4 h-4 mr-2" />
              {isLoading ? 'Decrypting...' : 'Unlock Note'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Lock className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-semibold text-foreground">Decrypted Note</h1>
          </div>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
          >
            Create New Note
          </Button>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 animate-fade-in">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown>{decryptedContent}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
