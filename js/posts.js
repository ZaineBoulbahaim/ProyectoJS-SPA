// Importar las API keys desde el archivo de configuración
import { OMDB_API_KEY, TMDB_API_KEY, CONFIG } from '../config.js';
// Constantes de configuración
const MAX_MOVIES = CONFIG.maxMovies;
// Realiza una búsqueda de películas en la API de OMDB usando un término de búsqueda
async function fetchMovies(searchTerm, apiKey) {
    try {
        // Solicita datos a la API de OMDB con el término de búsqueda y clave API
        const response = await fetch(`https://www.omdbapi.com/?s=${searchTerm}&apikey=${apiKey}`);
        // Convierte la respuesta a formato JSON
        const data = await response.json();
        
        // Verifica si la respuesta de la API fue exitosa
        if (data.Response === 'True') {
            // Devuelve el array de resultados de películas
            return data.Search;
        } else {
            // Devuelve un array vacío si no hay resultados
            return [];
        }
    } catch (error) {
        // Registra el error en consola y devuelve array vacío si ocurre un error
        console.error('Error al obtener películas de OMDB:', error);
        return [];
    }
}

// Busca una película específica en la API de TMDb y devuelve su ID
async function searchMovieInTMDb(movieTitle, apiKey) {
    try {
        // Codifica el título para usarlo en URL
        const encodedTitle = encodeURIComponent(movieTitle);
        // Realiza búsqueda en TMDb API
        const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodedTitle}`);
        const data = await response.json();
        
        // Verifica si hay resultados y devuelve el ID de la primera película
        if (data.results && data.results.length > 0) {
            return data.results[0].id;
        }
        // Devuelve null si no encuentra resultados
        return null;
    } catch (error) {
        // Registra error y devuelve null
        console.error('Error al buscar película en TMDb:', error);
        return null;
    }
}

// Obtiene detalles extendidos de una película desde TMDb usando su ID
async function fetchTMDbDetails(tmdbId, apiKey) {
    try {
        // Obtiene información básica de la película
        const detailsResponse = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}&language=es-ES`);
        const detailsData = await detailsResponse.json();
        
        // Obtiene videos/trailers asociados a la película
        const videosResponse = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}/videos?api_key=${apiKey}`);
        const videosData = await videosResponse.json();
        
        // Obtiene información del reparto (cast) y equipo
        const creditsResponse = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}/credits?api_key=${apiKey}`);
        const creditsData = await creditsResponse.json();
        
        // Filtra solo los trailers de YouTube
        const trailers = (videosData.results || []).filter(video => 
            video && video.type === 'Trailer' && video.site === 'YouTube'
        );
        
        // Toma solo los primeros 5 miembros del reparto
        const cast = (creditsData.cast || []).slice(0, 5);
        
        // Devuelve un objeto con todos los datos obtenidos
        return {
            overview: detailsData.overview || 'No hay resumen disponible.',
            genres: detailsData.genres || [],
            runtime: detailsData.runtime || 0,
            rating: detailsData.vote_average || 0,
            trailers: trailers,
            cast: cast
        };
    } catch (error) {
        // Registra error y devuelve objeto con valores por defecto
        console.error('Error al obtener detalles de TMDb:', error);
        return {
            overview: 'No hay resumen disponible.',
            genres: [],
            runtime: 0,
            rating: 0,
            trailers: [],
            cast: []
        };
    }
}
// Función que crea el HTML de una tarjeta de película
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    const poster = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=Sin+Imagen';
    
    // Verificar si hay datos de TMDb
    const hasTmdbData = movie.tmdbData && typeof movie.tmdbData === 'object';
    const hasTrailer = hasTmdbData && movie.tmdbData.trailers && movie.tmdbData.trailers.length > 0;
    
    // Escapar JSON para evitar problemas con comillas
    const movieDataStr = JSON.stringify(movie)
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    
    // URLs para imágenes de fallback
    const fallbackImage = 'https://via.placeholder.com/300x450/f0f0f0/999?text=Sin+Imagen';
    const fallbackActor = 'https://via.placeholder.com/200x300/f0f0f0/999?text=Sin+Foto';
    
    card.innerHTML = `
        <img src="${poster}" alt="${movie.Title}" class="movie-poster" onerror="this.src='${fallbackImage}'">
        <div class="movie-info">
            <h3 class="movie-title">${movie.Title}</h3>
            <p class="movie-year">Año: ${movie.Year}</p>
            <p class="movie-type">Tipo: ${movie.Type}</p>
            ${hasTrailer ? 
                '<p class="movie-trailer">🎬 Trailer disponible</p>' : 
                '<p class="movie-trailer">📽️ Información disponible</p>'}
            <button class="btn-read-more" data-movie="${movieDataStr}">Leer más</button>
        </div>
    `;
    
    return card;
}

// Función que muestra un modal con la información completa de la película
function showMovieModal(movie) {
    // Verificar si ya existe un modal y eliminarlo
    const existingModal = document.querySelector('.movie-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Crear el modal
    const modal = document.createElement('div');
    modal.className = 'movie-modal';
    
    // Verificar si hay poster
    const poster = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=Sin+Imagen';
    
    // Verificar si hay datos de TMDb
    const hasTmdbData = movie.tmdbData && typeof movie.tmdbData === 'object';
    
    // URLs para imágenes de fallback
    const fallbackPoster = 'https://via.placeholder.com/300x450/f0f0f0/999?text=Sin+Imagen';
    const fallbackActor = 'https://via.placeholder.com/200x300/f0f0f0/999?text=Sin+Foto';
    
    // Preparar los géneros (si existen)
    let genresHTML = '';
    if (hasTmdbData && movie.tmdbData.genres && Array.isArray(movie.tmdbData.genres)) {
        const genreNames = movie.tmdbData.genres.map(g => g.name).join(', ');
        genresHTML = `<p><strong>Géneros:</strong> ${genreNames}</p>`;
    }
    
    // Preparar la duración CORRECTAMENTE
    let runtimeHTML = '';
    if (hasTmdbData && movie.tmdbData.runtime) {
        const runtime = parseInt(movie.tmdbData.runtime);
        
        if (!isNaN(runtime) && runtime > 0) {
            const hours = Math.floor(runtime / 60);
            const minutes = runtime % 60;
            
            // Formatear correctamente
            if (hours === 0) {
                // Solo minutos (menos de 1 hora)
                runtimeHTML = `<p><strong>Duración:</strong> ${minutes} min</p>`;
            } else if (minutes === 0) {
                // Horas exactas
                runtimeHTML = `<p><strong>Duración:</strong> ${hours}h</p>`;
            } else {
                // Horas y minutos
                runtimeHTML = `<p><strong>Duración:</strong> ${hours}h ${minutes}min</p>`;
            }
        }
    }
    
    // Preparar la puntuación (si existe)
    let ratingHTML = '';
    if (hasTmdbData && movie.tmdbData.rating) {
        const rating = parseFloat(movie.tmdbData.rating);
        if (!isNaN(rating) && rating > 0) {
            ratingHTML = `<p><strong>Puntuación TMDb:</strong> ⭐ ${rating.toFixed(1)}/10</p>`;
        }
    }
    
    // Preparar el resumen (si existe)
    let overviewHTML = '';
    if (hasTmdbData && movie.tmdbData.overview && movie.tmdbData.overview.trim() !== '') {
        overviewHTML = `
            <div class="modal-overview">
                <h3>Resumen:</h3>
                <p>${movie.tmdbData.overview}</p>
            </div>
        `;
    }
    
    // HTML del trailer - SIEMPRE mostrar esta sección
    let trailerHTML = '';
    if (hasTmdbData && movie.tmdbData.trailers && movie.tmdbData.trailers.length > 0) {
        const trailer = movie.tmdbData.trailers[0];
        trailerHTML = `
            <div class="modal-trailer">
                <h3>Trailer:</h3>
                <iframe 
                    width="100%" 
                    height="400" 
                    src="https://www.youtube.com/embed/${trailer.key}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                    loading="lazy">
                </iframe>
            </div>
        `;
    } else {
        // SI NO HAY TRAILER, mostrar mensaje - TODOS LOS MODALES SE ABREN
        trailerHTML = `
            <div class="modal-trailer">
                <h3>Trailer:</h3>
                <p>No hay trailer disponible para esta película.</p>
            </div>
        `;
    }
    
    // HTML del reparto (si existe)
    let castHTML = '';
    if (hasTmdbData && movie.tmdbData.cast && movie.tmdbData.cast.length > 0) {
        castHTML = '<div class="modal-cast"><h3>Reparto Principal:</h3><div class="cast-list">';
        movie.tmdbData.cast.forEach(actor => {
            if (actor && actor.name) {
                const actorPhoto = actor.profile_path 
                    ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` 
                    : fallbackActor;
                const characterName = actor.character || 'No especificado';
                castHTML += `
                    <div class="cast-member">
                        <img src="${actorPhoto}" alt="${actor.name}" onerror="this.src='${fallbackActor}'">
                        <p><strong>${actor.name}</strong></p>
                        <p class="character">${characterName}</p>
                    </div>
                `;
            }
        });
        castHTML += '</div></div>';
    }
    
    // Crear el contenido del modal
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            <div class="modal-body">
                <img src="${poster}" alt="${movie.Title}" class="modal-poster" onerror="this.src='${fallbackPoster}'">
                <div class="modal-info">
                    <h2>${movie.Title} (${movie.Year})</h2>
                    <p><strong>Tipo:</strong> ${movie.Type}</p>
                    ${genresHTML}
                    ${runtimeHTML}
                    ${ratingHTML}
                </div>
            </div>
            ${overviewHTML}
            ${trailerHTML}
            ${castHTML}
        </div>
    `;
    
    // Añadir el modal al body
    document.body.appendChild(modal);
    
    // Evento para cerrar el modal
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    // Evento para cerrar al hacer click fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Evento para cerrar con tecla ESC
    const handleEscKey = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', handleEscKey);
        }
    };
    document.addEventListener('keydown', handleEscKey);
}

// Función principal que inicializa el sistema de posts
async function initPosts() {
    // Obtener el contenedor donde se mostrarán las películas
    const postsContainer = document.getElementById('posts');
    
    // Mostrar mensaje de carga
    postsContainer.innerHTML = '<p class="loading">Cargando películas...</p>';
    
    try {
        // PASO 1: Obtener películas de OMDB
        const movies1 = await fetchMovies('marvel', OMDB_API_KEY);
        const movies2 = await fetchMovies('avengers', OMDB_API_KEY);
        
        const allMovies = [...movies1, ...movies2];
        
        // Eliminar duplicados por imdbID
        const uniqueMovies = allMovies.filter((movie, index, self) =>
            index === self.findIndex((m) => m.imdbID === movie.imdbID)
        );
        
        const movies = uniqueMovies.slice(0, MAX_MOVIES);
        
        if (movies.length === 0) {
            postsContainer.innerHTML = '<p class="error">No se encontraron películas.</p>';
            return;
        }
        
        // PASO 2: Obtener datos de TMDb para cada película
        const moviesWithTMDbData = [];
        
        for (const movie of movies) {
            try {
                const tmdbId = await searchMovieInTMDb(movie.Title, TMDB_API_KEY);
                
                if (tmdbId) {
                    const tmdbData = await fetchTMDbDetails(tmdbId, TMDB_API_KEY);
                    moviesWithTMDbData.push({
                        ...movie,
                        tmdbData: tmdbData
                    });
                } else {
                    // Si no se encuentra en TMDb, crear estructura básica
                    moviesWithTMDbData.push({
                        ...movie,
                        tmdbData: {
                            overview: 'No hay información adicional disponible.',
                            genres: [],
                            runtime: 0,
                            rating: 0,
                            trailers: [],
                            cast: []
                        }
                    });
                }
            } catch (error) {
                console.error(`Error procesando ${movie.Title}:`, error);
                // Añadir película con estructura básica incluso si hay error
                moviesWithTMDbData.push({
                    ...movie,
                    tmdbData: {
                        overview: 'Error al cargar información adicional.',
                        genres: [],
                        runtime: 0,
                        rating: 0,
                        trailers: [],
                        cast: []
                    }
                });
            }
        }
        
        // Limpiar el contenedor
        postsContainer.innerHTML = '';
        
        // Crear un contenedor grid para las tarjetas
        const grid = document.createElement('div');
        grid.className = 'movies-grid';
        
        // PASO 3: Crear las tarjetas
        moviesWithTMDbData.forEach(movie => {
            try {
                const card = createMovieCard(movie);
                grid.appendChild(card);
            } catch (error) {
                console.error('Error creando tarjeta:', error);
            }
        });
        
        // Añadir el grid al contenedor
        postsContainer.appendChild(grid);
        
        // PASO 4: Configurar eventos de "Leer más"
        const readMoreButtons = postsContainer.querySelectorAll('.btn-read-more');
        readMoreButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                try {
                    // Decodificar las entidades HTML
                    const movieDataStr = button.getAttribute('data-movie')
                        .replace(/&quot;/g, '"')
                        .replace(/&#39;/g, "'");
                    const movieData = JSON.parse(movieDataStr);
                    showMovieModal(movieData);
                } catch (error) {
                    console.error('Error al abrir modal:', error);
                    alert('Error al cargar la información. Por favor, inténtalo de nuevo.');
                }
            });
        });
        
    } catch (error) {
        console.error('Error general al inicializar posts:', error);
        postsContainer.innerHTML = `
            <div class="error">
                <p>Error al cargar las películas. Intenta de nuevo más tarde.</p>
                <p style="font-size: 0.8rem; color: #999;">${error.message}</p>
            </div>
        `;
    }
}

// Exportar la función para usarla en main.js
export { initPosts };