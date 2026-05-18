import { api } from './client';

export async function uploadAudio({ title, domain, durationSeconds, file }) {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('domain', domain);
  if (durationSeconds) {
    formData.append('duration_seconds', String(durationSeconds));
  }
  formData.append('file', file);

  const { data } = await api.post('/interviews/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function analyzeText(payload) {
  const { data } = await api.post('/interviews/analyze-text', payload);
  return data;
}

export async function fetchHistory(params = {}) {
  const { data } = await api.get('/interviews/history', { params });
  return data;
}

export async function fetchInterview(id) {
  const { data } = await api.get(`/interviews/${id}`);
  return data;
}

export async function deleteInterview(id) {
  await api.delete(`/interviews/${id}`);
}

export async function compareInterviews(sessionIds) {
  const { data } = await api.post('/interviews/compare', { session_ids: sessionIds });
  return data;
}

export function reportPdfUrl(id) {
  return `${api.defaults.baseURL}/reports/${id}/pdf`;
}

export async function downloadReportPdf(id) {
  const response = await api.get(`/reports/${id}/pdf`, { responseType: 'blob' });
  return response.data;
}

export async function fetchTranscriptSummary(id) {
  const { data } = await api.get(`/reports/${id}/summary`);
  return data;
}
