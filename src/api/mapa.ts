// src/services/localizacaoService.ts
import api from '@/api/apiClient';
import { Localizacao } from '@/models/mapa';

function normalizeError(e: any): { status?: number; message: string } {
  const status = e?.response?.status ?? e?.status;
  const message =
    e?.response?.data?.message ||
    e?.response?.data?.error ||
    e?.message ||
    'Falha ao comunicar com o servidor.';
  return { status, message };
}

export async function listLocalizacoes(): Promise<Localizacao[]> {
  try {
    const resp = await api.get('/api/localizacoes');
    return (resp.data?.content ?? resp.data) ?? [];
  } catch (e: any) {
    throw normalizeError(e);
  }
}

export async function createLocalizacao(payload: {
  posicaoX: number;
  posicaoY: number;
  motoId: number;
  patioId: number;
}) {
  try {
    return await api.post('/api/localizacoes', payload);
  } catch (e: any) {
    throw normalizeError(e);
  }
}
