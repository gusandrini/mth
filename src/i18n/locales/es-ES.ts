export default {
  common: {
    success: 'Éxito',
    error: 'Error',
    cancel: 'Cancelar',
    tryAgain: 'Intentar de nuevo',
    empty: 'No se encontraron datos.',
    errorLoading: 'No fue posible cargar los datos.',
    loggedOut: 'Has cerrado sesión.',
    logoutFailed: 'No fue posible cerrar sesión.',
  },

  settings: {
    title: 'Configuraciones',
    theme: 'Tema',
    darkMode: 'Modo oscuro',
    language: 'Idioma',
    logout: 'Cerrar sesión',
    confirmLogout: '¿Seguro que deseas cerrar tu sesión?',
    loggedOutFallback: 'Has cerrado sesión.',
    logoutFailedFallback: 'No fue posible cerrar sesión.',
  },

  home: {
    brand: 'Mottooth',
    subtitle: 'Gestión de Patio',

    // KPI cards
    kpiMotosTitle: 'Motos',
    kpiMotosSuffix: 'en el Patio',
    kpiBeaconsTitle: 'Beacons',
    kpiBeaconsSuffix: 'Activos',

    // Secciones / Acciones
    mapSummary: 'Resumen del Mapa',
    seeMap: 'Ver Mapa >',
    seeAll: 'Ver Todos >',

    // Zonas / Patios
    yard: 'Patio {{id}}',
    zoneCounts: '{{label}} — {{motos}} motos • {{beacons}} beacons',

    // Listas (últimos ítems)
    lastMotos: 'Últimas Motos Registradas',
    lastBeacons: 'Últimos Beacons',

    bikeNumber: 'Moto #{{id}}',
    yardLabel: 'Patio: {{name}}',
    bikeLabel: 'Moto: {{plate}}',

    // Empty states específicos
    noBikes: 'Aún no hay motos registradas',
    noBeacons: 'Aún no hay beacons registrados',
  },

  beacons: {
    title: 'Beacons',
    // Se você não configurou pluralização no i18n-js, deixe simples:
    count: '{{count}} beacons',

    searchPlaceholder: 'Buscar por UUID...',
    refresh: 'Actualizar lista',

    empty: 'Aún no hay beacons registrados',

    new: 'Nuevo beacon',
    newTitle: 'Nuevo Beacon',
    edit: 'Editar',
    editTitle: 'Editar Beacon',
    delete: 'Eliminar',
    deleteTitle: 'Eliminar',
    deleteMsg: '¿Deseas eliminar el beacon {{uuid}}?',
    deleteConfirm: 'Eliminar',
    deleteError: 'No fue posible eliminarlo.',

    uuidPlaceholder: 'ej.: B-000123-XYZ',
    battery: 'Batería (0–100)',
    motoId: 'ID de la Moto',
    modelId: 'ID del Modelo de Beacon',

    save: 'Guardar',
    created: 'Beacon creado.',
    updated: 'Beacon actualizado.',
    saveError: 'No fue posible guardar.',
    loadError: 'No fue posible cargar los beacons.',
    loadOneError: 'No fue posible cargar el beacon.',

    validation: {
      uuidReq: 'El UUID es obligatorio.',
      batteryRange: 'La batería debe ser un número entre 0 y 100.',
    },
  },

  mapa: {
    title: 'Mapeo del Patio',
    refresh: 'Actualizar',
    loadError: 'No fue posible cargar datos del patio.',

    // Tarjetas / conteos
    zoneCounts: '{{motos}} motos • {{beacons}} beacons',
    footerCounts: '{{zones}} zonas • {{motos}} motos • {{beacons}} beacons',

    motos: 'Motos',
    beacons: 'Beacons',
    addLocation: 'Agregar Ubicación',

    // Lista vacía
    empty: 'No se encontraron datos. Registra una ubicación para comenzar.',

    // Modal
    newTitle: 'Nueva Ubicación',
    patioId: 'ID del Patio',
    motoIdReq: 'ID de la Moto *',
    motoIdPh: 'ej.: 12',
    posX: 'Posición X *',
    posXPh: 'ej.: 12.34',
    posY: 'Posición Y *',
    posYPh: 'ej.: 56.78',
    save: 'Guardar',

    // Validaciones y mensajes
    validation: {
      fillFields: 'Completa ID de Moto, Posición X y Posición Y correctamente.',
      noBeacon: 'Esta moto no tiene un beacon vinculado.',
    },
    created: 'Ubicación creada.',
    saveError: 'No fue posible guardar.',
    conflictTitle: 'Conflicto',
    conflictFallback: 'Conflicto de datos.',
    invalidTitle: 'Datos inválidos',
    notFoundTitle: 'No encontrado',
  },
};
