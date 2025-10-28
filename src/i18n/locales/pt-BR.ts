export default {
  common: {
    success: 'Sucesso',
    error: 'Erro',
    cancel: 'Cancelar',
  },
  settings: {
    title: 'Configurações',
    theme: 'Tema',
    darkMode: 'Modo escuro',
    language: 'Idioma',
    logout: 'Sair',
    confirmLogout: 'Tem certeza que deseja encerrar sua sessão?',
    loggedOutFallback: 'Você foi desconectado.',
    logoutFailedFallback: 'Não foi possível sair da conta.',
  },
  home: {
    brand: 'Mottooth',
    subtitle: 'Gestão de Pátio',

    // KPI cards
    kpiMotosTitle: 'Motos',
    kpiMotosSuffix: 'no Pátio',
    kpiBeaconsTitle: 'Beacons',
    kpiBeaconsSuffix: 'Ativos',

    // Seções / Ações
    mapSummary: 'Resumo do Mapa',
    seeMap: 'Ver Mapa >',
    seeAll: 'Ver Todas >',

    // Zonas / Pátios
    yard: 'Pátio {{id}}',
    zoneCounts: '{{label}} — {{motos}} motos • {{beacons}} beacons',

    // Listas (últimos itens)
    lastMotos: 'Últimas Motos Cadastradas',
    lastBeacons: 'Últimos Beacons',

    bikeNumber: 'Moto #{{id}}',
    yardLabel: 'Pátio: {{name}}',
    bikeLabel: 'Moto: {{plate}}',

    // Empty states específicos
    noBikes: 'Nenhuma moto cadastrada ainda',
    noBeacons: 'Nenhum beacon cadastrado ainda',
  },

  beacons: {
  title: 'Beacons',
  count: '{{count}} {{count, plural, one {beacon} other {beacons}}}',

  searchPlaceholder: 'Buscar por UUID...',
  refresh: 'Atualizar lista',

  empty: 'Nenhum beacon cadastrado',

  new: 'Novo beacon',
  newTitle: 'Novo Beacon',
  edit: 'Editar',
  editTitle: 'Editar Beacon',
  delete: 'Excluir',
  deleteTitle: 'Excluir',
  deleteMsg: 'Deseja excluir o beacon {{uuid}}?',
  deleteConfirm: 'Excluir',
  deleteError: 'Não foi possível excluir.',

  uuidPlaceholder: 'ex.: B-000123-XYZ',
  battery: 'Bateria (0–100)',
  motoId: 'Moto ID',
  modelId: 'Modelo Beacon ID',

  save: 'Salvar',
  created: 'Beacon criado.',
  updated: 'Beacon atualizado.',
  saveError: 'Não foi possível salvar.',
  loadError: 'Não foi possível carregar os beacons.',
  loadOneError: 'Não foi possível carregar o beacon.',

  validation: {
    uuidReq: 'UUID é obrigatório.',
    batteryRange: 'Bateria deve ser um número entre 0 e 100.',
  },
}

};
