// Importar funciones de otros módulos
import { initSlider } from './slider.js';
import { initThemes } from './themes.js';
import { initScrollButton } from './scroll.js';
import { initPosts } from './posts.js';
import { iniciarReloj } from './clock.js';
import { initForm } from './form.js';
import { initQuiz } from './quiz.js';

// Mostrar sección y ocultar las demás
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section-content');
    sections.forEach(section => section.classList.remove('active'));

    const activeSection = document.getElementById(sectionId);
    if (activeSection) activeSection.classList.add('active');

    // Guardar la sección activa
    localStorage.setItem('activeSection', sectionId);
}
// Configurar navegación SPA
function setupNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const sectionId = link.dataset.section;
            showSection(sectionId);
        });
    });
}

// Función principal de inicialización
function init() {
    initSlider();         // Inicializa slider
    setupNavigation();    // Configura navegación SPA
    // Recuperar sección guardada o mostrar 'posts' por defecto
    const savedSection = localStorage.getItem('activeSection') || 'posts';
    showSection(savedSection);
    initThemes();         // Cambio de temas
    initScrollButton();   // Botón scroll arriba
    initPosts();          // Inicializa posts
    iniciarReloj();       // Inicializa el reloj analógico y digital
    initForm();           // Inicializa el formulario
    initQuiz();           // Inicializa el quiz
}

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', init);