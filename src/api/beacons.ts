import api from "@/api/apiClient";
import { Beacon, BeaconCreate, BeaconUpdate } from "@/models/beacons";

export const beaconsApi = {
  list: () => api.get<Beacon[]>("/api/beacons").then(r => {
    return (r.data as any).content ?? r.data;
  }),
  get: (id: number) => api.get<Beacon>(`/api/beacons/${id}`).then(r => r.data),
  create: (payload: BeaconCreate) => api.post<Beacon>("/api/beacons", payload).then(r => r.data),
  update: (id: number, payload: BeaconUpdate) => api.put<Beacon>(`/api/beacons/${id}`, payload).then(r => r.data),
  remove: (id: number) => api.delete<void>(`/api/beacons/${id}`),
};
