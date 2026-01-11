// Función que hace scroll suave hasta la parte superior de la página
function scrollToTop() {
    window.scrollTo({
        top: 0,                    // Posición superior (inicio de la página)
        behavior: 'smooth'         // Scroll suave con animación
    });
}

// Función que muestra u oculta el botón según la posición del scroll
function toggleScrollButton() {
    // Obtener el botón de scroll
    const scrollBtn = document.getElementById('scroll-top');
    
    // Comprobar si el usuario ha hecho scroll más de 300px hacia abajo
    if (window.scrollY > 300) {
        // Mostrar el botón añadiendo la clase 'visible'
        scrollBtn.classList.add('visible');
    } else {
        // Ocultar el botón quitando la clase 'visible'
        scrollBtn.classList.remove('visible');
    }
}

// Función que inicializa el botón de scroll to top
function initScrollButton() {
    // Obtener el botón de scroll
    const scrollBtn = document.getElementById('scroll-top');
    
    // Añadir evento click: al hacer click, volver arriba
    scrollBtn.addEventListener('click', () => {
        scrollToTop();
    });
    
    // Añadir evento scroll al window: cada vez que el usuario hace scroll
    // ejecutar toggleScrollButton para mostrar/ocultar el botón
    window.addEventListener('scroll', () => {
        toggleScrollButton();
    });
    
    // Comprobar la posición inicial al cargar la página
    // por si el usuario ya está abajo cuando carga la página
    toggleScrollButton();
}

// Exportar la función para usarla en main.js
export { initScrollButton };