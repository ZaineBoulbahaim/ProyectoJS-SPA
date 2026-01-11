
// SISTEMA DE QUIZ INTERACTIVO
// URL de la API de Open Trivia Database (10 preguntas de animales)
const QUIZ_API_URL = 'https://opentdb.com/api.php?amount=10&category=11&type=multiple&difficulty=medium';

// Variable global para almacenar las preguntas del quiz
let quizQuestions = [];

// Variable para almacenar las respuestas del usuario
let userAnswers = {};


// FUNCIONES DE OBTENCIÓN DE DATOS
// Función que obtiene las preguntas del quiz desde la API
async function fetchQuizQuestions() {
    try {
        // Hacer petición a la API
        const response = await fetch(QUIZ_API_URL);
        
        // Convertir respuesta a JSON
        const data = await response.json();
        
        // Verificar que la respuesta sea exitosa
        if (data.response_code === 0) {
            return data.results;
        } else {
            throw new Error('Error al obtener las preguntas');
        }
    } catch (error) {
        console.error('Error al cargar el quiz:', error);
        return [];
    }
}


// FUNCIONES DE UTILIDAD
// Decodificar entidades HTML (la API devuelve caracteres codificados)
function decodeHTML(html) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = html;
    return textArea.value;
}

// Mezclar array aleatoriamente (algoritmo Fisher-Yates)
function shuffleArray(array) {
    const shuffled = [...array]; // Crear copia del array
    for (let i = shuffled.length - 1; i > 0; i--) {
        // Generar índice aleatorio
        const j = Math.floor(Math.random() * (i + 1));
        // Intercambiar elementos
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}


// FUNCIONES DE RENDERIZADO
// Crear el HTML de una pregunta del quiz
function createQuestionHTML(question, index) {
    // Decodificar la pregunta
    const decodedQuestion = decodeHTML(question.question);
    
    // Combinar respuestas correctas e incorrectas
    const allAnswers = [
        question.correct_answer,
        ...question.incorrect_answers
    ];
    
    // Mezclar las respuestas aleatoriamente
    const shuffledAnswers = shuffleArray(allAnswers);
    
    // Crear el HTML de la pregunta
    let questionHTML = `
        <div class="quiz-question" data-question-index="${index}">
            <h3>Pregunta ${index + 1}:</h3>
            <p class="question-text">${decodedQuestion}</p>
            <div class="answers-container">
    `;
    
    // Crear los radio buttons para cada respuesta
    shuffledAnswers.forEach((answer, answerIndex) => {
        const decodedAnswer = decodeHTML(answer);
        const answerId = `q${index}_a${answerIndex}`;
        
        questionHTML += `
            <div class="answer-option">
                <input 
                    type="radio" 
                    id="${answerId}" 
                    name="question_${index}" 
                    value="${decodedAnswer}"
                    data-question-index="${index}">
                <label for="${answerId}">${decodedAnswer}</label>
            </div>
        `;
    });
    
    questionHTML += `
            </div>
            <div class="question-feedback"></div>
        </div>
    `;
    
    return questionHTML;
}

// Renderizar todo el quiz
function renderQuiz(questions) {
    const quizContainer = document.getElementById('quiz');
    
    // Limpiar contenedor
    quizContainer.innerHTML = '<h2>Quiz de Peliculas 🎬</h2>';
    
    // Crear contenedor del formulario
    const quizForm = document.createElement('div');
    quizForm.id = 'quiz-form';
    
    // Añadir cada pregunta
    questions.forEach((question, index) => {
        quizForm.innerHTML += createQuestionHTML(question, index);
    });
    
    // Añadir botón de evaluar (oculto inicialmente)
    quizForm.innerHTML += `
        <button id="evaluate-btn" class="evaluate-btn" style="display: none;">Evaluar</button>
        <div id="quiz-result" class="quiz-result"></div>
    `;
    
    quizContainer.appendChild(quizForm);
}


// FUNCIONES DE EVALUACIÓN
// Comprobar si todas las preguntas han sido respondidas
function checkAllQuestionsAnswered() {
    const totalQuestions = quizQuestions.length;
    const answeredQuestions = Object.keys(userAnswers).length;
    
    // Mostrar u ocultar el botón de evaluar
    const evaluateBtn = document.getElementById('evaluate-btn');
    if (answeredQuestions === totalQuestions) {
        evaluateBtn.style.display = 'block';
    } else {
        evaluateBtn.style.display = 'none';
    }
}

// Evaluar las respuestas del usuario
function evaluateQuiz() {
    let correctAnswers = 0;
    
    // Recorrer cada pregunta y evaluar
    quizQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const correctAnswer = decodeHTML(question.correct_answer);
        
        // Obtener el contenedor de la pregunta
        const questionContainer = document.querySelector(`[data-question-index="${index}"]`);
        const feedbackDiv = questionContainer.querySelector('.question-feedback');
        
        // Obtener todos los radio buttons de esta pregunta
        const radioButtons = questionContainer.querySelectorAll('input[type="radio"]');
        
        // Evaluar si la respuesta es correcta
        if (userAnswer === correctAnswer) {
            correctAnswers++;
            feedbackDiv.innerHTML = '<span class="feedback-correct">✓ Correcto</span>';
            feedbackDiv.className = 'question-feedback feedback-correct-bg';
        } else {
            feedbackDiv.innerHTML = `
                <span class="feedback-incorrect">✗ Incorrecto</span>
                <span class="feedback-correct-answer">Respuesta correcta: ${correctAnswer}</span>
            `;
            feedbackDiv.className = 'question-feedback feedback-incorrect-bg';
        }
        
        // Marcar visualmente cada opción de respuesta
        radioButtons.forEach(radio => {
            const label = questionContainer.querySelector(`label[for="${radio.id}"]`);
            const answerOption = radio.closest('.answer-option');
            
            // Deshabilitar los radio buttons después de evaluar
            radio.disabled = true;
            
            // Si es la respuesta correcta, marcarla en verde
            if (radio.value === correctAnswer) {
                answerOption.classList.add('correct-answer');
            }
            
            // Si es la respuesta del usuario y es incorrecta, marcarla en rojo
            if (radio.checked && radio.value !== correctAnswer) {
                answerOption.classList.add('incorrect-answer');
            }
        });
    });
    
    // Mostrar resultado final
    const resultDiv = document.getElementById('quiz-result');
    const percentage = ((correctAnswers / quizQuestions.length) * 100).toFixed(1);
    
    resultDiv.innerHTML = `
        <h3>Resultado Final</h3>
        <p class="result-score">Has acertado <strong>${correctAnswers}</strong> de <strong>${quizQuestions.length}</strong> preguntas</p>
        <p class="result-percentage">Puntuación: <strong>${percentage}%</strong></p>
        ${percentage >= 70 ? '<p class="result-message success">¡Excelente trabajo! 🎉</p>' : 
          percentage >= 50 ? '<p class="result-message good">¡Bien hecho! 👍</p>' : 
          '<p class="result-message try-again">Sigue intentándolo 💪</p>'}
    `;
    resultDiv.style.display = 'block';
    
    // Ocultar el botón de evaluar
    document.getElementById('evaluate-btn').style.display = 'none';
    
    // Scroll al resultado
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}


// CONFIGURACIÓN DE EVENTOS
// Configurar los eventos de los radio buttons
function setupQuizEvents() {
    const quizForm = document.getElementById('quiz-form');
    
    // Evento para detectar cuando se selecciona una respuesta
    quizForm.addEventListener('change', (e) => {
        if (e.target.type === 'radio') {
            // Guardar la respuesta del usuario
            const questionIndex = parseInt(e.target.dataset.questionIndex);
            userAnswers[questionIndex] = e.target.value;
            
            // Comprobar si todas las preguntas han sido respondidas
            checkAllQuestionsAnswered();
        }
    });
    
    // Evento del botón evaluar
    const evaluateBtn = document.getElementById('evaluate-btn');
    evaluateBtn.addEventListener('click', evaluateQuiz);
}


// FUNCIÓN PRINCIPAL
// Inicializar el quiz
async function initQuiz() {
    const quizContainer = document.getElementById('quiz');
    
    // Mostrar mensaje de carga
    quizContainer.innerHTML = '<p class="loading">Cargando quiz...</p>';
    
    try {
        // Obtener las preguntas desde la API
        const questions = await fetchQuizQuestions();
        
        // Verificar que se obtuvieron preguntas
        if (questions.length === 0) {
            quizContainer.innerHTML = '<p class="error">Error al cargar el quiz. Intenta de nuevo.</p>';
            return;
        }
        
        // Guardar las preguntas globalmente
        quizQuestions = questions;
        
        // Reiniciar respuestas del usuario
        userAnswers = {};
        
        // Renderizar el quiz
        renderQuiz(questions);
        
        // Configurar eventos
        setupQuizEvents();
        
    } catch (error) {
        console.error('Error al inicializar el quiz:', error);
        quizContainer.innerHTML = '<p class="error">Error al cargar el quiz. Intenta de nuevo.</p>';
    }
}

// Exportar la función para usarla en main.js
export { initQuiz };