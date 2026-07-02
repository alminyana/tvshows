export const MESSAGES = {
  // Landing
  landing: {
    title: 'TV Shows',
    claim: 'Tu colección personal de series favoritas',
    enter: 'Entrar',
  },

  // Navegación
  nav: {
    series: 'Series',
    dashboard: 'Dashboard',
    users: 'Usuarios',
    login: 'Iniciar sesión',
    logout: 'Cerrar sesión',
  },

  // Temas
  theme: {
    label: 'Tema',
    modeLight: 'Claro',
    modeDark: 'Oscuro',
    toggleMode: 'Cambiar modo',
    toggleToLight: 'Cambiar a modo claro',
    toggleToDark: 'Cambiar a modo oscuro',
    names: {
      default: 'Predeterminado',
      ocean: 'Océano',
      sunset: 'Atardecer',
      forest: 'Bosque',
      amatista: 'Amatista',
      carmesi: 'Carmesí',
      cian: 'Cian-Turquesa',
      crepusculo: 'Crepúsculo',
    },
  },

  // Acciones comunes
  actions: {
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    create: 'Crear',
    confirm: 'Confirmar',
    close: 'Cerrar',
    add: 'Añadir',
    remove: 'Quitar',
    search: 'Buscar',
    filter: 'Filtrar',
    clear: 'Limpiar',
    back: 'Volver',
  },

  // Notificaciones
  notifications: {
    seriesCreated: 'Serie creada correctamente.',
    seriesUpdated: 'Serie actualizada correctamente.',
    seriesDeleted: 'Serie eliminada correctamente.',
  },

  // Filtros
  filters: {
    title: 'Filtros',
    titleWithCount: (n: number) => `Filtros (${n})`,
  },

  // Series
  series: {
    title: 'Título',
    synopsis: 'Sinopsis',
    seasons: 'Temporadas',
    cast: 'Reparto',
    year: 'Año',
    opinion: 'Mi opinión',
    rating: 'Valoración',
    genres: 'Géneros',
    cover: 'Portada',
    coverPaste: 'Pega aquí una imagen (Ctrl/Cmd+V)',
    coverPasteHint: 'Copia una imagen de otra web y pégala, o usa el selector de archivo.',
    coverSelectFile: 'Seleccionar imagen',
    createdBy: 'Añadida por',
    noResults: 'No se encontraron series',
    searchPlaceholder: 'Buscar por título…',
    filterByGenre: 'Filtrar por género',
    filterByRating: 'Filtrar por valoración',
    deleteConfirm: '¿Eliminar esta serie?',
    deleteConfirmDetail: 'Esta acción no se puede deshacer.',
    selectedGenres: 'Géneros seleccionados',
    genreDeleteConfirm: (name: string) => `¿Eliminar el género "${name}" del catálogo?`,
    genreDeleteConfirmDetail: 'Se quitará del listado y de cualquier otra serie que lo tenga asignado. Esta acción no se puede deshacer.',
    newSeries: 'Nueva serie',
    editSeries: 'Editar serie',
    viewCards: 'Vista en cuadrícula',
    viewList: 'Vista en lista',
    sections: {
      cover: 'Portada',
      basics: 'Datos básicos',
      classification: 'Clasificación',
      rating: 'Valoración',
      opinion: 'Opinión',
    },
  },

  // Usuarios
  users: {
    title: 'Usuarios',
    email: 'Email',
    password: 'Contraseña',
    role: 'Rol',
    roles: {
      admin: 'Administrador',
      user: 'Usuario',
    },
    deleteConfirm: '¿Eliminar este usuario?',
    deleteConfirmDetail: 'Esta acción no se puede deshacer.',
    cannotDeleteSelf: 'No puedes eliminar tu propia cuenta.',
    newUser: 'Nuevo usuario',
    editUser: 'Editar usuario',
    noUsers: 'No hay usuarios.',
    listAriaLabel: 'Lista de usuarios',
    created: 'Usuario creado correctamente.',
    updated: 'Usuario actualizado correctamente.',
    deleted: 'Usuario eliminado correctamente.',
  },

  // Login
  login: {
    title: 'Iniciar sesión',
    emailLabel: 'Correo electrónico',
    passwordLabel: 'Contraseña',
    submitLabel: 'Entrar',
    errorCredentials: 'Email o contraseña incorrectos.',
  },

  // Errores y estados
  errors: {
    required: 'Campo obligatorio.',
    invalidEmail: 'Email no válido.',
    minLength: (n: number) => `Mínimo ${n} caracteres.`,
    maxLength: (n: number) => `Máximo ${n} caracteres.`,
    minValue: (n: number) => `El valor mínimo es ${n}.`,
    maxValue: (n: number) => `El valor máximo es ${n}.`,
    invalidYear: 'Año no válido.',
    imageType: 'Solo se aceptan imágenes JPEG, PNG o WebP.',
    imageSize: 'La imagen no puede superar 2 MB.',
    clipboardNoImage: 'El portapapeles no contiene ninguna imagen.',
    notFound: 'No encontrado.',
    generic: 'Ha ocurrido un error. Inténtalo de nuevo.',
  },

  // Dashboard
  dashboard: {
    title: 'Dashboard',
    totalSeries: 'Total de series',
    featuredSeries: 'Series destacadas',
    featuredDetail: 'Con valoración ≥ 4',
    genreDistribution: 'Distribución por género',
    ratingDistribution: 'Distribución por valoración',
    genrePieChart: 'Series por género',
    durationDistribution: 'Distribución por duración',
    miniseries: 'Miniseries',
    miniseriesDetail: 'Historias autoconclusivas',
    multiSeason: 'Multi-temporada',
    multiSeasonDetail: 'Más de una temporada',
    durationMiniserie: 'Miniserie',
    durationSingle: '1 temporada',
    durationMulti: 'Multi-temporada',
    noData: 'Sin datos disponibles.',
  },

  // Showcase
  showcase: {
    title: 'Showcase de componentes',
  },

  // 404
  notFound: {
    title: 'Página no encontrada',
    detail: 'La URL que has introducido no existe.',
    goHome: 'Ir al inicio',
  },
} as const;
