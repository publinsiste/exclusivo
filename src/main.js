import './style.css'; 

// Estado global alimentado por el servidor
let DB = { escorts: [] }; 
const app = document.querySelector('#app');

// --- CARGA DE DATOS ---
async function cargarDatos() {
  try {
    const respuesta = await fetch('/api/obtener-escorts.php');
    if (!respuesta.ok) throw new Error("No se pudo conectar con la BD");
    DB = await respuesta.json();
    mostrarLogin(); // Una vez cargados los datos, mostramos el login
  } catch (error) {
    app.innerHTML = `<div class="contenedor"><p>Error: ${error.message}</p></div>`;
  }
}

// --- VISTAS ---
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
        <div class="ficha-modelo">
          <div style="font-size: 3rem; color: #333;">👤</div>
          <h2 class="titulo">${m.nombre}</h2>
          <button class="btn-gold btn-reservar" data-id="${m.id}">Reservar Cita</button>
        </div>
      `).join('')}
    </div>
  `;
}

function mostrarCalendario(escortId, diaIndex = 0) {
  const escort = DB.escorts.find(m => m.id === escortId);
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

// --- DELEGACIÓN DE EVENTOS (Unificada para evitar errores) ---

app.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-volver')) mostrarCatalogo();
  if (e.target.classList.contains('btn-reservar')) mostrarCalendario(e.target.dataset.id);

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

// Arrancar el sistema
cargarDatos();
