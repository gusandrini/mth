export type Moto = {
  id: number;
  placa: string;
  clienteId: number;
  modeloMotoId: number;

  // joins/opcionais
  nomeCliente?: string | null;
  modeloNome?: string | null;
  fabricante?: string | null;
};

export type MotoForm = {
  placa: string;
  clienteId?: string;     
  modeloMotoId?: string;
};
