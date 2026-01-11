// FORMULARIO DE REGISTRO CON VALIDACIÓN
// RegExp para nombre y apellidos, email y genero
const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑçÇüÜ\s.·]+$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const VALID_GENDERS = ['hombre', 'mujer'];

// Validar nombre o apellidos
function validateName(value) {
    // En caso que sean espacios en blanco
    if (value.trim() === '') {
        return { valid: false, message: 'Este campo es obligatorio' };
    } // En caso que sean menos de 2 caracteres
    if (value.length < 2) {
        return { valid: false, message: 'Debe tener al menos 2 caracteres' };
    } // En caso que contenga caracteres no permitidos
    if (!NAME_REGEX.test(value)) {
        return { valid: false, message: 'Solo se permiten letras, espacios, acentos, ñ, ç, ü y puntos' };
    }
    return { valid: true, message: '' };
}

// Validar email
function validateEmail(value) {
    // En caso que sean espacios en blanco
    if (value.trim() === '') {
        return { valid: false, message: 'El email es obligatorio' };
    }
    // Contar cuántas @ tiene
    const atCount = (value.match(/@/g) || []).length;
    if (atCount !== 1) {
        return { valid: false, message: 'Debe contener exactamente una @' };
    } // En caso que contenga caracteres no permitidos
    if (!EMAIL_REGEX.test(value)) {
        return { valid: false, message: 'Formato de email inválido' };
    }
    return { valid: true, message: '' };
}

// Validar género
function validateGender(value) {
    // En caso que sean espacios en blanco
    if (value === '') {
        return { valid: false, message: 'Debe seleccionar un género' };
    } // En caso que no sean generos validos
    if (!VALID_GENDERS.includes(value)) {
        return { valid: false, message: 'Opción de género no válida' };
    }
    return { valid: true, message: '' };
}

// Validar fecha de nacimiento
function validateDate(value) {
    // En caso que sean espacios en blanco
    if (value === '') {
        return { valid: false, message: 'La fecha de nacimiento es obligatoria' };
    }
    
    // Convertir la fecha a objeto Date
    const birthDate = new Date(value);
    const today = new Date();
    
    // Calcular edad
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Ajustar si aún no ha cumplido años este año
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    // Validar que sea mayor de edad
    if (age < 18) {
        return { valid: false, message: 'Debes ser mayor de 18 años' };
    }
    
    // Validar que la fecha no sea futura
    if (birthDate > today) {
        return { valid: false, message: 'La fecha no puede ser futura' };
    }
    
    // Validar que no sea demasiado antigua (más de 120 años)
    if (age > 120) {
        return { valid: false, message: 'Fecha no válida' };
    }
    
    return { valid: true, message: '' };
}

// Calcular edad a partir de la fecha de nacimiento
function calculateAge(birthDate) {
    // En caso que sean espacios en blanco
    if (!birthDate) return '';
    // Convertir la fecha a objeto Date
    const birth = new Date(birthDate);
    const today = new Date();
    // Calcular edad
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    // Ajustar si aún no ha cumplido años este año
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

// FUNCIONES DE UI
// Mostrar error en un campo
function showError(fieldId, message) {
    // Obtener el campo y el span de error
    const field = document.getElementById(fieldId);
    const errorSpan = document.getElementById(`${fieldId}-error`);
    
    // Añadir clase de error al campo
    field.classList.add('field-error');
    field.classList.remove('field-success');
    
    // Mostrar mensaje de error
    errorSpan.textContent = message;
    errorSpan.style.display = 'block';
}

// Mostrar éxito en un campo
function showSuccess(fieldId) {
    // Obtener el campo y el span de error
    const field = document.getElementById(fieldId);
    const errorSpan = document.getElementById(`${fieldId}-error`);
    
    // Añadir clase de éxito al campo
    field.classList.add('field-success');
    field.classList.remove('field-error');
    
    // Ocultar mensaje de error
    errorSpan.textContent = '';
    errorSpan.style.display = 'none';
}

// Limpiar estilos de validación de un campo
function clearValidation(fieldId) {
    // Obtener el campo y el span de error
    const field = document.getElementById(fieldId);
    const errorSpan = document.getElementById(`${fieldId}-error`);
    
    field.classList.remove('field-error', 'field-success');
    errorSpan.textContent = '';
    errorSpan.style.display = 'none';
}

// Comprobar si todos los campos son válidos
function checkAllFieldsValid() {
    // Obtener los valores de los campos
    const nombre = document.getElementById('nombre').value;
    const apellidos = document.getElementById('apellidos').value;
    const email = document.getElementById('email').value;
    const genero = document.getElementById('genero').value;
    const fechaNacimiento = document.getElementById('fecha-nacimiento').value;
    
    // Validar cada campo
    const nombreValid = validateName(nombre).valid;
    const apellidosValid = validateName(apellidos).valid;
    const emailValid = validateEmail(email).valid;
    const generoValid = validateGender(genero).valid;
    const fechaValid = validateDate(fechaNacimiento).valid;
    
    // El botón enviar solo se activa si TODOS los campos son válidos
    const submitBtn = document.getElementById('submit-btn');
    if (nombreValid && apellidosValid && emailValid && generoValid && fechaValid) {
        submitBtn.disabled = false;
        submitBtn.classList.add('btn-enabled');
    } else {
        submitBtn.disabled = true;
        submitBtn.classList.remove('btn-enabled');
    }
}

// FUNCIÓN DE ENVÍO DEL FORMULARIO
// Enviar datos a la API
async function submitForm(event) {
    event.preventDefault(); // Prevenir recarga de página
    
    // Obtener los valores del formulario
    const nombre = document.getElementById('nombre').value;
    const apellidos = document.getElementById('apellidos').value;
    const email = document.getElementById('email').value;
    const genero = document.getElementById('genero').value;
    const fechaNacimiento = document.getElementById('fecha-nacimiento').value;
    const edad = document.getElementById('edad').value;
    
    // Preparar los datos para enviar
    const userData = {
        firstName: nombre,
        lastName: apellidos,
        email: email,
        gender: genero,
        birthDate: fechaNacimiento,
        age: parseInt(edad)
    };
    
    // Mostrar mensaje de carga
    const messageDiv = document.getElementById('form-message');
    messageDiv.textContent = 'Enviando datos...';
    messageDiv.className = 'form-message loading';
    messageDiv.style.display = 'block';
    
    try {
        // Hacer petición POST a dummyjson
        const response = await fetch('https://dummyjson.com/users/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        // Convertir respuesta a JSON
        const data = await response.json();
        
        // Verificar si la petición fue exitosa
        if (response.ok) {
            // Mostrar mensaje de éxito
            messageDiv.textContent = '✓ Usuario dado de alta correctamente';
            messageDiv.className = 'form-message success';
            
            // Limpiar el formulario después de 2 segundos
            setTimeout(() => {
                document.getElementById('registro-form').reset();
                clearValidation('nombre');
                clearValidation('apellidos');
                clearValidation('email');
                clearValidation('genero');
                clearValidation('fecha-nacimiento');
                document.getElementById('edad').value = '';
                checkAllFieldsValid();
                messageDiv.style.display = 'none';
            }, 3000);
        } else {
            throw new Error('Error en la respuesta del servidor');
        }
    } catch (error) {
        // Mostrar mensaje de error
        console.error('Error al enviar el formulario:', error);
        messageDiv.textContent = '✗ Error al dar de alta el usuario. Inténtalo de nuevo.';
        messageDiv.className = 'form-message error';
    }
}

// FUNCIÓN PRINCIPAL
// Crear el HTML del formulario
function createFormHTML() {
    const registroContainer = document.getElementById('registro');
    // Crear el HTML del formulario
    registroContainer.innerHTML = `
        <div class="form-container">
            <h2>Formulario de Registro</h2>
            
            <form id="registro-form" novalidate>
                <!-- Nombre -->
                <div class="form-group">
                    <label for="nombre">Nombre: <span class="required">*</span></label>
                    <input type="text" id="nombre" name="nombre" autocomplete="off">
                    <span class="error-message" id="nombre-error"></span>
                </div>
                
                <!-- Apellidos -->
                <div class="form-group">
                    <label for="apellidos">Apellidos: <span class="required">*</span></label>
                    <input type="text" id="apellidos" name="apellidos" autocomplete="off">
                    <span class="error-message" id="apellidos-error"></span>
                </div>
                
                <!-- Email -->
                <div class="form-group">
                    <label for="email">Email: <span class="required">*</span></label>
                    <input type="email" id="email" name="email" autocomplete="off">
                    <span class="error-message" id="email-error"></span>
                </div>
                
                <!-- Género -->
                <div class="form-group">
                    <label for="genero">Género: <span class="required">*</span></label>
                    <select id="genero" name="genero">
                        <option value="">Selecciona una opción</option>
                        <option value="hombre">Hombre</option>
                        <option value="mujer">Mujer</option>
                    </select>
                    <span class="error-message" id="genero-error"></span>
                </div>
                
                <!-- Fecha de Nacimiento -->
                <div class="form-group">
                    <label for="fecha-nacimiento">Fecha de Nacimiento: <span class="required">*</span></label>
                    <input type="date" id="fecha-nacimiento" name="fecha-nacimiento">
                    <span class="error-message" id="fecha-nacimiento-error"></span>
                </div>
                
                <!-- Edad (calculada automáticamente, no editable) -->
                <div class="form-group">
                    <label for="edad">Edad:</label>
                    <input type="number" id="edad" name="edad" readonly disabled>
                </div>
                
                <!-- Botón de envío (desactivado por defecto) -->
                <button type="submit" id="submit-btn" class="submit-btn" disabled>Enviar</button>
                
                <!-- Mensaje de resultado -->
                <div id="form-message" class="form-message"></div>
            </form>
        </div>
    `;
}

// Configurar eventos del formulario
function setupFormEvents() {
    const form = document.getElementById('registro-form');
    
    // Campo: Nombre
    const nombreField = document.getElementById('nombre');
    nombreField.addEventListener('blur', () => {
        const result = validateName(nombreField.value);
        if (!result.valid) {
            showError('nombre', result.message);
        } else {
            showSuccess('nombre');
        }
        checkAllFieldsValid();
    });
    nombreField.addEventListener('input', () => {
        if (nombreField.classList.contains('field-error')) {
            const result = validateName(nombreField.value);
            if (result.valid) {
                showSuccess('nombre');
                checkAllFieldsValid();
            }
        }
    });
    
    // Campo: Apellidos
    const apellidosField = document.getElementById('apellidos');
    apellidosField.addEventListener('blur', () => {
        const result = validateName(apellidosField.value);
        if (!result.valid) {
            showError('apellidos', result.message);
        } else {
            showSuccess('apellidos');
        }
        checkAllFieldsValid();
    });
    apellidosField.addEventListener('input', () => {
        if (apellidosField.classList.contains('field-error')) {
            const result = validateName(apellidosField.value);
            if (result.valid) {
                showSuccess('apellidos');
                checkAllFieldsValid();
            }
        }
    });
    
    // Campo: Email
    const emailField = document.getElementById('email');
    emailField.addEventListener('blur', () => {
        const result = validateEmail(emailField.value);
        if (!result.valid) {
            showError('email', result.message);
        } else {
            showSuccess('email');
        }
        checkAllFieldsValid();
    });
    emailField.addEventListener('input', () => {
        if (emailField.classList.contains('field-error')) {
            const result = validateEmail(emailField.value);
            if (result.valid) {
                showSuccess('email');
                checkAllFieldsValid();
            }
        }
    });
    
    // Campo: Género
    const generoField = document.getElementById('genero');
    generoField.addEventListener('change', () => {
        const result = validateGender(generoField.value);
        if (!result.valid) {
            showError('genero', result.message);
        } else {
            showSuccess('genero');
        }
        checkAllFieldsValid();
    });
    
    // Campo: Fecha de Nacimiento (también calcula la edad automáticamente)
    const fechaNacimientoField = document.getElementById('fecha-nacimiento');
    fechaNacimientoField.addEventListener('change', () => {
        const result = validateDate(fechaNacimientoField.value);
        if (!result.valid) {
            showError('fecha-nacimiento', result.message);
            document.getElementById('edad').value = '';
        } else {
            showSuccess('fecha-nacimiento');
            // Calcular y mostrar la edad automáticamente
            const edad = calculateAge(fechaNacimientoField.value);
            document.getElementById('edad').value = edad;
        }
        checkAllFieldsValid();
    });
    
    // Evento de envío del formulario
    form.addEventListener('submit', submitForm);
}

// Función principal de inicialización
function initForm() {
    // Crear el HTML del formulario
    createFormHTML();
    
    // Configurar todos los eventos
    setupFormEvents();
}

// Exportar la función para usarla en main.js
export { initForm };