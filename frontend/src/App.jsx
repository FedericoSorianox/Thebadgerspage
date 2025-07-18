import React, { useEffect, useState } from "react";
import "./App.css";
import badgersLogo from "./assets/badgers-logo.png";
import { Parallax } from 'react-parallax';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import badgersHeroBg from "./assets/the-badgers-academia.jpeg";
import gymBackground from "./assets/gym-background.jpeg";

const NAV_ITEMS = [
  { label: "Inicio", href: "/#inicio" },
  { label: "Sobre Nosotros", href: "/#sobre" },
  { label: "Clases", href: "/#clases" },
  { label: "Tienda", href: "/tienda" },
  { label: "Galería", href: "/galeria" },
  { label: "Contacto", href: "/#contacto" },
];

function Navbar() {
  const location = useLocation();
  return (
    <nav className="navbar-badgers fixed top-0 left-0 w-full z-50 shadow-xl border-b border-cyan-500/60 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={badgersLogo} alt="Logo The Badgers" className="h-12 w-auto max-w-[56px] object-contain drop-shadow-2xl" />
          <span className="text-2xl font-extrabold text-cyan-300 tracking-wide drop-shadow">The Badgers</span>
        </div>
        <ul className="flex gap-6">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              {item.href.startsWith('/tienda') ? (
                <Link
                  to={item.href}
                  className={`text-cyan-100 font-semibold hover:text-cyan-400 transition-colors duration-200 drop-shadow ${location.pathname === '/tienda' ? 'text-cyan-400' : ''}`}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  href={item.href}
                  className="text-cyan-100 font-semibold hover:text-cyan-400 transition-colors duration-200 drop-shadow"
                >
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section
      id="inicio"
      className="flex items-center justify-center min-h-screen w-full pt-36 pb-10 relative"
      style={{
        backgroundImage: `url(${badgersHeroBg})`,
        backgroundSize: "100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full flex justify-center">
        <div className="rounded-3xl shadow-2xl border-2 border-cyan-900 max-w-md w-full flex flex-col items-center gap-5 px-4 py-10 bg-black/30">
          <img
            src={badgersLogo}
            alt="Logo The Badgers Hero"
            className="max-w-md w-full object-contain drop-shadow-2xl mb-6 animate-bounce"
            style={{ display: 'block' }}
          />
          <div className="bg-black/60 rounded-xl px-4 py-3 w-full flex flex-col items-center">
            <p className="text-xl md:text-2xl text-cyan-300 font-semibold mb-2 text-center animate-fade-in delay-100 drop-shadow">
              Academia de Artes Marciales: Jiu Jitsu & Muay Thai
            </p>
            <p className="text-base md:text-lg text-cyan-100 mb-0 max-w-md text-center animate-fade-in delay-200">
              ¡Entrena con los mejores! Clases para todas las edades y niveles. Disciplina, respeto y superación en un ambiente único.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SobreNosotrosYClases() {
  return (
    <Parallax
      bgImage={gymBackground}
      strength={200}
      bgImageStyle={{ minHeight: '200vh', objectFit: 'cover' }}
    >
      {/* Sección Sobre Nosotros */}
      <section id="sobre" className="flex items-center justify-center min-h-screen w-full py-24">
        <div className="max-w-2xl bg-black/85 rounded-3xl shadow-2xl border-2 border-cyan-900 p-10 text-center backdrop-blur-md animate-fade-in flex flex-col items-center gap-6">
          <h2 className="text-3xl md:text-4xl font-bold text-cyan-200 mb-4 drop-shadow">Sobre Nosotros</h2>
          <p className="text-cyan-100 text-lg leading-relaxed whitespace-pre-line">
            Fundada en 2025 con la misión de crear un ambiente seguro y profesional para la práctica de las artes marciales, The Badgers nació de la pasión por la superación personal. Creemos que el tatami es un laboratorio para la vida, donde se forjan el carácter, el respeto y la resiliencia.
            {'\n'}
            Nuestra filosofía se basa en tres pilares: <span className="font-bold text-cyan-300">Técnica, Comunidad y Crecimiento</span>. Nos esforzamos por ofrecer una instrucción del más alto nivel, al mismo tiempo que fomentamos un fuerte sentido de camaradería entre nuestros miembros.
            {'\n'}
            Te invitamos a ser parte de nuestra historia y a descubrir la mejor versión de ti mismo.
          </p>
        </div>
      </section>

      {/* Sección Clases */}
      <section id="clases" className="flex items-center justify-center min-h-screen w-full py-24">
        <div className="max-w-4xl w-full flex flex-col items-center animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-cyan-200 mb-8 drop-shadow text-center">Clases</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {/* Jiu Jitsu GI */}
            <div className="bg-black/85 rounded-2xl shadow-xl border-2 border-cyan-900 flex flex-col items-center p-7 text-center hover:border-cyan-400 transition-all">
              <img src="https://cdn.evolve-mma.com/wp-content/uploads/2018/09/dlr.jpg" alt="Jiu Jitsu GI" className="w-full h-40 object-cover rounded-xl mb-3" />
              <h3 className="text-xl font-bold text-cyan-200 mb-2">Jiu Jitsu GI</h3>
              <p className="text-cyan-100 text-base">El arte suave. Domina técnicas de control y sumisión en el suelo y de pie. Es una disciplina deportiva y de defensa personal en la cual se utiliza el GI.</p>
            </div>
            {/* Muay Thai */}
            <div className="bg-black/85 rounded-2xl shadow-xl border-2 border-cyan-900 flex flex-col items-center p-7 text-center hover:border-cyan-400 transition-all">
              <img src="https://media.istockphoto.com/id/2149192489/photo/two-young-professional-boxer-having-a-competition-tournament-on-stage-attractive-male-athlete.jpg?s=612x612&w=0&k=20&c=Y9pbrzF3iSuyI4m5chdsabRbX8X2k7Wp11T1EoCpqKE=" alt="Muay Thai" className="w-full h-40 object-cover rounded-xl mb-3" />
              <h3 className="text-xl font-bold text-cyan-200 mb-2">Muay Thai</h3>
              <p className="text-cyan-100 text-base">Combina puños, codos, rodillas y piernas. Conocido como el arte de las ocho extremidades. Arte marcial de origen tailandés. Es una disciplina deportiva y de defensa personal.</p>
            </div>
            {/* Jiu Jitsu No GI */}
            <div className="bg-black/85 rounded-2xl shadow-xl border-2 border-cyan-900 flex flex-col items-center p-7 text-center hover:border-cyan-400 transition-all">
              <img src="https://as2.ftcdn.net/v2/jpg/04/81/31/81/1000_F_481318179_fKQ1ApO31J5owIEqkUh2eFnbVAbrBG1C.jpg" alt="Jiu Jitsu No GI" className="w-full h-40 object-cover rounded-xl mb-3" />
              <h3 className="text-xl font-bold text-cyan-200 mb-2">Jiu Jitsu No GI</h3>
              <p className="text-cyan-100 text-base">Jiu Jitsu sin el uso del GI. Enfocado en técnicas de control y sumisión sin el uniforme. Es una disciplina deportiva y de defensa personal en la cual se utiliza ropa deportiva.</p>
            </div>
          </div>
          {/* Tabla de horarios */}
          <div className="w-full mt-12 flex flex-col items-center">
            <h3 className="text-2xl font-bold text-cyan-200 mb-4">Horarios</h3>
            <div className="overflow-x-auto w-full">
              <table className="min-w-[350px] w-full max-w-4xl mx-auto text-cyan-100 bg-black/80 rounded-xl overflow-hidden shadow-lg">
                <thead>
                  <tr className="bg-cyan-900/80">
                    <th className="py-3 px-2 text-left">Hora</th>
                    <th className="py-3 px-2 text-left">Lunes</th>
                    <th className="py-3 px-2 text-left">Martes</th>
                    <th className="py-3 px-2 text-left">Miércoles</th>
                    <th className="py-3 px-2 text-left">Jueves</th>
                    <th className="py-3 px-2 text-left">Viernes</th>
                    <th className="py-3 px-2 text-left">Sábado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-cyan-900/40">
                    <td className="py-2 px-2">7:30 hs</td>
                    <td className="py-2 px-2">Muay thai</td>
                    <td className="py-2 px-2">Jiu Jitsu GI</td>
                    <td className="py-2 px-2">Muay thai</td>
                    <td className="py-2 px-2">Jiu Jitsu GI</td>
                    <td className="py-2 px-2"></td>
                    <td className="py-2 px-2">Open mat 10:30am</td>
                  </tr>
                  <tr className="border-b border-cyan-900/40">
                    <td className="py-2 px-2">12:00 hs</td>
                    <td className="py-2 px-2">Jiu Jitsu GI</td>
                    <td className="py-2 px-2"></td>
                    <td className="py-2 px-2">Jiu Jitsu GI</td>
                    <td className="py-2 px-2"></td>
                    <td className="py-2 px-2">JJ GI</td>
                    <td className="py-2 px-2"></td>
                  </tr>
                  <tr className="border-b border-cyan-900/40">
                    <td className="py-2 px-2">19:00 hs</td>
                    <td className="py-2 px-2">Muay thai</td>
                    <td className="py-2 px-2">Jiu Jitsu No GI</td>
                    <td className="py-2 px-2">Muay thai</td>
                    <td className="py-2 px-2">Jiu Jitsu No GI</td>
                    <td className="py-2 px-2">Muay thai</td>
                    <td className="py-2 px-2"></td>
                  </tr>
                  <tr className="border-b border-cyan-900/40">
                    <td className="py-2 px-2">20:00 hs</td>
                    <td className="py-2 px-2">Jiu Jitsu GI</td>
                    <td className="py-2 px-2">Muay thai</td>
                    <td className="py-2 px-2">Jiu Jitsu GI</td>
                    <td className="py-2 px-2">Muay thai</td>
                    <td className="py-2 px-2">Jiu Jitsu</td>
                    <td className="py-2 px-2"></td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2"></td>
                    <td className="py-2 px-2"></td>
                    <td className="py-2 px-2"></td>
                    <td className="py-2 px-2"></td>
                    <td className="py-2 px-2"></td>
                    <td className="py-2 px-2"></td>
                    <td className="py-2 px-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </Parallax>
  );
}

function Contacto() {
  return (
    <Parallax
      bgImage="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1500&q=80"
      strength={150}
      bgImageStyle={{ minHeight: '100vh', objectFit: 'cover' }}
    >
      <section id="contacto" className="flex items-center justify-center min-h-screen w-full py-24 bg-black/80">
        <div className="max-w-2xl bg-black/90 rounded-3xl shadow-2xl border-2 border-cyan-900 p-10 text-center backdrop-blur-md animate-fade-in flex flex-col items-center gap-6">
          <h2 className="text-3xl md:text-4xl font-bold text-cyan-200 mb-4 drop-shadow">Contacto</h2>
          <p className="text-lg text-cyan-100 mb-4">¿Listo para comenzar? Reserva tu clase o consúltanos por WhatsApp o Instagram.</p>
          <div className="text-cyan-200 font-bold text-lg mb-2">Cel: <span className="text-cyan-100">092 627 480</span></div>
          <a href="https://www.instagram.com/thebadgers.uy/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-cyan-300 font-bold underline mb-2 hover:text-cyan-400 transition-colors text-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
              <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5a5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5zm5.13.62a1.13 1.13 0 1 1 0 2.25a1.13 1.13 0 0 1 0-2.25z"/>
            </svg>
            Instagram
          </a>
          <a
            href="https://wa.me/59892627480?text=Estoy%20interesado%20en%20tener%20una%20clase%20de%20prueba"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-7 py-3 bg-cyan-500 hover:bg-cyan-400 text-cyan-900 font-bold rounded-full shadow-lg transition-all duration-300 text-base uppercase tracking-wider mt-2 mb-6 border-2 border-cyan-200"
          >
            ¡Reserva tu clase!
          </a>
          <div className="w-full flex justify-center mt-2">
            <iframe
              title="Ubicación The Badgers Academia"
              src="https://www.google.com/maps?q=Academia+The+Badgers&output=embed"
              width="100%"
              height="300"
              style={{ border: 0, borderRadius: '1rem', minWidth: '250px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </Parallax>
  );
}

function ProductoModal({ producto, onClose }) {
  if (!producto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-black rounded-2xl shadow-2xl border-2 border-cyan-900 max-w-md w-full p-6 relative animate-fade-in" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-cyan-300 text-2xl font-bold hover:text-cyan-400">×</button>
        {producto.foto_url ? (
          <img src={producto.foto_url} alt={producto.nombre} className="w-48 h-48 object-contain rounded-xl mx-auto mb-4 bg-black" />
        ) : (
          <div className="w-48 h-48 flex items-center justify-center rounded-xl mx-auto mb-4 bg-cyan-950 text-cyan-300 text-2xl">Sin foto</div>
        )}
        <h2 className="text-2xl font-bold text-cyan-200 text-center mb-2">{producto.nombre}</h2>
        <div className="text-cyan-400 font-semibold text-xl text-center mb-2">${parseFloat(producto.precio_venta).toLocaleString('es-UY', {minimumFractionDigits:2})}</div>
        <div className="text-cyan-100 text-center mb-2">Stock: {producto.stock > 0 ? producto.stock : <span className='text-red-400 font-bold'>Sin stock</span>}</div>
      </div>
    </div>
  );
}

function Tienda() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  useEffect(() => {
    fetch('https://thebadgersadmin.onrender.com/api/productos/')
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar productos');
        return res.json();
      })
      .then(data => setProductos(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-cyan-900 via-cyan-950 to-black font-sans pt-32 flex flex-col items-center px-2">
      <h1 className="text-4xl md:text-5xl font-extrabold text-cyan-200 mb-8 mt-8 drop-shadow-xl text-center tracking-tight animate-fade-in break-words max-w-full">Tienda</h1>
      <p className="text-lg text-cyan-100 mb-8 text-center max-w-xl animate-fade-in">Productos oficiales y seleccionados de The Badgers. ¡Elegí el tuyo!</p>
      {loading && <p className="text-cyan-200 animate-pulse">Cargando productos...</p>}
      {error && <p className="text-red-400">{error}</p>}
      <ProductoModal producto={productoSeleccionado} onClose={() => setProductoSeleccionado(null)} />
      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-16">
        {productos
          .filter(prod => !["Agua Salus", "Alfa Way", "Way Bar", "Power Ade"].includes(prod.nombre))
          .map(prod => (
            <div key={prod.id} className="bg-black/80 rounded-2xl shadow-xl border border-cyan-900 flex flex-col items-center p-5 transition-transform hover:scale-105 hover:border-cyan-400 cursor-pointer" onClick={() => setProductoSeleccionado(prod)}>
              {prod.foto_url ? (
                <img src={prod.foto_url} alt={prod.nombre} className="w-32 h-32 object-contain rounded-xl mb-3 bg-black" />
              ) : (
                <div className="w-32 h-32 flex items-center justify-center rounded-xl mb-3 bg-cyan-950 text-cyan-300 text-2xl">Sin foto</div>
              )}
              <h2 className="text-lg font-bold text-cyan-200 text-center mb-1">{prod.nombre}</h2>
              <div className="text-cyan-400 font-semibold text-base mb-1">${parseFloat(prod.precio_venta).toLocaleString('es-UY', {minimumFractionDigits:2})}</div>
              <div className="text-cyan-100 text-sm mb-2">Stock: {prod.stock > 0 ? prod.stock : <span className='text-red-400 font-bold'>Sin stock</span>}</div>
            </div>
          ))}
      </div>
    </div>
  );
}

const GALERIA_IMGS = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=800&q=80',
  'https://www.w3schools.com/html/mov_bbb.mp4', // ejemplo video
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80',
  'https://www.w3schools.com/html/movie.mp4', // otro video
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
];

function isVideo(url) {
  return url.match(/\.mp4($|\?)/i);
}

function GaleriaModal({ img, onClose }) {
  if (!img) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative max-w-3xl w-full p-4" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 text-cyan-200 text-3xl font-bold hover:text-cyan-400">×</button>
        {isVideo(img) ? (
          <video src={img} controls className="w-full max-h-[80vh] rounded-2xl shadow-2xl mx-auto bg-black" />
        ) : (
          <img src={img} alt="Imagen ampliada" className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl mx-auto" />
        )}
      </div>
    </div>
  );
}

function Galeria() {
  const [modalImg, setModalImg] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('badgers_user') && !!localStorage.getItem('badgers_pass'));
  const [loginUser, setLoginUser] = useState(() => localStorage.getItem('badgers_user') || '');
  const [loginPass, setLoginPass] = useState(() => localStorage.getItem('badgers_pass') || '');
  const [showLogin, setShowLogin] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [showChangePass, setShowChangePass] = useState(false);
  const [changePassError, setChangePassError] = useState('');
  const [changePassSuccess, setChangePassSuccess] = useState('');

  // --- API real ---
  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://thebadgerspage.onrender.com';
  useEffect(() => {
    setLoadingGallery(true);
    fetch(`${API_BASE}/api/galeria/`)
      .then(res => res.json())
      .then(data => {
        setGallery(data);
        setSelectedIdx(data.length - 1);
      })
      .catch(() => setGallery([]))
      .finally(() => setLoadingGallery(false));
  }, []);

  // Cuando se sube una nueva imagen, seleccionarla automáticamente
  useEffect(() => {
    if (gallery.length > 0) {
      setSelectedIdx(gallery.length - 1);
    }
  }, [gallery.length]);

  function handleLogin(e) {
    e.preventDefault();
    setLoginError('');
    const user = e.target.user.value;
    const pass = e.target.pass.value;
    // Probar login haciendo un request a /api/galeria/ con auth básica
    fetch(`${API_BASE}/api/galeria/`, {
      headers: {
        'Authorization': 'Basic ' + btoa(`${user}:${pass}`)
      }
    })
      .then(res => {
        if (res.status === 401) throw new Error('Usuario o contraseña incorrectos');
        localStorage.setItem('badgers_user', user);
        localStorage.setItem('badgers_pass', pass);
        setLoginUser(user);
        setLoginPass(pass);
        setIsLoggedIn(true);
        setShowLogin(false);
      })
      .catch(() => setLoginError('Usuario o contraseña incorrectos'));
  }

  function handleLogout() {
    localStorage.removeItem('badgers_user');
    localStorage.removeItem('badgers_pass');
    setLoginUser('');
    setLoginPass('');
    setIsLoggedIn(false);
  }

  function handleUpload(e) {
    e.preventDefault();
    setUploadError('');
    setUploading(true);
    const nombre = e.target.nombre.value;
    const file = e.target.file.files[0];
    
    console.log('DEBUG: Archivo seleccionado:', file);
    console.log('DEBUG: Nombre:', nombre);
    
    if (!nombre || !file) {
      setUploadError('Completa todos los campos');
      setUploading(false);
      return;
    }
    
    // Verificar que el archivo no esté vacío
    if (file.size === 0) {
      setUploadError('El archivo está vacío');
      setUploading(false);
      return;
    }
    
    const isImg = file.type.startsWith('image/');
    const isVid = file.type === 'video/mp4';
    if (!isImg && !isVid) {
      setUploadError('Solo se permiten imágenes o videos mp4');
      setUploading(false);
      return;
    }
    
    console.log('DEBUG: Tipo de archivo:', file.type);
    console.log('DEBUG: Tamaño del archivo:', file.size);
    
    // Subir a la API
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('archivo', file);
    
    // Verificar que el FormData se creó correctamente
    console.log('DEBUG: FormData creado');
    for (let [key, value] of formData.entries()) {
      console.log('DEBUG: FormData entry:', key, value);
    }
    
    fetch(`${API_BASE}/api/galeria/upload/`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${loginUser}:${loginPass}`)
      },
      body: formData
    })
      .then(res => {
        console.log('DEBUG: Respuesta del servidor:', res.status, res.statusText);
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.error || `Error ${res.status}: ${res.statusText}`);
          });
        }
        return res.json();
      })
      .then(data => {
        console.log('DEBUG: Datos de respuesta:', data);
        if (!data.ok) throw new Error(data.error || 'Error al subir');
        // Refrescar galería
        return fetch(`${API_BASE}/api/galeria/`).then(res => res.json());
      })
      .then(data => {
        setGallery(data);
        setSelectedIdx(data.length - 1);
        setShowUpload(false);
      })
      .catch(err => {
        console.error('DEBUG: Error en subida:', err);
        setUploadError(err.message);
      })
      .finally(() => setUploading(false));
  }

  function handleChangePassword(e) {
    e.preventDefault();
    setChangePassError('');
    setChangePassSuccess('');
    const oldPass = e.target.oldpass.value;
    const newPass = e.target.newpass.value;
    const confirmPass = e.target.confirmpass.value;
    if (newPass !== confirmPass) {
      setChangePassError('Las contraseñas no coinciden');
      return;
    }
    fetch(`${API_BASE}/api/usuarios/cambiar-password/`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${loginUser}:${oldPass}`),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ old_password: oldPass, new_password: newPass })
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al cambiar la contraseña');
        setChangePassSuccess('Contraseña cambiada correctamente');
        setShowChangePass(false);
        localStorage.setItem('badgers_pass', newPass);
        setLoginPass(newPass);
      })
      .catch(() => setChangePassError('Error al cambiar la contraseña'));
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-cyan-900 via-cyan-950 to-black font-sans pt-32 flex flex-col items-center">
      <h1 className="text-4xl md:text-5xl font-extrabold text-cyan-200 mb-8 mt-8 drop-shadow-xl text-center tracking-tight animate-fade-in break-words max-w-full">Galería</h1>
      {/* Galería */}
      {loadingGallery ? (
        <div className="text-cyan-200 animate-pulse">Cargando galería...</div>
      ) : (
        <>
          {/* Previsualización grande */}
          {gallery[selectedIdx] && (
            <div className="mb-8 flex flex-col items-center">
              <button
                className="rounded-2xl shadow-2xl border-4 border-cyan-700 bg-black overflow-hidden max-w-2xl w-full flex flex-col items-center focus:outline-none"
                style={{ cursor: 'zoom-in' }}
                onClick={() => setModalImg(gallery[selectedIdx].url)}
                aria-label="Ver en pantalla completa"
              >
                {gallery[selectedIdx].tipo === 'video' ? (
                  <video src={gallery[selectedIdx].url} controls className="w-full max-h-[400px] object-contain bg-black" />
                ) : (
                  <img src={gallery[selectedIdx].url} alt={gallery[selectedIdx].nombre} className="w-full max-h-[400px] object-contain" />
                )}
                <div className="w-full px-4 py-2 bg-black/80 text-cyan-100 text-base flex flex-col items-start">
                  <span className="font-bold truncate w-full" title={gallery[selectedIdx].nombre}>{gallery[selectedIdx].nombre}</span>
                  <div className="flex justify-between items-center w-full">
                    <span className="text-cyan-400">{gallery[selectedIdx].fecha}</span>
                    <span className="text-cyan-300 text-sm">por {gallery[selectedIdx].usuario || 'Anónimo'}</span>
                  </div>
                </div>
              </button>
            </div>
          )}
          {/* Miniaturas */}
          <div className="flex flex-wrap justify-center gap-6 max-w-6xl mb-8">
            {gallery.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIdx(idx)}
                className={`border-4 ${selectedIdx === idx ? 'border-cyan-400 scale-105 shadow-2xl' : 'border-cyan-900'} rounded-xl overflow-hidden focus:outline-none transition-all duration-200 hover:scale-110 hover:shadow-xl bg-black relative`}
                style={{ width: 200, height: 150 }}
                aria-label={`Ver elemento ${idx+1}`}
              >
                <div className="relative w-full h-full">
                  {item.tipo === 'video' ? (
                    <>
                      <video src={item.url} className="w-full h-full object-cover bg-black" />
                      <span className="absolute top-2 right-2 bg-black/70 rounded-full p-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-cyan-300">
                          <path d="M4.5 3.75A2.25 2.25 0 0 0 2.25 6v8A2.25 2.25 0 0 0 4.5 16.25h11A2.25 2.25 0 0 0 17.75 14V6A2.25 2.25 0 0 0 15.5 3.75h-11zm3.75 3.5a.75.75 0 0 1 1.13-.65l4.5 2.75a.75.75 0 0 1 0 1.3l-4.5 2.75A.75.75 0 0 1 8.25 12V6.75z" />
                        </svg>
                      </span>
                    </>
                  ) : (
                    <img src={item.url} alt={`Miniatura ${idx+1}`} className="w-full h-full object-cover" />
                  )}
                  {/* Nombre, fecha y usuario */}
                  <div className="absolute bottom-0 left-0 w-full bg-black/70 text-cyan-100 text-sm px-3 py-2 flex flex-col items-start">
                    <span className="font-bold truncate w-full" title={item.nombre}>{item.nombre}</span>
                    <div className="flex justify-between items-center w-full">
                      <span className="text-cyan-400 text-xs">{item.fecha}</span>
                      <span className="text-cyan-300 text-xs">por {item.usuario || 'Anónimo'}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
      {/* Texto y botón debajo de la galería */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <p className="text-lg text-cyan-100 text-center max-w-xl animate-fade-in">Fotos y videos de The Badgers. Solo usuarios pueden subir contenido.</p>
        <div className="flex gap-4">
          {isLoggedIn ? (
            <>
              <button onClick={() => setShowUpload(true)} className="bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-xl shadow">Subir foto/video</button>
              <button onClick={() => setShowChangePass(true)} className="bg-cyan-800 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-xl shadow">Cambiar contraseña</button>
              <button onClick={handleLogout} className="bg-black/60 hover:bg-cyan-950 text-cyan-200 font-bold py-2 px-4 rounded-xl shadow border border-cyan-900">Cerrar sesión</button>
            </>
          ) : (
            <button onClick={() => setShowLogin(true)} className="bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-xl shadow">Login</button>
          )}
        </div>
      </div>
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowLogin(false)}>
          <form onSubmit={handleLogin} className="bg-black rounded-2xl shadow-2xl border-2 border-cyan-900 max-w-xs w-full p-6 relative animate-fade-in" onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => setShowLogin(false)} className="absolute top-3 right-3 text-cyan-300 text-2xl font-bold hover:text-cyan-400">×</button>
            <h2 className="text-2xl font-bold text-cyan-200 text-center mb-4">Login</h2>
            <input name="user" type="text" placeholder="Usuario" className="w-full mb-3 px-3 py-2 rounded bg-cyan-950 text-cyan-100" autoFocus />
            <input name="pass" type="password" placeholder="Contraseña" className="w-full mb-3 px-3 py-2 rounded bg-cyan-950 text-cyan-100" />
            {loginError && <div className="text-red-400 text-sm mb-2">{loginError}</div>}
            <button type="submit" className="w-full bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-xl">Entrar</button>
          </form>
        </div>
      )}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowUpload(false)}>
          <form onSubmit={handleUpload} className="bg-black rounded-2xl shadow-2xl border-2 border-cyan-900 max-w-xs w-full p-6 relative animate-fade-in" onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => setShowUpload(false)} className="absolute top-3 right-3 text-cyan-300 text-2xl font-bold hover:text-cyan-400">×</button>
            <h2 className="text-2xl font-bold text-cyan-200 text-center mb-4">Subir foto/video</h2>
            <input name="nombre" type="text" placeholder="Nombre" className="w-full mb-3 px-3 py-2 rounded bg-cyan-950 text-cyan-100" />
            <input name="file" type="file" accept="image/*,video/mp4" className="w-full mb-3 px-3 py-2 rounded bg-cyan-950 text-cyan-100" />
            {uploadError && <div className="text-red-400 text-sm mb-2">{uploadError}</div>}
            <button type="submit" disabled={uploading} className="w-full bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-xl">{uploading ? 'Subiendo...' : 'Subir'}</button>
          </form>
        </div>
      )}
      {showChangePass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowChangePass(false)}>
          <form onSubmit={handleChangePassword} className="bg-black rounded-2xl shadow-2xl border-2 border-cyan-900 max-w-xs w-full p-6 relative animate-fade-in" onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => setShowChangePass(false)} className="absolute top-3 right-3 text-cyan-300 text-2xl font-bold hover:text-cyan-400">×</button>
            <h2 className="text-2xl font-bold text-cyan-200 text-center mb-4">Cambiar contraseña</h2>
            <input name="oldpass" type="password" placeholder="Contraseña actual" className="w-full mb-3 px-3 py-2 rounded bg-cyan-950 text-cyan-100" required />
            <input name="newpass" type="password" placeholder="Nueva contraseña" className="w-full mb-3 px-3 py-2 rounded bg-cyan-950 text-cyan-100" required />
            <input name="confirmpass" type="password" placeholder="Confirmar nueva contraseña" className="w-full mb-3 px-3 py-2 rounded bg-cyan-950 text-cyan-100" required />
            {changePassError && <div className="text-red-400 text-sm mb-2">{changePassError}</div>}
            {changePassSuccess && <div className="text-green-400 text-sm mb-2">{changePassSuccess}</div>}
            <button type="submit" className="w-full bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-xl">Cambiar</button>
          </form>
        </div>
      )}
      <GaleriaModal img={modalImg} onClose={() => setModalImg(null)} />
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-cyan-900 via-cyan-950 to-black font-sans">
      <Navbar />
      <Routes>
        <Route path="/" element={
          <>
            <Hero />
            <SobreNosotrosYClases />
            <Contacto />
          </>
        } />
        <Route path="/tienda" element={<Tienda />} />
        <Route path="/galeria" element={<Galeria />} />
      </Routes>
    </div>
  );
}

export default App;
// Recuerda agregar las animaciones en App.css si no existen: animate-float
