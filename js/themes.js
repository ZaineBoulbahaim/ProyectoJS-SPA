
// Función que cambia el tema activo
function changeTheme(themeName) {
    // Obtener el elemento link que carga el tema
    const themeLink = document.getElementById('tema');
    // Cambiar el href para cargar el nuevo archivo CSS
    themeLink.href = `css/${themeName}.css`;
    // Guardar el tema seleccionado en localStorage
    localStorage.setItem('theme', themeName);
}

// Función que carga el tema guardado al iniciar la página
function loadSavedTheme() {
    // Obtener el tema guardado de localStorage
    const savedTheme = localStorage.getItem('theme');

    // Si existe, aplicarlo
    if (savedTheme) {
        changeTheme(savedTheme);
    }
}

// Obtener el tema guardado de localStorage
function initThemes() {
    // Cargar el tema guardado al cargar la página
    loadSavedTheme();

    // Agregar un evento de clic a cada botón de tema
    const themeButtons = document.querySelectorAll('#theme-switcher button');
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Obtener el nombre del tema del atributo data-theme
            const themeName = button.getAttribute('data-theme');
            changeTheme(themeName);
        });
    });
}

// Exportar la función para usarla en main.js
export { initThemes };
