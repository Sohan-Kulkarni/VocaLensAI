import { motion } from 'framer-motion';
import { Download, FileText, Gauge, MessageSquareText, RefreshCcw, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import { getApiError } from '../api/client';
import { downloadReportPdf, fetchInterview, fetchTranscriptSummary } from '../api/interviews';
import { FillerChart } from '../components/charts/FillerChart';
import { RadarSkillsChart } from '../components/charts/RadarSkillsChart';
import { SentimentChart } from '../components/charts/SentimentChart';
import { WpmChart } from '../components/charts/WpmChart';
import { GlassCard } from '../components/ui/GlassCard';
import { MetricCard } from '../components/ui/MetricCard';
import { Skeleton } from '../components/ui/Skeleton';
import { formatDate, formatDuration, formatScore, scoreTone } from '../utils/format';

export function AnalysisResults() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [sessionData, summaryData] = await Promise.all([fetchInterview(id), fetchTranscriptSummary(id)]);
        if (mounted) {
          setSession(sessionData);
          setSummary(summaryData);
        }
      } catch (error) {
        toast.error(getApiError(error, 'Could not load analysis.'));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  async function handleDownload() {
    setReportLoading(true);
    try {
      const blob = await downloadReportPdf(id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `interview-report-${id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(getApiError(error, 'Report export failed.'));
    } finally {
      setReportLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!session?.analysis) {
    return (
      <GlassCard>
        <h2 className="text-xl font-semibold">Analysis unavailable</h2>
        <p className="mt-2 text-slate-400">This session does not have a completed analysis result.</p>
        <Link className="btn-primary mt-5" to="/upload">
          Run a new analysis
        </Link>
      </GlassCard>
    );
  }

  const { analysis } = session;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">{session.domain}</p>
            <h2 className="mt-2 text-3xl font-bold">{session.title}</h2>
            <p className="mt-2 text-sm text-slate-400">
              {formatDate(session.created_at)} - {formatDuration(session.duration_seconds)}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn-secondary" onClick={handleDownload} disabled={reportLoading}>
              <Download size={17} />
              {reportLoading ? 'Exporting...' : 'PDF report'}
            </button>
            <Link className="btn-primary" to="/upload">
              <RefreshCcw size={17} />
              Practice again
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Overall" value={formatScore(analysis.overall_score)} suffix="/100" icon={Gauge} toneByScore />
        <MetricCard label="Confidence" value={formatScore(analysis.confidence_score)} suffix="/100" icon={Sparkles} toneByScore />
        <MetricCard
          label="Communication"
          value={formatScore(analysis.communication_score)}
          suffix="/100"
          icon={MessageSquareText}
          toneByScore
        />
        <MetricCard label="Technical" value={formatScore(analysis.technical_score)} suffix="/100" icon={FileText} toneByScore />
        <MetricCard label="WPM" value={Math.round(analysis.wpm)} icon={Gauge} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <GlassCard>
          <h3 className="text-lg font-semibold">Skill radar</h3>
          <p className="mt-1 text-sm text-slate-400">Balanced score across interview dimensions.</p>
          <RadarSkillsChart scores={analysis.radar_scores} />
        </GlassCard>
        <GlassCard>
          <h3 className="text-lg font-semibold">AI feedback</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <FeedbackList title="Strengths" items={analysis.strengths} tone="emerald" />
            <FeedbackList title="Weaknesses" items={analysis.weaknesses} tone="rose" />
            <FeedbackList title="Suggestions" items={analysis.suggestions} tone="amber" />
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <GlassCard>
          <h3 className="text-lg font-semibold">Filler words</h3>
          <p className="mt-1 text-sm text-slate-400">
            {analysis.filler_count} detected · {analysis.filler_severity} severity
          </p>
          <FillerChart frequency={analysis.charts?.filler_frequency} />
        </GlassCard>
        <GlassCard>
          <h3 className="text-lg font-semibold">Sentiment</h3>
          <p className={`mt-1 text-sm capitalize ${scoreTone(analysis.sentiment_score)}`}>{analysis.sentiment_label}</p>
          <SentimentChart series={analysis.charts?.sentiment_series} />
        </GlassCard>
        <GlassCard>
          <h3 className="text-lg font-semibold">Speaking speed</h3>
          <p className="mt-1 text-sm capitalize text-slate-400">{analysis.charts?.wpm_feedback || 'measured'}</p>
          <WpmChart series={analysis.charts?.wpm_series} />
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <GlassCard>
          <h3 className="text-lg font-semibold">Transcript summary</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">{summary?.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {analysis.keyword_hits.map((keyword) => (
              <span key={keyword} className="rounded-full bg-emerald-300/10 px-3 py-1 text-xs text-emerald-200">
                {keyword}
              </span>
            ))}
            {analysis.missing_keywords.map((keyword) => (
              <span key={keyword} className="rounded-full bg-white/[0.07] px-3 py-1 text-xs text-slate-400">
                missing: {keyword}
              </span>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold">Transcript</h3>
          <div className="mt-4 max-h-96 overflow-auto rounded-lg border border-white/10 bg-black/20 p-4 text-sm leading-7 text-slate-300">
            {session.transcript?.text}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function FeedbackList({ title, items, tone }) {
  const toneClass = {
    emerald: 'bg-emerald-300/10 text-emerald-200',
    rose: 'bg-rose-300/10 text-rose-200',
    amber: 'bg-amber-300/10 text-amber-200',
  }[tone];

  return (
    <div>
      <h4 className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${toneClass}`}>{title}</h4>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
        {items?.length ? items.map((item) => <li key={item}>{item}</li>) : <li>No items generated.</li>}
      </ul>
    </div>
  );
}
