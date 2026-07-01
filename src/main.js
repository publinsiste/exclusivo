import './style.css';

// Estado global alimentado por el servidor
let DB = { escorts: [] };
const app = document.querySelector('#app');

// --- INICIALIZACIÓN DEL MODAL Y EL VISOR ---
function crearModal() {
  // Modal principal
  const div = document.createElement('div');
  div.id = 'modal-perfil';
  div.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:9999; justify-content:center; align-items:center;';
  div.innerHTML = `
    <div style="background:#1a1a1a; color:white; padding:20px; width:90%; max-width:600px; max-height:80vh; overflow-y:auto; border-radius:10px; position:relative;">
      <span id="cerrar-modal" style="position:absolute; top:10px; right:20px; font-size:30px; cursor:pointer;">&times;</span>
      <div id="contenido-modal"></div>
    </div>
  `;
  document.body.appendChild(div);
  document.getElementById('cerrar-modal').onclick = () => div.style.display = 'none';

  // Visor de zoom (Lightbox)
  const visor = document.createElement('div');
  visor.id = 'visor-zoom';
  visor.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:10000; justify-content:center; align-items:center; cursor:zoom-out;';
  visor.innerHTML = '<img id="img-zoom" style="max-width:90%; max-height:90%; border-radius:5px;">';
  document.body.appendChild(visor);
  
  // Cerrar zoom al clicar en cualquier parte
  visor.onclick = () => visor.style.display = 'none';
}

// Función expuesta globalmente
window.abrirPerfil = async (id) => {
  const modal = document.getElementById('modal-perfil');
  const contenido = document.getElementById('contenido-modal');
  contenido.innerHTML = '<p>Cargando galería...</p>';
  modal.style.display = 'flex';

  try {
    const res = await fetch(`https://publinsiste.com/exclusivo/api/api.php?action=get_perfil&id=${id}`);
    const data = await res.json();
    
    // Generamos las miniaturas con el evento onclick para abrir el zoom
    contenido.innerHTML = `
      <h2 class="titulo">${data.info.nombre}</h2>
      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap:10px; margin-top:15px;">
        ${data.galeria.map(f => `
            <img src="${f.foto_url}" 
                 style="width:100%; border-radius:5px; object-fit:cover; height:120px; cursor:pointer;"
                 onclick="document.getElementById('img-zoom').src='${f.foto_url}'; document.getElementById('visor-zoom').style.display='flex'; event.stopPropagation();">
        `).join('')}
      </div>
    `;
  } catch (err) {
    contenido.innerHTML = '<p>Error al cargar la galería.</p>';
  }
};

// --- CARGA DE DATOS ---
async function cargarDatos() {
  try {
    const respuesta = await fetch('https://publinsiste.com/exclusivo/api/obtener-escorts.php', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
    });
    if (!respuesta.ok) throw new Error(`Error: ${respuesta.status}`);
    DB = await respuesta.json();
    crearModal();
    mostrarLogin();
  } catch (error) {
    app.innerHTML = `<div class="contenedor"><p>Error: ${error.message}</p></div>`;
  }
}

// --- VISTAS (LOGIN, CATÁLOGO, CALENDARIO) ---
// (Estas funciones permanecen igual que las tenías)
function mostrarLogin() {
  app.innerHTML = `
    <div class="contenedor">
      <div class="tarjeta">
        <h1 class="titulo">Acceso Exclusivo</h1>
        <form id="login-form">
          <div class="grupo-input"><input type="text" id="username" placeholder="Usuario" required /></div>
          <div class="grupo-input"><input type="password" id="password" placeholder="Contraseña" required /></div>
          <button type="submit" class="btn-gold">Entrar</button>
        </form>
      </div>
    </div>
  `;
}

function mostrarCatalogo() {
  app.innerHTML = `
    <div class="grid-catalogo">
      ${DB.escorts.map(m => `
        <div class="ficha-modelo" onclick="abrirPerfil(${m.id})" style="cursor:pointer;">
          <img src="${m.foto_url || '/exclusivo/uploads/fotos/default.jpg'}" alt="${m.nombre}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
          <h2 class="titulo">${m.nombre}</h2>
          <p class="descripcion">${m.descripcion || 'Sin descripción disponible.'}</p>
          <p class="tarifa"><strong>Tarifa:</strong> ${m.tarifa} €</p>
          <button class="btn-gold btn-reservar" data-id="${m.id}">Reservar Cita</button>
        </div>
      `).join('')}
    </div>
  `;
}

function mostrarCalendario(escortId, diaIndex = 0) {
  const escort = DB.escorts.find(m => m.id == escortId);
  const hoy = new Date();
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
  const dias = [];
  for (let d = hoy.getDate(); d <= finMes; d++) dias.push(new Date(hoy.getFullYear(), hoy.getMonth(), d));
  
  const slots = [];
  const fechaSeleccionada = dias[diaIndex];
  for (let h = 10; h < 22; h += 2) {
    let f = new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth(), fechaSeleccionada.getDate(), h, 0, 0, 0);
    const iso = f.toISOString().slice(0, 16);
    if (f > hoy && !escort.ocupadas.includes(iso)) slots.push(iso);
  }

  app.innerHTML = `
    <div class="contenedor">
      <div class="tarjeta">
        <h2 class="titulo">${escort.nombre}</h2>
        <select class="btn-gold" id="select-dia" data-id="${escortId}">
          ${dias.map((d, i) => `<option value="${i}" ${i == diaIndex ? 'selected' : ''}>${d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}</option>`).join('')}
        </select>
        <div class="grid-slots">
          ${slots.length > 0 ? slots.map(s => `<div class="slot btn-slot" data-id="${escortId}" data-fecha="${s}">${s.split('T')[1]}</div>`).join('') : '<p>No hay disponibilidad</p>'}
        </div>
        <button class="btn-gold btn-volver">Volver</button>
      </div>
    </div>
  `;
}

// --- DELEGACIÓN DE EVENTOS ---
app.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-volver')) mostrarCatalogo();
  if (e.target.classList.contains('btn-reservar')) {
    e.stopPropagation();
    mostrarCalendario(e.target.dataset.id);
  }
  if (e.target.classList.contains('btn-slot')) {
    const { id, fecha } = e.target.dataset;
    app.innerHTML = `
      <div class="contenedor">
        <div class="tarjeta">
          <h2 class="titulo">Confirmar Reserva</h2>
          <p>Cita: ${fecha.replace('T', ' a las ')}</p>
          <div class="grupo-input"><input type="text" id="nombreCliente" placeholder="Nombre del cliente" required /></div>
          <button class="btn-gold" id="btn-finalizar" data-id="${id}" data-fecha="${fecha}">Confirmar</button>
          <button class="btn-gold btn-volver">Cancelar</button>
        </div>
      </div>
    `;
  }
  if (e.target.id === 'btn-finalizar') {
    const nombre = document.getElementById('nombreCliente').value;
    if (!nombre) return alert("Introduce tu nombre");
    alert(`Cita confirmada para ${nombre}.`);
    mostrarCatalogo();
  }
});

app.addEventListener('change', (e) => {
  if (e.target.id === 'select-dia') mostrarCalendario(e.target.dataset.id, e.target.value);
});

app.addEventListener('submit', (e) => {
  e.preventDefault();
  if (e.target.id === 'login-form') {
    if (document.getElementById('username')?.value === 'admin' && document.getElementById('password')?.value === '123') {
      mostrarCatalogo();
    } else {
      alert("Credenciales incorrectas");
    }
  }
});

cargarDatos();