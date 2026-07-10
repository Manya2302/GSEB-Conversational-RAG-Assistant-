const API_BASE = 'http://localhost:8000/api/v1';

export const uploadDocument = async (file: File, bookName: string, subject: string, standard: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('book_name', bookName);
  if (subject) formData.append('subject', subject);
  if (standard) formData.append('standard', standard);

  const response = await fetch(`${API_BASE}/upload/`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Upload failed');
  }

  return response.json();
};

export const chatWithAssistant = async (query: string, sessionId?: string | null) => {
  const payload: any = { query };
  if (sessionId) payload.session_id = sessionId;

  const response = await fetch(`${API_BASE}/chat/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Chat failed');
  }

  return response.json();
};
