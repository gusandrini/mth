export interface Beacon {
  id: number;
  uuid: string;
  bateria?: number | null;         // 0..100
  motoId?: number | null;
  modeloBeaconId?: number | null;
  placaMoto?: string | null;       // vem do backend (join)
  modeloNome?: string | null;      // vem do backend (join)
}

export type BeaconCreate = {
  uuid: string;
  bateria?: number | null;
  motoId?: number | null;
  modeloBeaconId?: number | null;
};

export type BeaconUpdate = BeaconCreate;
