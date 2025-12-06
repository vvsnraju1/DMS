import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  Activity,
  Shield,
  ClipboardList,
  FolderOpen,
  Target,
  BarChart3,
  CheckCircle,
  Layers,
  Sparkles,
  BellRing,
  ListChecks,
  Edit3,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import documentService from '@/services/document.service';
import { userService } from '@/services/user.service';
import { auditService } from '@/services/audit.service';
import type { Document } from '@/types/document';
import type { AuditLog } from '@/types';
import { formatIST } from '@/utils/dateUtils';

type PrimaryRole = 'DMS_Admin' | 'Author' | 'Reviewer' | 'Approver' | 'HOD' | 'GENERAL';
type StageKey = 'draft' | 'review' | 'approval' | 'ready' | 'published';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  recentAuditLogs: number;
  publishedDocs: number;
}

interface StageStat {
  total: number;
  documents: Document[];
}

interface StageConfig {
  key: StageKey;
  status: string;
  title: string;
  description: string;
  accent: string;
  barColor: string;
  icon: LucideIcon;
  roles: PrimaryRole[];
  cta: {
    label: string;
    to: string;
  };
}

interface HeroMetric {
  label: string;
  key?: keyof DashboardStats;
  stageKey?: StageKey;
  suffix?: string;
}

interface RoleAction {
  title: string;
  description: string;
  to: string;
  icon: LucideIcon;
  accent: string;
}

interface RoleTheme {
  label: string;
  description: string;
  gradient: string;
  helperText: string;
  heroMetrics: HeroMetric[];
  actions: RoleAction[];
  tips: string[];
}

const STAGE_DOC_LIMIT = 4;
const ROLE_PRIORITY: PrimaryRole[] = ['DMS_Admin', 'HOD', 'Approver', 'Reviewer', 'Author'];
const PIPELINE_ORDER: StageKey[] = ['draft', 'review', 'approval', 'ready', 'published'];

const STAGE_PIPELINE: StageConfig[] = [
  {
    key: 'draft',
    status: 'Draft',
    title: 'Drafting desk',
    description: 'Work-in-progress documents with active authorship.',
    accent: 'from-sky-50 via-white to-white',
    barColor: 'bg-sky-500',
    icon: Edit3,
    roles: ['Author', 'DMS_Admin'],
    cta: {
      label: 'Open drafts',
      to: '/tasks?focus=draft',
    },
  },
  {
    key: 'review',
    status: 'Under Review',
    title: 'Review lane',
    description: 'Reviewer queues waiting for feedback or sign-off.',
    accent: 'from-indigo-50 via-white to-white',
    barColor: 'bg-indigo-500',
    icon: ClipboardList,
    roles: ['Reviewer', 'DMS_Admin'],
    cta: {
      label: 'Start reviewing',
      to: '/tasks?focus=review',
    },
  },
  {
    key: 'approval',
    status: 'Pending Approval',
    title: 'Approval desk',
    description: 'Approver and QA checkpoints pending decision.',
    accent: 'from-amber-50 via-white to-white',
    barColor: 'bg-amber-500',
    icon: CheckCircle,
    roles: ['Approver', 'HOD', 'DMS_Admin'],
    cta: {
      label: 'Review approvals',
      to: '/tasks?focus=approval',
    },
  },
  {
    key: 'ready',
    status: 'Approved',
    title: 'Ready to publish',
    description: 'Approved versions awaiting HOD / publisher action.',
    accent: 'from-emerald-50 via-white to-white',
    barColor: 'bg-emerald-500',
    icon: Layers,
    roles: ['HOD', 'DMS_Admin'],
    cta: {
      label: 'Publish now',
      to: '/tasks?focus=ready',
    },
  },
  {
    key: 'published',
    status: 'Published',
    title: 'Published library',
    description: 'Official SOPs available to the floor.',
    accent: 'from-teal-50 via-white to-white',
    barColor: 'bg-teal-500',
    icon: FolderOpen,
    roles: ['GENERAL', 'Author', 'Reviewer', 'Approver', 'HOD', 'DMS_Admin'],
    cta: {
      label: 'Browse library',
      to: '/documents',
    },
  },
];

const ROLE_THEMES: Record<PrimaryRole, RoleTheme> = {
  DMS_Admin: {
    label: 'Admin command center',
    description: 'Monitor adoption, throughput, and audit health in a single glance.',
    gradient: 'from-slate-900 via-slate-800 to-slate-700',
    helperText: 'Run a 30-second health check: users, workflows, and compliance trail.',
    heroMetrics: [
      { label: 'Active users', key: 'activeUsers' },
      { label: 'Audit entries', key: 'recentAuditLogs' },
      { label: 'Published docs', stageKey: 'published' },
    ],
    actions: [
      {
        title: 'Manage users',
        description: 'Provision accounts and adjust RBAC instantly.',
        to: '/users',
        icon: Users,
        accent: 'bg-slate-900 text-white',
      },
      {
        title: 'Review audit trail',
        description: 'Filter critical changes before FDA/QA asks.',
        to: '/audit-logs',
        icon: FileText,
        accent: 'bg-indigo-100 text-indigo-700',
      },
      {
        title: 'Monitor workflow',
        description: 'Jump into pending queues across every role.',
        to: '/tasks',
        icon: Activity,
        accent: 'bg-emerald-100 text-emerald-700',
      },
    ],
    tips: [
      'Capture weekly login and activity snapshots for QA readiness.',
      'Watch audit spikes after deployments to spot anomalies quickly.',
      'Rotate reviewers to keep throughput balanced across departments.',
    ],
  },
  Author: {
    label: 'Author studio',
    description: 'Drive drafts to completion with reviewer-ready insights.',
    gradient: 'from-sky-700 via-sky-600 to-blue-600',
    helperText: 'Prioritise drafts that carry unresolved reviewer comments.',
    heroMetrics: [
      { label: 'Drafts in progress', stageKey: 'draft' },
      { label: 'Waiting on review', stageKey: 'review' },
      { label: 'Published references', stageKey: 'published' },
    ],
    actions: [
      {
        title: 'Create new SOP',
        description: 'Launch from curated templates with guardrails.',
        to: '/documents/create',
        icon: Sparkles,
        accent: 'bg-blue-100 text-blue-700',
      },
      {
        title: 'Continue drafts',
        description: 'Resume where you left off with autosave.',
        to: '/tasks?focus=draft',
        icon: Edit3,
        accent: 'bg-cyan-100 text-cyan-700',
      },
      {
        title: 'Address comments',
        description: 'Triage reviewer feedback before re-submitting.',
        to: '/tasks?focus=review',
        icon: ClipboardList,
        accent: 'bg-indigo-100 text-indigo-700',
      },
    ],
    tips: [
      'Summarise key process deltas inside the change summary field.',
      'Attach impact assessments before triggering reviewer notifications.',
      'Share early drafts with SMEs to minimise late-stage surprises.',
    ],
  },
  Reviewer: {
    label: 'Reviewer command deck',
    description: 'Keep review queues flowing with contextual insights.',
    gradient: 'from-purple-700 via-purple-600 to-indigo-600',
    helperText: 'Batch reviews by department to stay in the same mindset.',
    heroMetrics: [
      { label: 'Files to review', stageKey: 'review' },
      { label: 'Awaiting approval', stageKey: 'approval' },
      { label: 'Published references', stageKey: 'published' },
    ],
    actions: [
      {
        title: 'Open review queue',
        description: 'Claim newest submissions with one click.',
        to: '/tasks?focus=review',
        icon: ClipboardList,
        accent: 'bg-purple-100 text-purple-700',
      },
      {
        title: 'Escalate blockers',
        description: 'Flag drafts breaching SLA directly to QA.',
        to: '/tasks?priority=high',
        icon: Target,
        accent: 'bg-amber-100 text-amber-700',
      },
      {
        title: 'Reference SOPs',
        description: 'Compare with the latest approved versions.',
        to: '/documents',
        icon: FolderOpen,
        accent: 'bg-slate-100 text-slate-700',
      },
    ],
    tips: [
      'Bundle related documents to give consistent guidance.',
      'Capture objective evidence inside review comments for traceability.',
      'Return drafts with a clear checklist of blockers vs. enhancements.',
    ],
  },
  Approver: {
    label: 'Approver lane',
    description: 'Clear approvals with instant access to risk context.',
    gradient: 'from-amber-600 via-orange-500 to-rose-500',
    helperText: 'Prioritise high-risk procedures before routine SOPs.',
    heroMetrics: [
      { label: 'Pending approvals', stageKey: 'approval' },
      { label: 'Ready to publish', stageKey: 'ready' },
      { label: 'Published docs', stageKey: 'published' },
    ],
    actions: [
      {
        title: 'Approval queue',
        description: 'See impact summaries & reviewer sign-off.',
        to: '/tasks?focus=approval',
        icon: CheckCircle,
        accent: 'bg-amber-100 text-amber-700',
      },
      {
        title: 'Ready to publish',
        description: 'Verify metadata before release.',
        to: '/tasks?focus=ready',
        icon: Layers,
        accent: 'bg-emerald-100 text-emerald-700',
      },
      {
        title: 'Audit context',
        description: 'Validate author history before signing.',
        to: '/audit-logs',
        icon: FileText,
        accent: 'bg-slate-100 text-slate-700',
      },
    ],
    tips: [
      'Use reviewer notes to validate mitigation steps instantly.',
      'Confirm version numbers and attachments before approving.',
      'Push back drafts lacking QA or safety impact statements.',
    ],
  },
  HOD: {
    label: 'HOD / Publisher cockpit',
    description: 'Release approved SOPs and watch departmental readiness.',
    gradient: 'from-emerald-700 via-emerald-600 to-teal-600',
    helperText: 'Check ready-to-publish items before the next floor huddle.',
    heroMetrics: [
      { label: 'Ready to publish', stageKey: 'ready' },
      { label: 'Awaiting approval', stageKey: 'approval' },
      { label: 'Live SOPs', stageKey: 'published' },
    ],
    actions: [
      {
        title: 'Publish queue',
        description: 'Release approved SOPs with one click.',
        to: '/tasks?focus=ready',
        icon: Layers,
        accent: 'bg-emerald-100 text-emerald-700',
      },
      {
        title: 'Department insights',
        description: 'Check adoption & revision cadence.',
        to: '/documents',
        icon: BarChart3,
        accent: 'bg-blue-100 text-blue-700',
      },
      {
        title: 'Unblock teams',
        description: 'Escalate stalled drafts with QA.',
        to: '/tasks?priority=high',
        icon: Target,
        accent: 'bg-rose-100 text-rose-700',
      },
    ],
    tips: [
      'Spot-check floor readiness after every major SOP release.',
      'Encourage authors to attach training aids before publishing.',
      'Batch publish similar procedures to simplify communications.',
    ],
  },
  GENERAL: {
    label: 'Workflow hub',
    description: 'Stay ahead of your tasks and know what is already official.',
    gradient: 'from-slate-800 via-slate-700 to-slate-600',
    helperText: 'Use quick links below to jump to action items or the library.',
    heroMetrics: [
      { label: 'Published docs', stageKey: 'published' },
      { label: 'In review', stageKey: 'review' },
      { label: 'Awaiting approval', stageKey: 'approval' },
    ],
    actions: [
      {
        title: 'View pending tasks',
        description: 'Everything awaiting your action.',
        to: '/tasks',
        icon: ClipboardList,
        accent: 'bg-orange-100 text-orange-700',
      },
      {
        title: 'Browse SOP library',
        description: 'Latest approved references.',
        to: '/documents',
        icon: FolderOpen,
        accent: 'bg-emerald-100 text-emerald-700',
      },
      {
        title: 'Escalate priority items',
        description: 'Jump directly into overdue approvals.',
        to: '/tasks?priority=high',
        icon: Shield,
        accent: 'bg-rose-100 text-rose-700',
      },
    ],
    tips: [
      'Check Pending Tasks twice a day to avoid SLA breaches.',
      'Use the SOP library search to confirm you have the newest copy.',
      'Ping QA early if you notice conflicting guidance between SOPs.',
    ],
  },
};

const Dashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    recentAuditLogs: 0,
    publishedDocs: 0,
  });
  const [stageStats, setStageStats] = useState<Partial<Record<StageKey, StageStat>>>({});
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const numberFormatter = useMemo(() => new Intl.NumberFormat('en-IN'), []);
  const formatNumber = useCallback((value: number) => numberFormatter.format(value), [numberFormatter]);

  const primaryRole = useMemo<PrimaryRole>(() => {
    if (!user?.roles?.length) {
      return 'GENERAL';
    }
    const matched = ROLE_PRIORITY.find((role) => user.roles.includes(role));
    return matched ?? 'GENERAL';
  }, [user]);

  const roleTheme = ROLE_THEMES[primaryRole] ?? ROLE_THEMES.GENERAL;

  type AdminResults = [
    Awaited<ReturnType<typeof userService.getUsers>>,
    Awaited<ReturnType<typeof userService.getUsers>>,
    Awaited<ReturnType<typeof auditService.getAuditLogs>>
  ];

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const stagePromise = Promise.all(
        STAGE_PIPELINE.map(async (stage): Promise<{ key: StageKey; data: StageStat }> => {
          try {
            const response = await documentService.list({ status: stage.status, limit: STAGE_DOC_LIMIT });
            const items = response.items ?? [];
            return {
              key: stage.key,
              data: {
                total: response.total ?? items.length,
                documents: items,
              },
            };
          } catch (stageError) {
            console.error(`Failed to load ${stage.status} stats`, stageError);
            return {
              key: stage.key,
              data: {
                total: 0,
                documents: [],
              },
            };
          }
        })
      );

      const adminPromise: Promise<AdminResults> | null = isAdmin
        ? Promise.all([
            userService.getUsers({ page: 1, page_size: 1 }),
            userService.getUsers({ page: 1, page_size: 1, is_active: true }),
            auditService.getAuditLogs({ page: 1, page_size: 5 }),
          ])
        : null;

      const stageResults = await stagePromise;
      const nextStageStats = stageResults.reduce<Partial<Record<StageKey, StageStat>>>((acc, entry) => {
        acc[entry.key] = entry.data;
        return acc;
      }, {});
      setStageStats(nextStageStats);

      let adminResults: AdminResults | null = null;
      if (adminPromise) {
        try {
          adminResults = await adminPromise;
        } catch (adminErr) {
          console.error('Failed to load admin metrics', adminErr);
          setError('Some admin metrics could not load. Please refresh.');
        }
      }

      if (adminResults) {
        const [usersData, activeUsersData, auditData] = adminResults;
        setStats({
          totalUsers: usersData.total,
          activeUsers: activeUsersData.total,
          recentAuditLogs: auditData.total,
          publishedDocs: nextStageStats.published?.total ?? 0,
        });
        setRecentActivity(auditData.logs.slice(0, 5));
      } else {
        setStats((prev) => ({
          ...prev,
          publishedDocs: nextStageStats.published?.total ?? prev.publishedDocs,
        }));
        if (!isAdmin) {
          setRecentActivity([]);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard insights', err);
      setError('Unable to load dashboard insights. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const heroMetrics = useMemo(
    () =>
      roleTheme.heroMetrics.map((metric) => {
        let baseValue = 0;
        if (metric.key) {
          baseValue = stats[metric.key];
        } else if (metric.stageKey) {
          baseValue = stageStats[metric.stageKey]?.total ?? 0;
        }
        return {
          label: metric.label,
          value: formatNumber(baseValue),
          suffix: metric.suffix ?? '',
        };
      }),
    [roleTheme, stats, stageStats, formatNumber]
  );

  const heroMetricGridClass =
    heroMetrics.length >= 3 ? 'grid-cols-2 lg:grid-cols-3' : heroMetrics.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2';

  const relevantStages = useMemo(() => {
    if (primaryRole === 'DMS_Admin') {
      return STAGE_PIPELINE;
    }
    const filtered = STAGE_PIPELINE.filter(
      (stage) => stage.roles.includes(primaryRole) || stage.roles.includes('GENERAL')
    );
    return filtered.length ? filtered : STAGE_PIPELINE.slice(0, 3);
  }, [primaryRole]);

  const pipelineProgress = useMemo(() => {
    const total = PIPELINE_ORDER.reduce((acc, key) => acc + (stageStats[key]?.total ?? 0), 0);
    return PIPELINE_ORDER.map((key) => {
      const stageMeta = STAGE_PIPELINE.find((stage) => stage.key === key);
      if (!stageMeta) {
        return null;
      }
      const count = stageStats[key]?.total ?? 0;
      const percent = total ? Math.round((count / total) * 100) : 0;
      return {
        key,
        title: stageMeta.title,
        barColor: stageMeta.barColor,
        count,
        percent,
      };
    }).filter(Boolean) as Array<{ key: StageKey; title: string; barColor: string; count: number; percent: number }>;
  }, [stageStats]);

  const actionableCount = useMemo(() => {
    switch (primaryRole) {
      case 'Author':
        return stageStats.draft?.total ?? 0;
      case 'Reviewer':
        return stageStats.review?.total ?? 0;
      case 'Approver':
        return stageStats.approval?.total ?? 0;
      case 'HOD':
        return (stageStats.ready?.total ?? 0) + (stageStats.approval?.total ?? 0);
      case 'DMS_Admin':
        return PIPELINE_ORDER.reduce((sum, key) => sum + (stageStats[key]?.total ?? 0), 0);
      default:
        return (stageStats.review?.total ?? 0) + (stageStats.approval?.total ?? 0);
    }
  }, [primaryRole, stageStats]);

  const quickActions = [
    {
      key: 'tasks',
      title: 'Action queue',
      description: 'Documents awaiting your action right now.',
      count: actionableCount,
      icon: ClipboardList,
      accent: 'border-l-4 border-orange-500',
      to: '/tasks',
      meta: 'Prioritized by workflow urgency',
    },
    {
      key: 'library',
      title: 'Published library',
      description: 'Official SOPs ready for reference.',
      count: stats.publishedDocs,
      icon: FolderOpen,
      accent: 'border-l-4 border-emerald-500',
      to: '/documents',
      meta: 'Only approved versions visible',
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-display font-bold text-primary-600">Q</span>
          </div>
        </div>
        <p className="mt-6 text-lg font-medium text-gray-600">Loading your dashboard...</p>
        <p className="text-sm text-gray-400">Preparing personalized insights</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className={`rounded-3xl p-8 text-white shadow-lg bg-gradient-to-r ${roleTheme.gradient}`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
              <Sparkles className="h-4 w-4" />
              {roleTheme.label}
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">{user?.full_name || 'Welcome back'}</h1>
            <p className="mt-2 max-w-2xl text-base text-white/80">{roleTheme.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              {user?.email && <span className="rounded-full bg-white/20 px-3 py-1">{user.email}</span>}
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  user?.is_active ? 'bg-emerald-500/30 text-white' : 'bg-rose-500 text-white'
                }`}
              >
                {user?.is_active ? 'Active' : 'Inactive'}
              </span>
              <div className="flex flex-wrap gap-2">
                {user?.roles.map((role) => (
                  <span key={role} className="flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                    <Shield className="mr-1 h-3 w-3" />
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className={`grid gap-4 ${heroMetricGridClass}`}>
            {heroMetrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/70">{metric.label}</p>
                <p className="mt-2 text-3xl font-semibold">
                  {metric.value}
                  {metric.suffix}
                </p>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-6 text-sm text-white/80">{roleTheme.helperText}</p>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-900">
          <div className="flex items-center justify-between">
            <p>{error}</p>
            <button
              onClick={loadDashboard}
              className="rounded-full border border-rose-300 px-4 py-1 text-sm font-semibold text-rose-700 hover:bg-rose-100"
            >
              Refresh
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase text-gray-500">Workflow momentum</p>
                  <h2 className="text-2xl font-semibold text-gray-900">Pipeline overview</h2>
                  <p className="text-sm text-gray-500">Track how documents move from draft to publication.</p>
                </div>
                <div className="rounded-2xl bg-primary-50 p-3 text-primary-600">
                  <BarChart3 className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {pipelineProgress.map((stage) => (
                  <div key={stage.key}>
                    <div className="mb-1 flex items-center justify-between text-sm text-gray-600">
                      <span>{stage.title}</span>
                      <span className="font-medium text-gray-900">{formatNumber(stage.count)} docs</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div className={`h-full rounded-full ${stage.barColor}`} style={{ width: `${stage.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {relevantStages.map((stage) => {
                const data = stageStats[stage.key];
                const StageIcon = stage.icon;
                return (
                  <div
                    key={stage.key}
                    className={`rounded-3xl border border-gray-200 bg-gradient-to-br p-5 shadow-sm ${stage.accent}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">{stage.title}</p>
                        <p className="mt-1 text-3xl font-semibold text-gray-900">{formatNumber(data?.total ?? 0)}</p>
                        <p className="text-sm text-gray-600">{stage.description}</p>
                      </div>
                      <div className="rounded-2xl bg-white/80 p-3 text-primary-600">
                        <StageIcon className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      {(data?.documents || []).slice(0, STAGE_DOC_LIMIT).map((doc) => (
                        <Link
                          key={`${stage.key}-${doc.id}`}
                          to={`/documents/${doc.id}`}
                          className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-sm text-gray-700 hover:bg-white"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-900">{doc.title}</p>
                            <p className="truncate text-xs text-gray-500">
                              {doc.document_number || `DOC-${doc.id}`} • {doc.department || 'No department'}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500">{doc.status}</span>
                        </Link>
                      ))}
                      {!data?.documents?.length && (
                        <p className="rounded-2xl bg-white/70 px-3 py-2 text-sm text-gray-500">No documents in this lane right now.</p>
                      )}
                    </div>
                    <Link
                      to={stage.cta.to}
                      className="mt-4 inline-flex items-center text-sm font-semibold text-primary-700 hover:text-primary-900"
                    >
                      {stage.cta.label} →
                    </Link>
                  </div>
                );
              })}
            </div>

            {isAdmin && (
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-500">People snapshot</p>
                    <h3 className="text-xl font-semibold text-gray-900">User & compliance health</h3>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-500">Total users</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatNumber(stats.totalUsers)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active licences</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatNumber(stats.activeUsers)}</p>
                    <p className="text-xs text-gray-500">
                      {(stats.totalUsers && stats.activeUsers
                        ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
                        : 0
                      ).toString()}
                      % adoption
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Audit log entries</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatNumber(stats.recentAuditLogs)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {quickActions.map((action) => {
                const ActionIcon = action.icon;
                return (
                  <Link
                    key={action.key}
                    to={action.to}
                    className={`rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 ${action.accent}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">{action.title}</p>
                        <p className="mt-1 text-3xl font-semibold text-gray-900">{formatNumber(action.count)}</p>
                      </div>
                      <div className="rounded-2xl bg-gray-50 p-3 text-primary-600">
                        <ActionIcon className="h-6 w-6" />
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{action.description}</p>
                    <p className="mt-1 text-xs text-gray-400">{action.meta}</p>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary-50 p-3 text-primary-600">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">Role playbook</p>
                  <h3 className="text-xl font-semibold text-gray-900">Focus actions</h3>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                {roleTheme.actions.map((action) => {
                  const ActionIcon = action.icon;
                  return (
                    <Link
                      key={action.title}
                      to={action.to}
                      className="flex items-center gap-4 rounded-2xl border border-gray-100 px-4 py-3 hover:bg-gray-50"
                    >
                      <span className={`rounded-2xl p-3 ${action.accent}`}>
                        <ActionIcon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{action.title}</p>
                        <p className="text-xs text-gray-500">{action.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary-50 p-3 text-primary-600">
                  <ListChecks className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">Focus cues</p>
                  <h3 className="text-xl font-semibold text-gray-900">Pro tips</h3>
                </div>
              </div>
              <ul className="mt-5 space-y-3">
                {roleTheme.tips.map((tip) => (
                  <li key={tip} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary-500" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {recentActivity.length > 0 && (
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-500">System activity</p>
                    <h3 className="text-xl font-semibold text-gray-900">Most recent events</h3>
                  </div>
                  <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
                    <BellRing className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  {recentActivity.map((log) => (
                    <div key={log.id} className="rounded-2xl border border-gray-100 p-3">
                      <div className="flex items-center justify-between text-sm font-medium text-gray-900">
                        <span>{log.action}</span>
                        <span className="text-xs text-gray-500">{formatIST(log.timestamp, { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{log.description || 'No description available.'}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        {log.username || 'System'} • {log.entity_type}
                      </p>
                    </div>
                  ))}
                </div>
                <Link to="/audit-logs" className="mt-4 inline-flex text-sm font-semibold text-primary-700 hover:text-primary-900">
                  View full audit trail →
                </Link>
              </div>
            )}
          </div>
      </div>

      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-soft border border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-brand-500 flex items-center justify-center">
            <span className="text-white text-sm font-display font-bold">Q</span>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-700">Q-Docs v1.0.0</p>
            <p className="text-xs text-gray-400">FDA 21 CFR Part 11 Compliant</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
