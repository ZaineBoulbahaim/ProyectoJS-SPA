// ===================================
// SISTEMA DE POSTS - PELÍCULAS CON OMDB + TMDb APIs
// ===================================

// Importar las API keys desde el archivo de configuración
import { OMDB_API_KEY, TMDB_API_KEY, CONFIG } from '../config.js';

// Constantes de configuración
const MAX_MOVIES = CONFIG.maxMovies;

// ===================================
// FUNCIONES PARA OMDB API (Primera API)
// ===================================

// Función que obtiene la lista de películas desde OMDB
async function fetchMovies(searchTerm, apiKey) {
    try {
        // Hacer petición a la API de búsqueda de OMDB
        const response = await fetch(`https://www.omdbapi.com/?s=${searchTerm}&apikey=${apiKey}`);
        
        // Convertir la respuesta a JSON
        const data = await response.json();
        
        // Verificar si la búsqueda fue exitosa
        if (data.Response === 'True') {
            return data.Search;
        } else {
            throw new Error(data.Error);
        }
    } catch (error) {
        console.error('Error al obtener películas de OMDB:', error);
        return [];
    }
}

// ===================================
// FUNCIONES PARA TMDb API (Segunda API)
// ===================================

// Función que busca una película en TMDb por su título
async function searchMovieInTMDb(movieTitle, apiKey) {
    try {
        // Codificar el título para la URL
        const encodedTitle = encodeURIComponent(movieTitle);
        
        // Hacer petición a la API de búsqueda de TMDb
        const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodedTitle}`);
        
        // Convertir la respuesta a JSON
        const data = await response.json();
        
        // Si hay resultados, devolver el ID de la primera película encontrada
        if (data.results && data.results.length > 0) {
            return data.results[0].id;
        }
        
        return null;
    } catch (error) {
        console.error('Error al buscar película en TMDb:', error);
        return null;
    }
}

// Función que obtiene videos (trailers), reparto y detalles adicionales de TMDb
async function fetchTMDbDetails(tmdbId, apiKey) {
    try {
        // Hacer petición para obtener detalles generales de la película/serie
        const detailsResponse = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}&language=es-ES`);
        const detailsData = await detailsResponse.json();
        
        // Hacer petición para obtener videos (trailers)
        const videosResponse = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}/videos?api_key=${apiKey}`);
        const videosData = await videosResponse.json();
        
        // Hacer petición para obtener el reparto
        const creditsResponse = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}/credits?api_key=${apiKey}`);
        const creditsData = await creditsResponse.json();
        
        // Filtrar solo los trailers de YouTube
        const trailers = videosData.results.filter(video => 
            video.type === 'Trailer' && video.site === 'YouTube'
        );
        
        // Obtener los primeros 5 actores principales
        const cast = creditsData.cast.slice(0, 5);
        
        return {
            overview: detailsData.overview || 'No hay resumen disponible.',
            genres: detailsData.genres || [],
            runtime: detailsData.runtime || null,
            rating: detailsData.vote_average || 'N/A',
            trailers: trailers,
            cast: cast
        };
    } catch (error) {
        console.error('Error al obtener detalles de TMDb:', error);
        return {
            overview: 'No hay resumen disponible.',
            genres: [],
            runtime: null,
            rating: 'N/A',
            trailers: [],
            cast: []
        };
    }
}

// ===================================
// FUNCIONES DE RENDERIZADO
// ===================================

// Función que crea el HTML de una tarjeta de película
function createMovieCard(movie) {
    // Crear un div contenedor para la tarjeta
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    // Verificar si hay poster
    const poster = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=Sin+Imagen';
    
    // Crear el contenido HTML de la tarjeta
    card.innerHTML = `
        <img src="${poster}" alt="${movie.Title}" class="movie-poster">
        <div class="movie-info">
            <h3 class="movie-title">${movie.Title}</h3>
            <p class="movie-year">Año: ${movie.Year}</p>
            <p class="movie-type">Tipo: ${movie.Type}</p>
            ${movie.tmdbData && movie.tmdbData.trailers.length > 0 ? 
                '<p class="movie-trailer">🎬 Trailer disponible</p>' : ''}
            <button class="btn-read-more" data-movie='${JSON.stringify(movie)}'>Leer más</button>
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
    
    // Preparar los géneros (si existen)
    let genresHTML = '';
    if (movie.tmdbData && movie.tmdbData.genres.length > 0) {
        const genreNames = movie.tmdbData.genres.map(g => g.name).join(', ');
        genresHTML = `<p><strong>Géneros:</strong> ${genreNames}</p>`;
    }
    
    // Preparar la duración (si existe)
    let runtimeHTML = '';
    if (movie.tmdbData && movie.tmdbData.runtime) {
        const hours = Math.floor(movie.tmdbData.runtime / 60);
        const minutes = movie.tmdbData.runtime % 60;
        runtimeHTML = `<p><strong>Duración:</strong> ${hours}h ${minutes}min</p>`;
    }
    
    // Preparar la puntuación (si existe)
    let ratingHTML = '';
    if (movie.tmdbData && movie.tmdbData.rating !== 'N/A') {
        ratingHTML = `<p><strong>Puntuación TMDb:</strong> ⭐ ${movie.tmdbData.rating}/10</p>`;
    }
    
    // Preparar el resumen (si existe)
    let overviewHTML = '';
    if (movie.tmdbData && movie.tmdbData.overview) {
        overviewHTML = `
            <div class="modal-overview">
                <h3>Resumen:</h3>
                <p>${movie.tmdbData.overview}</p>
            </div>
        `;
    }
    
    // HTML del reparto (si existe)
    let castHTML = '';
    if (movie.tmdbData && movie.tmdbData.cast.length > 0) {
        castHTML = '<div class="modal-cast"><h3>Reparto Principal:</h3><div class="cast-list">';
        movie.tmdbData.cast.forEach(actor => {
            const actorPhoto = actor.profile_path 
                ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` 
                : 'https://via.placeholder.com/200x300?text=Sin+Foto';
            castHTML += `
                <div class="cast-member">
                    <img src="${actorPhoto}" alt="${actor.name}">
                    <p><strong>${actor.name}</strong></p>
                    <p class="character">${actor.character}</p>
                </div>
            `;
        });
        castHTML += '</div></div>';
    }
    
    // HTML del trailer (si existe)
    let trailerHTML = '';
    if (movie.tmdbData && movie.tmdbData.trailers.length > 0) {
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
                    allowfullscreen>
                </iframe>
            </div>
        `;
    }
    
    // Crear el contenido del modal con toda la información
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            <div class="modal-body">
                <img src="${poster}" alt="${movie.Title}" class="modal-poster">
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
    
    // Evento para cerrar el modal al hacer click en la X
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    // Evento para cerrar el modal al hacer click fuera del contenido
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// ===================================
// FUNCIÓN DE BÚSQUEDA
// ===================================

// Función que realiza la búsqueda de películas según el término del usuario
async function searchMovies(searchTerm) {
    const postsContainer = document.getElementById('posts');
    const moviesGrid = postsContainer.querySelector('.movies-grid');
    const messageDiv = postsContainer.querySelector('.search-message');
    
    // Validar que hay un término de búsqueda
    if (!searchTerm || searchTerm.trim() === '') {
        messageDiv.textContent = 'Por favor, introduce un término de búsqueda.';
        messageDiv.className = 'search-message error';
        return;
    }
    
    // Mostrar mensaje de carga
    messageDiv.textContent = 'Buscando películas...';
    messageDiv.className = 'search-message loading';
    moviesGrid.innerHTML = '';
    
    try {
        // Obtener películas de OMDB (Primera API)
        const movies = await fetchMovies(searchTerm, OMDB_API_KEY);
        
        // Verificar si se obtuvieron películas
        if (movies.length === 0) {
            messageDiv.textContent = `No se encontraron películas con "${searchTerm}".`;
            messageDiv.className = 'search-message error';
            return;
        }
        
        // Tomar solo las primeras MAX_MOVIES
        const limitedMovies = movies.slice(0, MAX_MOVIES);
        
        // Ocultar mensaje de carga
        messageDiv.textContent = '';
        messageDiv.className = 'search-message';
        
        // Para cada película de OMDB, obtener datos de TMDb (Segunda API - ENCADENANDO PROMESAS)
        const moviesWithTMDbData = await Promise.all(
            limitedMovies.map(async (movie) => {
                // Buscar la película en TMDb usando su título
                const tmdbId = await searchMovieInTMDb(movie.Title, TMDB_API_KEY);
                
                // Si se encuentra en TMDb, obtener videos y reparto
                if (tmdbId) {
                    const tmdbData = await fetchTMDbDetails(tmdbId, TMDB_API_KEY);
                    // Combinar datos de OMDB con datos de TMDb
                    return {
                        ...movie,
                        tmdbData: tmdbData
                    };
                }
                
                // Si no se encuentra en TMDb, devolver solo los datos de OMDB
                return movie;
            })
        );
        
        // Limpiar el grid
        moviesGrid.innerHTML = '';
        
        // Crear las tarjetas y añadirlas al grid
        moviesWithTMDbData.forEach(movie => {
            const card = createMovieCard(movie);
            moviesGrid.appendChild(card);
        });
        
        // Configurar los eventos de "Leer más"
        const readMoreButtons = moviesGrid.querySelectorAll('.btn-read-more');
        readMoreButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Obtener los datos de la película del atributo data-movie
                const movieData = JSON.parse(button.dataset.movie);
                
                // Mostrar el modal con la información
                showMovieModal(movieData);
            });
        });
        
    } catch (error) {
        console.error('Error al buscar películas:', error);
        messageDiv.textContent = 'Error al buscar películas. Intenta de nuevo más tarde.';
        messageDiv.className = 'search-message error';
    }
}

// ===================================
// FUNCIÓN PRINCIPAL
// ===================================

// Función principal que inicializa el sistema de posts
function initPosts() {
    // Obtener el contenedor donde se mostrarán las películas
    const postsContainer = document.getElementById('posts');
    
    // Crear la interfaz de búsqueda
    postsContainer.innerHTML = `
        <div class="search-container">
            <h2>Buscar Películas 🎬</h2>
            <div class="search-box">
                <input 
                    type="text" 
                    id="search-input" 
                    placeholder="Escribe el nombre de una película (ej: batman, avengers, harry potter...)" 
                    class="search-input">
                <button id="search-btn" class="search-btn">Buscar</button>
            </div>
            <p class="search-message"></p>
        </div>
        <div class="movies-grid"></div>
    `;
    
    // Obtener elementos
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    // Evento del botón de búsqueda
    searchBtn.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim();
        searchMovies(searchTerm);
    });
    
    // Evento para buscar al presionar Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = searchInput.value.trim();
            searchMovies(searchTerm);
        }
    });
    
    // Búsqueda inicial por defecto (opcional - puedes comentar estas líneas)
    searchInput.value = 'marvel';
    searchMovies('marvel');
}

// Exportar la función para usarla en main.js
export { initPosts };