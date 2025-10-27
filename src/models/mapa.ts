// src/models/map.ts
export type Localizacao = {
  id: number;
  posicaoX: number;
  posicaoY: number;
  dataHora?: string | null;
  motoId: number;
  patioId: number;
  placaMoto?: string | null;
  nomePatio?: string | null;
};

export type Beacon = {
  id: number;
  uuid: string;
  bateria?: number | null;
  motoId?: number | null;
  modeloBeaconId?: number | null;
  placaMoto?: string | null;
  modeloNome?: string | null;
};

export type Zone = {
  id: number;      // patioId
  label: string;   // nomePatio ou "Pátio {id}"
  motos: number;   // motos distintas nesse pátio
  beacons: number; // beacons cujas motos estão nesse pátio
};

export type CreateLocalizacaoForm = {
  posicaoX: string;
  posicaoY: string;
  motoId: string;
  patioId: number;
};
