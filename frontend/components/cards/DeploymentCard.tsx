'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui-kit/card';
import { Badge } from '@/components/ui-kit/badge';
import { Clock, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDeploymentLogs } from '@/hooks/useWorkflowQueries';
import { useTheme } from '@/hooks/useTheme';

interface DeploymentLog {
  id: string;
  latency_ms?: number;
  [key: string]: any;
}

interface DeploymentCardProps {
  deployment: {
    id: string;
    name: string;
    created_at: string;
    is_active: boolean | number;
  };
  onClick: () => void;
}

const parseApiDate = (value: string) => {
  if (!value) return new Date();
  const trimmed = value.trim();
  if (!trimmed) return new Date();
  const hasOffset = /([zZ]|[+-]\d{2}:\d{2})$/.test(trimmed);
  const candidate = hasOffset
    ? trimmed
    : trimmed.includes('T')
      ? `${trimmed}Z`
      : `${trimmed.replace(' ', 'T')}Z`;
  const parsed = new Date(candidate);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  const fallback = new Date(trimmed);
  return Number.isNaN(fallback.getTime()) ? new Date() : fallback;
};

const getRelativeTime = (dateString: string) => {
  if (!dateString) return '';
  const now = new Date();
  const past = parseApiDate(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMs < 0) {
    return 'in the future';
  }

  if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  if (diffWeeks > 0) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffSecs > 10) return `${diffSecs} seconds ago`;
  return 'just now';
};

export function DeploymentCard({
  deployment,
  onClick
}: DeploymentCardProps) {
  const { colors } = useTheme();
  
  // Theme-aware colors - using centralized theme config
  const cardBg = colors.cardBg;
  const cardHoverBg = colors.cardHover;
  const borderColor = colors.borderBase;
  const textColor = colors.textPrimary;
  const mutedTextColor = colors.textMuted;
  
  // Fetch recent logs for insights (limit to 20 for performance)
  const { data: logsData } = useDeploymentLogs(deployment.id, 20, 0);
  const logs = (logsData?.logs || []) as DeploymentLog[];
  
  // Calculate insights
  const totalInvocations = logsData?.total || 0;
  const recentLogs = logs.slice(0, 20);
  const latencies = recentLogs.filter(log => typeof log.latency_ms === 'number').map(log => log.latency_ms!);
  const avgLatency = latencies.length > 0 
    ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
    >
      <Card 
        className="cursor-pointer rounded-[5px] overflow-hidden transition-all duration-200"
        style={{
          background: cardBg,
          border: `1px solid ${borderColor}`,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
          minHeight: '140px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = cardHoverBg;
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = cardBg;
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.4)';
        }}
        onClick={onClick}
      >
        <CardHeader className="p-6 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-2 mb-4">
            <CardTitle className="text-xl font-semibold truncate" style={{ color: textColor, fontSize: '18px' }} title={deployment.name}>
              {deployment.name}
            </CardTitle>
          </div>
          
          <div className="flex items-center justify-between gap-2 mb-3">
            <CardDescription className="flex items-center gap-2 text-sm" style={{ color: mutedTextColor }}>
              <Clock className="h-[18px] w-[18px]" style={{ color: 'currentColor' }} />
              <span className="font-medium">{getRelativeTime(deployment.created_at)}</span>
            </CardDescription>
            <Badge 
              variant={deployment.is_active ? "status-success" : "status-error"}
              className={deployment.is_active ? "bg-[#22C55E]/10 text-[#22C55E]" : ""}
            >
              {deployment.is_active ? 'Active' : 'Stopped'}
            </Badge>
          </div>

          {/* Insights */}
          {totalInvocations > 0 && (
            <div className="flex items-center gap-4 pt-3 mt-3 border-t" style={{ borderColor: borderColor }}>
              {avgLatency !== null && (
                <div className="flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5" style={{ color: mutedTextColor }} />
                  <span className="text-xs" style={{ color: mutedTextColor }}>
                    {avgLatency}ms
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-xs" style={{ color: mutedTextColor }}>
                  {totalInvocations} {totalInvocations === 1 ? 'call' : 'calls'}
                </span>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>
    </motion.div>
  );
}

