import { api } from './client';

export async function registerUser(payload) {
  const { data } = await api.post('/auth/register', payload);
  return data;
}

export async function loginUser({ email, password }) {
  const body = new URLSearchParams();
  body.set('username', email);
  body.set('password', password);
  const { data } = await api.post('/auth/login', body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return data;
}

export async function fetchMe() {
  const { data } = await api.get('/auth/me');
  return data;
}

export async function fetchProfile() {
  const { data } = await api.get('/users/profile');
  return data;
}
