import api from '@/api/apiClient';
import type { Moto, MotoForm } from '@/models/moto';

/** Normaliza paginação do backend ({content: []} ou []) */
function unwrap<T>(data: any): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && Array.isArray(data.content)) return data.content as T[];
  return [];
}

/** Parser (garante opcionalidade e tipos) */
function parseMoto(dto: any): Moto {
  return {
    id: dto.id,
    placa: dto.placa,
    clienteId: dto.clienteId,
    modeloMotoId: dto.modeloMotoId,
    nomeCliente: dto.nomeCliente ?? null,
    modeloNome: dto.modeloNome ?? null,
    fabricante: dto.fabricante ?? null,
  };
}

/** Converte form -> payload limpo */
function toPayload(form: MotoForm) {
  const n = (v?: string) => (v?.trim() ? Number(v) : undefined);
  return {
    placa: form.placa?.trim().toUpperCase(),
    clienteId: n(form.clienteId),
    modeloMotoId: n(form.modeloMotoId),
  };
}

/* ===== API ===== */

export async function listMotos(): Promise<Moto[]> {
  const res = await api.get('/api/motos');
  return unwrap<Moto>(res.data).map(parseMoto);
}

export async function getMoto(id: number): Promise<Moto> {
  const res = await api.get(`/api/motos/${id}`);
  return parseMoto(res.data);
}

export async function createMoto(form: MotoForm): Promise<Moto> {
  const res = await api.post('/api/motos', toPayload(form));
  return parseMoto(res.data);
}

export async function updateMoto(id: number, form: MotoForm): Promise<Moto> {
  const res = await api.put(`/api/motos/${id}`, toPayload(form));
  return parseMoto(res.data);
}

export async function deleteMoto(id: number): Promise<void> {
  await api.delete(`/api/motos/${id}`);
}
