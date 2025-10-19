import { useState } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Lock, Copy, Check } from 'lucide-react';
import { encryptNote, generateNoteId } from '../lib/encryption';
import { createClient } from '@blinkdotnew/sdk';

const blink = createClient({
  projectId: 'locknote-secure-markdown-sharing-cqr8z2ks',
  authRequired: false
});

export function MarkdownEditor() {
  const [content, setContent] = useState('');
  const [password, setPassword] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateNote = async () => {
    if (!content.trim() || !password.trim()) {
      return;
    }

    setIsCreating(true);
    try {
      const noteId = generateNoteId();
      const encryptedContent = encryptNote(content, password);

      await blink.db.encryptedNotes.create({
        id: noteId,
        encryptedContent,
        createdAt: Date.now(),
        viewCount: 0
      });

      const url = `${window.location.origin}/?note=${noteId}`;
      setShareUrl(url);
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNewNote = () => {
    setContent('');
    setPassword('');
    setShareUrl('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lock className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-semibold text-foreground">LockNote</h1>
          </div>
          <p className="text-muted-foreground">Write. Encrypt. Share securely.</p>
        </div>

        {!shareUrl ? (
          <div className="space-y-4 animate-slide-up">
            {/* Markdown Editor */}
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="# Start writing your note...

Write in **Markdown** format. Your note will be encrypted before sharing.

## Example:
- **Bold text**
- *Italic text*
- [Links](https://example.com)
- `Code snippets`"
                className="min-h-[400px] border-0 rounded-none resize-none font-mono text-base p-6 focus-visible:ring-0"
              />
            </div>

            {/* Password Input */}
            <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Set Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a strong password"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Only those with this password can decrypt and read your note.
              </p>
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreateNote}
              disabled={!content.trim() || !password.trim() || isCreating}
              className="w-full h-12 text-base font-medium"
              size="lg"
            >
              <Lock className="w-4 h-4 mr-2" />
              {isCreating ? 'Encrypting...' : 'Encrypt & Share'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {/* Success Message */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Lock className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Note Encrypted!</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Your note has been encrypted and is ready to share.
              </p>
            </div>

            {/* Share Link */}
            <div className="bg-card border border-border rounded-lg p-4">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Shareable Link
              </label>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Share this link along with the password to allow others to view your note.
              </p>
            </div>

            {/* New Note Button */}
            <Button
              onClick={handleNewNote}
              variant="outline"
              className="w-full"
            >
              Create Another Note
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
