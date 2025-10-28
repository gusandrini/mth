export default {
  common: {
    success: 'Sucesso',
    error: 'Erro',
    cancel: 'Cancelar',
    tryAgain: 'Tentar novamente',
    empty: 'Nenhum dado encontrado.',
    errorLoading: 'Falha ao carregar dados.',
    loggedOut: 'Você foi desconectado.',
    logoutFailed: 'Não foi possível sair da conta.',
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
    // Se não usa pluralização ICU no i18n-js, deixe simples:
    count: '{{count}} beacons',

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
  },

  mapa: {
    title: 'Mapeamento do Pátio',
    refresh: 'Atualizar',
    loadError: 'Não foi possível carregar dados do pátio.',

    // Cards / contagens
    zoneCounts: '{{motos}} motos • {{beacons}} beacons',
    footerCounts: '{{zones}} zonas • {{motos}} motos • {{beacons}} beacons',

    motos: 'Motos',
    beacons: 'Beacons',
    addLocation: 'Adicionar Localização',

    // Lista vazia
    empty: 'Nenhum dado encontrado. Cadastre uma localização para começar.',

    // Modal
    newTitle: 'Nova Localização',
    patioId: 'Pátio ID',
    motoIdReq: 'Moto ID *',
    motoIdPh: 'ex.: 12',
    posX: 'Posição X *',
    posXPh: 'ex.: 12.34',
    posY: 'Posição Y *',
    posYPh: 'ex.: 56.78',
    save: 'Salvar',

    // Validações e mensagens
    validation: {
      fillFields: 'Preencha Moto ID, Posição X e Posição Y corretamente.',
      noBeacon: 'Esta moto não possui beacon vinculado.',
    },
    created: 'Localização criada.',
    saveError: 'Não foi possível salvar.',
    conflictTitle: 'Conflito',
    conflictFallback: 'Conflito de dados.',
    invalidTitle: 'Dados inválidos',
    notFoundTitle: 'Não encontrado',
  },
  motos: {
    title: 'Motos no Pátio',
    count: '{{count}} motos',

    searchPlaceholder: 'Buscar por placa, modelo, fabricante...',
    refresh: 'Atualizar lista',

    empty: 'Nenhuma moto cadastrada',

    new: 'Nova moto',
    newTitle: 'Nova Moto',
    editTitle: 'Editar Moto',
    delete: 'Excluir',
    deleteTitle: 'Excluir',
    deleteMsg: 'Excluir moto {{plate}}?',
    deleteConfirm: 'Excluir',
    deleteError: 'Não foi possível excluir.',

    plate: 'Placa',
    plateReq: 'Placa *',
    platePh: 'ABC1234',
    clientId: 'Cliente ID',
    clientIdReq: 'Cliente ID *',
    clientIdPh: '1',
    modelIdReq: 'Modelo Moto ID *',
    modelIdPh: '2',

    noModel: 'Sem modelo',

    save: 'Salvar',
    created: 'Moto cadastrada com sucesso.',
    updated: 'Moto atualizada com sucesso.',
    saveError: 'Falha ao salvar.',
    loadError: 'Não foi possível carregar os dados.',

    validation: {
      fillRequired: 'Preencha todos os campos obrigatórios.',
    },
  },

};
