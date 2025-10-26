/** Types alinhados ao BeaconDTO do backend */
export type Beacon = {
  id: number;
  uuid: string;               // obrigatório
  bateria?: number | null;    // 0..100
  motoId?: number | null;
  modeloBeaconId?: number | null;

  // retornos extras (join) – opcionais
  placaMoto?: string | null;
  modeloNome?: string | null;
};

export type BeaconForm = {
  uuid: string;
  bateria?: string;           // no form usamos string; convertemos no service
  motoId?: string;
  modeloBeaconId?: string;
};
