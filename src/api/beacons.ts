import api from '@/api/apiClient';
import { Beacon, BeaconForm } from '@/models/beacons';

/** Converte o form (strings) para payload do backend (numbers/undefined) */
function toPayload(form: BeaconForm) {
  return {
    uuid: form.uuid.trim(),
    bateria: form.bateria === '' || form.bateria == null ? undefined : Number(form.bateria),
    motoId: form.motoId === '' || form.motoId == null ? undefined : Number(form.motoId),
    modeloBeaconId:
      form.modeloBeaconId === '' || form.modeloBeaconId == null ? undefined : Number(form.modeloBeaconId),
  };
}

/** Lista (suporta backend paginado ou não) */
export async function listBeacons(): Promise<Beacon[]> {
  const resp = await api.get('/api/beacons');
  const items: Beacon[] = (resp.data?.content ?? resp.data) as Beacon[];
  return items ?? [];
}

/** Busca 1 */
export async function getBeacon(id: number): Promise<Beacon> {
  const { data } = await api.get<Beacon>(`/api/beacons/${id}`);
  return data;
}

/** Cria */
export async function createBeacon(form: BeaconForm) {
  return api.post('/api/beacons', toPayload(form));
}

/** Atualiza */
export async function updateBeacon(id: number, form: BeaconForm) {
  return api.put(`/api/beacons/${id}`, toPayload(form));
}

/** Exclui */
export async function deleteBeacon(id: number) {
  return api.delete(`/api/beacons/${id}`);
}
