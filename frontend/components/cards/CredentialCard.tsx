'use client';

import { Card, CardContent } from '@/components/ui-kit/card';
import { Button } from '@/components/ui-kit/button';
import { Key, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

interface Provider {
  key: string;
  label: string;
  desc: string;
  icon?: any;
  image?: string;
  fields?: Array<{
    key: string;
    label: string;
    type: string;
    placeholder: string;
    required: boolean;
  }>;
}

interface CredentialCardProps {
  credential: {
    key: string;
    label: string;
    value?: string;
  };
  provider?: Provider;
  onDelete: (key: string) => void;
  disabled?: boolean;
}

export function CredentialCard({
  credential,
  provider,
  onDelete,
  disabled = false,
}: CredentialCardProps) {
  const { colors } = useTheme();
  const Icon = provider?.icon || Key;

  // Theme-aware colors - using centralized theme config
  const cardBg = colors.cardBg;
  const cardHoverBg = colors.cardHover;
  const borderColor = colors.borderBase;
  const textColor = colors.textPrimary;
  const mutedTextColor = colors.textMuted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
    >
      <Card 
        className="rounded-[5px] overflow-hidden transition-all duration-200"
        style={{
          background: cardBg,
          border: `1px solid ${borderColor}`,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                {provider?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={provider.image} alt={provider.label} className="h-6 w-6 object-contain" />
                ) : (
                  <Icon className="h-5 w-5 text-[var(--primary)]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate mb-0.5" style={{ color: textColor }}>
                  {credential.label}
                </div>
                <div className="text-xs truncate font-mono" style={{ color: mutedTextColor }}>
                  {credential.key}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="px-3 h-8 interactive-scale flex-shrink-0 transition-all"
              style={{
                color: '#f87171',
                background: 'transparent'
              }}
              disabled={disabled}
              onClick={() => onDelete(credential.key)}
              title="Delete credential"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#f87171';
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

