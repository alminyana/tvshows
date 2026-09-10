export const MESSAGES = {
  // Landing
  landing: {
    title: 'TV Shows',
    claim: 'Tu colección personal de series favoritas',
    enter: 'Acceder',
    kicker: 'Colección personal',
    kickerYears: (from: number, to: number) => `${from}–${to}`,
    introCount: (total: number) => `${total} series vistas, puntuadas y comentadas una a una.`,
    introTail:
      'Sin algoritmo y sin recomendaciones: solo lo que he visto y lo que pienso de cada una.',
    viewDashboard: 'Ver el dashboard',
    scrollCue: 'La colección, en detalle',
    stats: {
      title: 'La colección en cifras',
      subtitle:
        'Los mismos indicadores que abren el dashboard, calculados sobre lo que hay hoy en la base de datos.',
    },
    mosaic: {
      title: 'Un vistazo a la colección',
      subtitle:
        'Cada ficha lleva sinopsis, temporadas, género, reparto y una opinión escrita. Nada de sinopsis copiada y poco más.',
    },
    inside: {
      title: 'Qué encuentras dentro',
      subtitle: 'Dos pantallas, sin más ceremonia.',
      catalogTitle: 'El catálogo',
      catalogText:
        'Todas las series en rejilla o en lista, con buscador y filtros por género y valoración. Cada ficha abre sinopsis, temporadas, reparto y la opinión propia.',
      dashboardTitle: 'El dashboard',
      dashboardText:
        'Cuatro gráficas sobre la colección: reparto por género, distribución de valoraciones, duración de las series y peso de cada género sobre el total.',
      genreChartLabel: 'Series por género',
    },
    access: {
      title: 'Entra sin cuenta',
      text: 'La colección es pública en modo lectura: puedes navegarla entera sin registrarte. Crear, editar o borrar series requiere iniciar sesión desde el botón del header.',
    },
    footer: {
      brand: 'TV Shows — colección personal',
      themes: (total: number) => `${total} temas, en claro y en oscuro`,
    },
  },

  // Navegación
  nav: {
    series: 'Series',
    dashboard: 'Dashboard',
    login: 'Iniciar sesión',
    logout: 'Cerrar sesión',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
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
    helpAbout: (field: string) => `Ayuda sobre ${field}`,
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
    clearAll: 'Limpiar todo',
    removeFilter: (label: string) => `Quitar filtro ${label}`,
    count: (n: number) => (n === 1 ? '1 serie' : `${n} series`),
    countFiltered: (shown: number, total: number) => `${shown} de ${total} series`,
    searchChip: (q: string) => `\u201C${q}\u201D`,
    ratingChip: (n: number) => `${n}\u2605 o más`,
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
    view: 'Vista',
    viewCards: 'Vista en cuadrícula',
    viewMosaic: 'Vista en mosaico',
    viewList: 'Vista en lista',
    sections: {
      cover: 'Portada',
      basics: 'Datos básicos',
      genres: 'Géneros',
      cast: 'Reparto',
      verdict: 'Valoración y opinión',
    },
    // Ayuda contextual de los campos que hacen algo que no se adivina mirándolos.
    help: {
      cover: {
        paste: 'Puedes copiar una imagen de otra web y pegarla aquí con Ctrl+V (o Cmd+V) sin descargarla antes.',
        file: 'Si prefieres un archivo del ordenador, usa «Seleccionar imagen». Se aceptan JPEG, PNG y WebP de hasta 2 MB.',
      },
      seasons: {
        free: 'Es un campo de texto libre: escribe la duración como quieras — «Miniserie - 8 episodios», «4 temporadas», «6 seasons - 52 episodios».',
        parsed: 'Eso sí, la ficha y el dashboard lo leen para clasificar la serie en miniserie, 1 temporada o multi-temporada. Para que acierten: si es una miniserie incluye la palabra «miniserie»; si no, escribe el número pegado a «temporada» o «season».',
        example: 'Así no confunde las temporadas con los episodios: en «1 temporada - 8 episodios» se queda con el 1, no con el 8.',
      },
      genres: {
        pick: 'Marca en la lista los géneros que quieras. Con Ctrl (o Cmd) pulsado puedes marcar varios a la vez.',
        create: '¿No está el que buscas? Escríbelo abajo y pulsa Enter: se añade a esta serie y queda en el catálogo para las demás.',
        remove: 'La × de un género seleccionado lo borra del catálogo entero, no solo de esta serie.',
      },
      cast: {
        add: 'Escribe un nombre y pulsa Enter para añadirlo. Repite para cada actor o actriz.',
        free: 'Es texto libre: no hay catálogo ni autocompletado, así que cuida la ortografía si quieres que los nombres coincidan entre series.',
      },
    },
    // Campos de alta de chips.
    genreNewPlaceholder: 'Nuevo género y Enter para añadir',
    genreNewLabel: 'Añadir nuevo género',
    genreAddLabel: 'Añadir género',
    castNewPlaceholder: 'Nombre y Enter para añadir',
    castNewLabel: 'Añadir miembro del reparto',
    castAddLabel: 'Añadir reparto',
    coverPreviewAlt: 'Previsualización de portada',
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
