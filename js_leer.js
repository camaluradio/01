let ttsActiva = false;
let utteranceActual = null;

function esSoportadoTTS() {
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

function agregarBotonesTTS() {
  if (!esSoportadoTTS()) return;

  const posts = document.querySelectorAll('.entry-content'); 
  posts.forEach(post => {
    if (post.querySelector('.tts-button-container')) return;

    const contenedor = document.createElement('div');
    contenedor.className = 'tts-button-container';
    contenedor.style.textAlign = 'center';
    contenedor.style.marginBottom = '10px';

    // Botón principal
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary btn-sm tts-button';
    btn.innerHTML = '<i class="bi bi-play-fill"></i> Leer en voz alta';
    btn.onclick = () => toggleLectura(post, btn);

    // Botón de ayuda
    const ayuda = document.createElement('button');
    ayuda.className = 'btn btn-outline-secondary btn-sm ms-2';
    ayuda.innerHTML = '?';
    ayuda.setAttribute('data-bs-toggle', 'modal');
    ayuda.setAttribute('data-bs-target', '#modalVoces');

    contenedor.appendChild(btn);
    contenedor.appendChild(ayuda);
    post.insertBefore(contenedor, post.firstChild);
  });
}

function toggleLectura(postElement, btn) {
  if (!ttsActiva) {
    btn.innerHTML = '<i class="bi bi-arrow-clockwise tts-loading-icon"></i> Cargando…';
    leerPost(postElement, btn);
  } else {
    detenerLectura(postElement, btn);
  }
}

function leerPost(postElement, btn) {
  detenerLectura(postElement, btn, false);
  ttsActiva = true;

  const texto = Array.from(postElement.childNodes)
    .filter(n => !n.classList || !n.classList.contains('tts-button-container'))
    .map(n => n.innerText || n.textContent)
    .join(' ')
    .trim();

  const frases = texto.match(/[^.!?]+[.!?]?/g) || [texto];
  let index = 0;

  const voces = speechSynthesis.getVoices();
  const vozSeleccionada = voces.find(v => v.lang === 'es-AR') || voces.find(v => v.lang.startsWith('es')) || null;

  function leerFrase() {
    if (!ttsActiva || index >= frases.length) {
      limpiarResaltadoPost(postElement);
      btn.innerHTML = '<i class="bi bi-play-fill"></i> Leer en voz alta';
      ttsActiva = false;
      return;
    }

    const frase = frases[index].trim();
    if (!frase) { index++; leerFrase(); return; }

    resaltarFraseVisual(postElement, frase);

    utteranceActual = new SpeechSynthesisUtterance(frase);
    utteranceActual.voice = vozSeleccionada;
    utteranceActual.lang = 'es';
    utteranceActual.rate = 1;
    utteranceActual.pitch = 1;

    utteranceActual.onstart = () => {
      if (index === 0) btn.innerHTML = '<i class="bi bi-stop-fill"></i> Detener';
    };

    utteranceActual.onend = () => {
      limpiarResaltadoPost(postElement);
      index++;
      setTimeout(leerFrase, 50);
    };

    speechSynthesis.speak(utteranceActual);
  }

  leerFrase();
}

function detenerLectura(postElement, btn, resetBoton = true) {
  ttsActiva = false;
  speechSynthesis.cancel();
  limpiarResaltadoPost(postElement);
  utteranceActual = null;
  if (btn && resetBoton) btn.innerHTML = '<i class="bi bi-play-fill"></i> Leer en voz alta';
}

function resaltarFraseVisual(postElement, frase) {
  limpiarResaltadoPost(postElement); 

  const walker = document.createTreeWalker(postElement, NodeFilter.SHOW_TEXT, null, false);
  let nodo;
  while ((nodo = walker.nextNode())) {
    if (!nodo.nodeValue.trim()) continue;
    if (nodo.parentNode.closest('.tts-button-container')) continue;

    const regex = new RegExp(frase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    if (regex.test(nodo.nodeValue)) {
      const span = document.createElement('span');
      span.className = 'tts-highlight';
      span.style.backgroundColor = 'var(--light)';
      span.textContent = frase;

      const index = nodo.nodeValue.indexOf(frase);
      const afterText = nodo.splitText(index);
      afterText.nodeValue = afterText.nodeValue.substring(frase.length);

      nodo.parentNode.insertBefore(span, afterText);
      break;
    }
  }
}

function limpiarResaltadoPost(postElement) {
  const spans = postElement.querySelectorAll('span.tts-highlight');
  spans.forEach(span => { span.replaceWith(document.createTextNode(span.textContent)); });
}

document.addEventListener('DOMContentLoaded', agregarBotonesTTS);
const observer = new MutationObserver(agregarBotonesTTS);
observer.observe(document.body, { childList: true, subtree: true });
speechSynthesis.onvoiceschanged = () => {};
