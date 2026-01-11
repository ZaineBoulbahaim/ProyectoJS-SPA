// Referencias a las manecillas y a la hora digital
let manecillaHora;
let manecillaMinuto;
let manecillaSegundo;
let horaDigital;


// crearReloj()
// Crea la estructura HTML del reloj
export function crearReloj() {
    const seccionReloj = document.getElementById('reloj');

    // Contenedor principal del reloj
    const reloj = document.createElement('div');
    reloj.id = 'reloj-analogico';

    // Manecilla de la hora
    manecillaHora = document.createElement('div');
    manecillaHora.className = 'manecilla hora';

    // Manecilla de los minutos
    manecillaMinuto = document.createElement('div');
    manecillaMinuto.className = 'manecilla minuto';

    // Manecilla de los segundos
    manecillaSegundo = document.createElement('div');
    manecillaSegundo.className = 'manecilla segundo';

    // Punto central del reloj
    const centro = document.createElement('div');
    centro.className = 'centro';

    // Añadimos todo al reloj
    reloj.appendChild(manecillaHora);
    reloj.appendChild(manecillaMinuto);
    reloj.appendChild(manecillaSegundo);
    reloj.appendChild(centro);

    // Crear números del 1 al 12
    for (let i = 1; i <= 12; i++) {
        const numero = document.createElement('div');
        numero.className = 'numero-reloj';
        numero.textContent = i;

        // Cálculo de posición circular
        const angulo = (i * 30 - 90) * Math.PI / 180;
        const radio = 119;
        const x = 150 + radio * Math.cos(angulo);
        const y = 150 + radio * Math.sin(angulo);

        numero.style.left = `${x - 10}px`;
        numero.style.top = `${y - 10}px`;

        reloj.appendChild(numero);
    }

    // Hora digital
    horaDigital = document.createElement('div');
    horaDigital.id = 'hora-digital';

    seccionReloj.appendChild(reloj);
    seccionReloj.appendChild(horaDigital);

    // Primera actualización inmediata
    actualizarReloj();
}


// actualizarReloj()
// Calcula y aplica la hora actual
export function actualizarReloj() {
    const ahora = new Date();

    const horas = ahora.getHours();
    const minutos = ahora.getMinutes();
    const segundos = ahora.getSeconds();

    // Cálculo de rotaciones
    const gradosHora = (horas % 12) * 30 + minutos * 0.5;
    const gradosMinuto = minutos * 6;
    const gradosSegundo = segundos * 6;

    manecillaHora.style.transform = `rotate(${gradosHora}deg)`;
    manecillaMinuto.style.transform = `rotate(${gradosMinuto}deg)`;
    manecillaSegundo.style.transform = `rotate(${gradosSegundo}deg)`;

    // Hora digital HH:MM:SS
    horaDigital.textContent = 
        `${String(horas).padStart(2, '0')}:` +
        `${String(minutos).padStart(2, '0')}:` +
        `${String(segundos).padStart(2, '0')}`;
}

 
// iniciarReloj()
// Inicia el reloj y su actualización
export function iniciarReloj() {
    crearReloj();

    // Actualización cada 5 segundos
    setInterval(actualizarReloj, 5000);
}
