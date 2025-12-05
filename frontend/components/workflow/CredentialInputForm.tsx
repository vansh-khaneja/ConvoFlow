'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui-kit/button';
import { Input } from '@/components/ui-kit/input';
import { Label } from '@/components/ui-kit/label';
import { setCredential } from '@/api/credentials';
import { toast } from 'sonner';
import { Eye, EyeOff, Check } from 'lucide-react';
import { providers } from '@/config/providers';

interface CredentialInputFormProps {
  credentialKey: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CredentialInputForm({ credentialKey, onSuccess, onCancel }: CredentialInputFormProps) {
  const [value, setValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Find provider info for better UX
  const provider = providers.find(p => p.key === credentialKey);
  const label = provider?.label || credentialKey;
  const description = provider?.desc || '';
  const isPassword = credentialKey.toLowerCase().includes('key') || 
                     credentialKey.toLowerCase().includes('secret') ||
                     credentialKey.toLowerCase().includes('token') ||
                     credentialKey.toLowerCase().includes('password');

  const handleSave = async () => {
    if (!value.trim()) {
      toast.error('Please enter a value');
      return;
    }

    setIsSaving(true);
    try {
      const response = await setCredential({
        key: credentialKey,
        value: value.trim()
      });

      if (response.success) {
        setIsSaved(true);
        toast.success(`${label} credential saved successfully!`);
        setTimeout(() => {
          onSuccess?.();
        }, 500);
      } else {
        toast.error(response.error || 'Failed to save credential');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save credential');
    } finally {
      setIsSaving(false);
    }
  };

  if (isSaved) {
    return (
      <div className="flex items-center gap-2 text-green-400 text-sm p-3 bg-green-900/20 border border-green-800/50 rounded-lg">
        <Check className="h-4 w-4" />
        <span>Credential saved! You can retry the workflow now.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)]">
      <div>
        <Label htmlFor={`cred-${credentialKey}`} className="text-sm font-medium text-[var(--foreground)]">
          {label}
          {description && (
            <span className="text-xs text-[var(--text-muted)] ml-2 font-normal">({description})</span>
          )}
        </Label>
        <div className="relative mt-2">
          <Input
            id={`cred-${credentialKey}`}
            type={isPassword && !showPassword ? 'password' : 'text'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Enter ${label} ${isPassword ? 'key' : 'value'}`}
            disabled={isSaving}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={isSaving || !value.trim()}
          size="sm"
          className="flex-1"
        >
          {isSaving ? 'Saving...' : 'Save Credential'}
        </Button>
        {onCancel && (
          <Button
            onClick={onCancel}
            variant="outline"
            size="sm"
            disabled={isSaving}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

