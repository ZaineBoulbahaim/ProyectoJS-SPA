import { tns } from '../node_modules/tiny-slider/src/tiny-slider.js';

function initSlider() {

    // Obtener el elemento header donde va el slider
    const header = document.getElementById('slider-header');

    // Crea el HTML del slider con innerHTML
    header.innerHTML = `
        <div class="slider">
            <div> <img src="img/slider/slide1.jpg" alt="Slider 1"></div>
            <div> <img src="img/slider/slide2.jpg" alt="Slider 2"></div>
            <div> <img src="img/slider/slide3.jpg" alt="Slider 3"></div>
            <div> <img src="img/slider/slide4.jpg" alt="Slider 4"></div>
        </div>
    `;

    // Inicializar tiny-slider con su configuración
    tns({
        container: '.slider',              // Selector CSS del contenedor del slider
        items: 1,                          // Cuántas imágenes mostrar a la vez (1 = una sola)
        slideBy: 1,                        // Cuántas imágenes avanzar al hacer clic (1 = de una en una)
        autoplay: true,                    // Activar cambio automático
        autoplayTimeout: 3000,             // Tiempo entre cambios (3000ms = 3 segundos)
        controlsText: ['←', '→'],
        speed: 400,                        // Velocidad de la transición (400ms)
        controls: true,                    // Mostrar botones de anterior/siguiente
        nav: false,                         // Np mostrar puntos de navegación abajo
        autoplayButtonOutput: false        // Ocultar el botón de play/pause
    })
}

// Exportar la función para usarla en main.js
export {initSlider };