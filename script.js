/* =========================================================
   JUEGO DE MEMORIA — lógica completa
   Estados: boca abajo → volteada → pareja / error
   ========================================================= */

// ---------- 1. DATOS DEL JUEGO ----------
const EMOJIS = ["🐶", "🐱", "🦊", "🐼", "🦁", "🐸", "🐵", "🦄", "🐮", "🐷", "🐔", "🐧", "🦜", "🐠", "🦀", "🦋", "🐙", "🦉"];
const TIEMPO_ESPERA = 700; // ms que quedan visibles dos cartas

// Niveles de dificultad: cuántos pares y cuántas columnas usa el tablero
const NIVELES = {
  facil:   { columnas: 4, parejas: 8 },
  dificil: { columnas: 6, parejas: 18 }
};
let nivelActual = "facil";

// ---------- 2. ESTADO ----------
let cartas = [];          // arreglo con las cartas barajadas
let primeraCarta = null;  // referencia a la 1ª carta volteada
let segundaCarta = null;  // referencia a la 2ª carta volteada
let bloqueo = false;      // evita girar 3 cartas seguidas
let intentos = 0;
let parejas = 0;

// temporizador
let segundos = 0;
let intervalo = null;
let tiempoIniciado = false;

// ---------- 3. ELEMENTOS DEL DOM ----------
const tablero      = document.getElementById("tablero");
const btnReiniciar = document.getElementById("btn-reiniciar");
const victoria     = document.getElementById("victoria");
const btnOtra      = document.getElementById("btn-jugar-otra");
const etiIntentos  = document.getElementById("intentos");
const etiTiempos   = document.getElementById("tiempo");
const etiParejas   = document.getElementById("parejas");
const resumen      = document.getElementById("resumen");
const btnFacil     = document.getElementById("btn-facil");
const btnDificil   = document.getElementById("btn-dificil");
const btnTema      = document.getElementById("btn-tema");

// Devuelve la cantidad de parejas del nivel actual
function totalParejas() {
  return NIVELES[nivelActual].parejas;
}

// ---------- 4. FUNCIONES AUXILIARES ----------

// Barajado aleatorio (algoritmo de Fisher-Yates)
function barajar(arreglo) {
  for (let i = arreglo.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arreglo[i], arreglo[j]] = [arreglo[j], arreglo[i]];
  }
  return arreglo;
}

// Formatea segundos a "m:ss"
function formatoTiempo(total) {
  const min = Math.floor(total / 60);
  const seg = String(total % 60).padStart(2, "0");
  return `${min}:${seg}`;
}

// Actualiza el marcador en pantalla
function actualizarMarcador() {
  etiIntentos.textContent = intentos;
  etiParejas.textContent  = `${parejas}/${totalParejas()}`;
  etiTiempos.textContent   = formatoTiempo(segundos);
}

// ---------- 5. TEMPORIZADOR ----------
function iniciarTiempo() {
  if (tiempoIniciado) return;          // solo arranca una vez
  tiempoIniciado = true;
  intervalo = setInterval(() => {
    segundos++;
    etiTiempos.textContent = formatoTiempo(segundos);
  }, 1000);
}

function detenerTiempo() {
  clearInterval(intervalo);
}

// ---------- 6. RENDER DEL TABLERO ----------
function pintarTablero() {
  tablero.innerHTML = "";                          // limpia el tablero
  tablero.style.setProperty("--columnas", NIVELES[nivelActual].columnas);

  cartas.forEach((emoji, indice) => {
    const tarjeta = document.createElement("button");
    tarjeta.type = "button";
    tarjeta.classList.add("tarjeta");
    tarjeta.textContent = emoji;
    tarjeta.dataset.indice = indice;   // identificador del DOM
    tarjeta.setAttribute("aria-label", "Carta boca abajo");
    tarjeta.addEventListener("click", () => voltear(tarjeta));
    tablero.appendChild(tarjeta);
  });
}

// ---------- 7. VOLTEAR Y VERIFICAR ----------
function voltear(tarjeta) {
  // Reglas de bloqueo: no girar si...
  if (bloqueo) return;                                  // hay animación en curso
  if (tarjeta === primeraCarta) return;                 // es la misma carta
  if (tarjeta.classList.contains("volteada")) return;   // ya está girada

  tarjeta.classList.add("volteada");
  tarjeta.setAttribute("aria-label", tarjeta.textContent);

  if (!primeraCarta) {
    primeraCarta = tarjeta;         // es la primera carta de la jugada
    iniciarTiempo();                // el tiempo arranca aquí
    return;
  }

  segundaCarta = tarjeta;
  intentos++;
  actualizarMarcador();

  verificar();
}

function verificar() {
  const esPareja = primeraCarta.textContent === segundaCarta.textContent;

  if (esPareja) {
    // Se queda el "glow" verde y ya no se puede volver a tocar
    primeraCarta.classList.add("pareada");
    segundaCarta.classList.add("pareada");
    primeraCarta.setAttribute("aria-label", "Pareja de " + primeraCarta.textContent);
    segundaCarta.setAttribute("aria-label", "Pareja de " + segundaCarta.textContent);

    parejas++;
    reiniciarJugada();
    actualizarMarcador();

    if (parejas === totalParejas()) victoriaFinal();    // mensaje de victoria

  } else {
    bloqueo = true;                        // bloquea mientras se ven las 2 cartas
    const cartaA = primeraCarta;           // se guardan por si reinician el juego
    const cartaB = segundaCarta;
    cartaA.classList.add("error");
    cartaB.classList.add("error");

    setTimeout(() => {
      if (!cartaA.isConnected) return;     // el tablero ya se repintó
      // Se dan la vuelta otra vez
      cartaA.classList.remove("volteada", "error");
      cartaB.classList.remove("volteada", "error");
      cartaA.setAttribute("aria-label", "Carta boca abajo");
      cartaB.setAttribute("aria-label", "Carta boca abajo");
      reiniciarJugada();
    }, TIEMPO_ESPERA);
  }
}

// Limpia las referencias de la jugada actual
function reiniciarJugada() {
  primeraCarta = null;
  segundaCarta = null;
  bloqueo = false;
}

// ---------- 8. VICTORIA + CONFETI ----------
function crearConfeti() {
  const colores = ["#7c3aed", "#22d3ee", "#22c55e", "#f59e0b", "#ef4444", "#ec4899"];

  for (let i = 0; i < 60; i++) {
    const pieza = document.createElement("div");
    pieza.classList.add("confeti");
    pieza.style.left = Math.random() * 100 + "vw";
    pieza.style.background = colores[i % colores.length];
    pieza.style.animationDuration = (2.5 + Math.random() * 2) + "s"; // 2.5s a 4.5s
    pieza.addEventListener("animationend", () => pieza.remove());    // se borra sola
    document.body.appendChild(pieza);
  }
}

function victoriaFinal() {
  detenerTiempo();
  resumen.textContent = `Completaste las ${totalParejas()} parejas con ${intentos} intentos en ${formatoTiempo(segundos)}.`;
  victoria.hidden = false;
  crearConfeti();
}

// ---------- 9. REINICIAR CON BARAJADO ALEATORIO ----------
function reiniciar() {
  detenerTiempo();

  // Resetea todo el estado: toma los pares del nivel y los baraja
  cartas = barajar([...EMOJIS.slice(0, totalParejas()), ...EMOJIS.slice(0, totalParejas())]);
  primeraCarta = null;
  segundaCarta = null;
  bloqueo = false;
  intentos = 0;
  parejas = 0;
  segundos = 0;
  tiempoIniciado = false;

  victoria.hidden = true;
  actualizarMarcador();
  pintarTablero();
}

// ---------- 10. EVENTOS ----------
btnReiniciar.addEventListener("click", reiniciar);
btnOtra.addEventListener("click", reiniciar);

// Cambiar nivel de dificultad (reinicia la partida)
function elegirNivel(nivel) {
  nivelActual = nivel;
  btnFacil.classList.toggle("activo", nivel === "facil");
  btnDificil.classList.toggle("activo", nivel === "dificil");
  reiniciar();
}
btnFacil.addEventListener("click", () => elegirNivel("facil"));
btnDificil.addEventListener("click", () => elegirNivel("dificil"));

// Tema claro / oscuro (se recuerda con localStorage)
function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
  btnTema.textContent = tema === "claro" ? "☀️" : "🌙";
  localStorage.setItem("tema", tema);
}
btnTema.addEventListener("click", () => {
  const actual = document.documentElement.dataset.tema || "oscuro";
  aplicarTema(actual === "oscuro" ? "claro" : "oscuro");
});

// ---------- 11. INICIO ----------
aplicarTema(localStorage.getItem("tema") || "oscuro");
reiniciar();
