import React, { useEffect, useState } from "react";
import "./App.css";
import badgersLogo from "./assets/badgers-logo.png";
import { Parallax } from 'react-parallax';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (href) => {
    if (href.startsWith('/#')) {
      // Si estamos en otra página, navegar primero a la página principal
      if (location.pathname !== '/') {
        navigate('/');
        // Esperar un poco para que la navegación se complete antes de hacer scroll
        setTimeout(() => {
          const element = document.querySelector(href.substring(1));
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        // Si ya estamos en la página principal, solo hacer scroll
        const element = document.querySelector(href.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
    // Cerrar el menú móvil después de la navegación
    setIsMenuOpen(false);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar-badgers fixed top-0 left-0 w-full z-50 shadow-xl border-b border-cyan-500/60 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={badgersLogo} alt="Logo The Badgers" className="h-12 w-auto max-w-[56px] object-contain drop-shadow-2xl" />
          <span className="text-2xl font-extrabold text-cyan-300 tracking-wide drop-shadow">The Badgers</span>
        </div>
        
        {/* Menú de escritorio */}
        <ul className="hidden md:flex gap-6">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              {item.href.startsWith('/tienda') ? (
                <Link
                  to={item.href}
                  className={`text-cyan-100 font-semibold hover:text-cyan-400 transition-colors duration-200 drop-shadow ${location.pathname === '/tienda' ? 'text-cyan-400' : ''}`}
                >
                  {item.label}
                </Link>
              ) : item.href.startsWith('/galeria') ? (
                <Link
                  to={item.href}
                  className={`text-cyan-100 font-semibold hover:text-cyan-400 transition-colors duration-200 drop-shadow ${location.pathname === '/galeria' ? 'text-cyan-400' : ''}`}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  onClick={() => handleNavigation(item.href)}
                  className="text-cyan-100 font-semibold hover:text-cyan-400 transition-colors duration-200 drop-shadow"
                >
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>

        {/* Botón hamburguesa para móvil */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1"
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-cyan-300 transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-cyan-300 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-cyan-300 transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
        </button>
      </div>

      {/* Menú móvil */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="bg-black/95 backdrop-blur-md border-t border-cyan-500/60">
          <ul className="flex flex-col space-y-2 px-4 py-4">
            {NAV_ITEMS.map((item) => (
              <li key={item.label} className="border-b border-cyan-500/20 last:border-b-0">
                {item.href.startsWith('/tienda') ? (
                  <Link
                    to={item.href}
                    onClick={() => handleLinkClick(item.href)}
                    className={`block py-3 text-cyan-100 font-semibold hover:text-cyan-400 transition-colors duration-200 drop-shadow ${location.pathname === '/tienda' ? 'text-cyan-400' : ''}`}
                  >
                    {item.label}
                  </Link>
                ) : item.href.startsWith('/galeria') ? (
                  <Link
                    to={item.href}
                    onClick={() => handleLinkClick(item.href)}
                    className={`block py-3 text-cyan-100 font-semibold hover:text-cyan-400 transition-colors duration-200 drop-shadow ${location.pathname === '/galeria' ? 'text-cyan-400' : ''}`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className="block w-full text-left py-3 text-cyan-100 font-semibold hover:text-cyan-400 transition-colors duration-200 drop-shadow"
                  >
                    {item.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
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
                    <td className="py-2 px-2">Jiu Jitsu GI</td>
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
    <section id="contacto" className="flex items-center justify-center min-h-screen w-full py-24 relative overflow-hidden">
      {/* Fondo moderno con gradientes y elementos decorativos */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"></div>
      
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Círculos decorativos grandes */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-200 to-blue-300 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full opacity-20 blur-3xl"></div>
        
        {/* Elementos geométricos sutiles */}
        <div className="absolute top-20 right-1/4 w-32 h-32 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full opacity-10 blur-2xl"></div>
        <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-gradient-to-tl from-cyan-300 to-blue-400 rounded-full opacity-15 blur-2xl"></div>
      </div>
      
      {/* Patrón de puntos decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-32 left-20 w-2 h-2 bg-indigo-600 rounded-full"></div>
        <div className="absolute top-48 right-32 w-1 h-1 bg-blue-600 rounded-full"></div>
        <div className="absolute top-64 left-1/3 w-1.5 h-1.5 bg-cyan-600 rounded-full"></div>
        <div className="absolute top-80 right-1/4 w-1 h-1 bg-indigo-600 rounded-full"></div>
        <div className="absolute top-96 left-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
        <div className="absolute top-40 right-1/3 w-1.5 h-1.5 bg-cyan-600 rounded-full"></div>
        <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-indigo-600 rounded-full"></div>
        <div className="absolute bottom-48 right-1/3 w-2 h-2 bg-blue-600 rounded-full"></div>
      </div>

      {/* Líneas decorativas sutiles */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-0 w-32 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent"></div>
        <div className="absolute bottom-1/4 right-0 w-32 h-px bg-gradient-to-l from-transparent via-blue-400 to-transparent"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-2xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200 p-10 text-center animate-fade-in flex flex-col items-center gap-6">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 drop-shadow">Contacto</h2>
        <p className="text-lg text-slate-600 mb-4">¿Listo para comenzar? Reserva tu clase o consúltanos por WhatsApp o Instagram.</p>
        <div className="text-slate-700 font-bold text-lg mb-2">Cel: <span className="text-indigo-600">092 627 480</span></div>
        <a href="https://www.instagram.com/thebadgers.uy/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-indigo-600 font-bold underline mb-2 hover:text-indigo-700 transition-colors text-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
            <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5a5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5zm5.13.62a1.13 1.13 0 1 1 0 2.25a1.13 1.13 0 0 1 0-2.25z"/>
          </svg>
          Instagram
        </a>
        <a
          href="https://wa.me/59892627480?text=Estoy%20interesado%20en%20tener%20una%20clase%20de%20prueba"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-full shadow-lg transition-all duration-300 text-base uppercase tracking-wider mt-2 mb-6 border-0 transform hover:scale-105"
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
  );
}

function ProductoModal({ producto, onClose }) {
  if (!producto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative animate-fade-in" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-500 text-2xl font-bold hover:text-slate-700">×</button>
        {producto.foto_url ? (
          <img src={producto.foto_url} alt={producto.nombre} className="w-48 h-48 object-contain rounded-xl mx-auto mb-4 bg-slate-50" />
        ) : (
          <div className="w-48 h-48 flex items-center justify-center rounded-xl mx-auto mb-4 bg-slate-100 text-slate-500 text-2xl">Sin foto</div>
        )}
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">{producto.nombre}</h2>
        <div className="text-indigo-600 font-semibold text-xl text-center mb-2">${parseFloat(producto.precio_venta).toLocaleString('es-UY', {minimumFractionDigits:2})}</div>
        <div className="text-slate-600 text-center mb-2">Stock: {producto.stock > 0 ? producto.stock : <span className='text-red-500 font-bold'>Sin stock</span>}</div>
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
    fetch('https://thebadgersadmin.onrender.com/api/productos/') // ✅ CORRECTO - mantener para productos
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar productos');
        return res.json();
      })
      .then(data => setProductos(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans pt-32 flex flex-col items-center px-2 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-200 to-blue-300 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full opacity-10 blur-3xl"></div>
      </div>
      
      {/* Patrón de puntos decorativo */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-2 h-2 bg-indigo-600 rounded-full"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-blue-600 rounded-full"></div>
        <div className="absolute top-60 left-1/4 w-1.5 h-1.5 bg-cyan-600 rounded-full"></div>
        <div className="absolute top-80 right-1/3 w-1 h-1 bg-indigo-600 rounded-full"></div>
        <div className="absolute top-96 left-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
        <div className="absolute top-32 right-1/4 w-1.5 h-1.5 bg-cyan-600 rounded-full"></div>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-8 mt-8 drop-shadow-lg text-center tracking-tight animate-fade-in break-words max-w-full">Tienda</h1>
        <p className="text-lg text-slate-600 mb-8 text-center max-w-xl animate-fade-in">Productos oficiales y seleccionados de The Badgers. ¡Elegí el tuyo!</p>
        {loading && <p className="text-slate-700 animate-pulse">Cargando productos...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <ProductoModal producto={productoSeleccionado} onClose={() => setProductoSeleccionado(null)} />
        <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-16">
          {productos
            .filter(prod => !["Agua Salus", "Alfa Way", "Way Bar", "Power Ade", "Cuota"].includes(prod.nombre))
            .map(prod => (
              <div key={prod.id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 flex flex-col items-center p-5 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-indigo-300 cursor-pointer" onClick={() => setProductoSeleccionado(prod)}>
                {prod.foto_url ? (
                  <img src={prod.foto_url} alt={prod.nombre} className="w-32 h-32 object-contain rounded-xl mb-3 bg-slate-50" />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center rounded-xl mb-3 bg-slate-100 text-slate-500 text-2xl">Sin foto</div>
                )}
                <h2 className="text-lg font-bold text-slate-800 text-center mb-1">{prod.nombre}</h2>
                <div className="text-indigo-600 font-semibold text-base mb-1">${parseFloat(prod.precio_venta).toLocaleString('es-UY', {minimumFractionDigits:2})}</div>
                <div className="text-slate-600 text-sm mb-2">Stock: {prod.stock > 0 ? prod.stock : <span className='text-red-500 font-bold'>Sin stock</span>}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

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
  const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : 'https://thebadgerspage.onrender.com'; // Cambiar de thebadgersadmin a thebadgerspage
  
  useEffect(() => {
    setLoadingGallery(true);
    console.log('Cargando galería desde:', `${API_BASE}/api/galeria/`);
    fetch(`${API_BASE}/api/galeria/`)
      .then(res => {
        console.log('Respuesta de la API:', res.status, res.statusText);
        return res.json();
      })
      .then(data => {
        console.log('Datos recibidos de la API:', data);
        console.log('Número de imágenes:', data?.length || 0);
        // Siempre usar las imágenes reales desde la API
        setGallery(data || []);
        if (data && data.length > 0) {
          setSelectedIdx(data.length - 1);
          console.log('Imagen seleccionada:', data[data.length - 1]);
        }
      })
      .catch(err => {
        console.error('Error al cargar galería:', err);
        setGallery([]);
      })
      .finally(() => setLoadingGallery(false));
  }, [API_BASE]);

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
    console.log('DEBUG: Nombre del archivo:', file.name);
    
    // Subir a la API
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('archivo', file, file.name); // Agregar el nombre del archivo explícitamente
    
    // Verificar que el FormData se creó correctamente
    console.log('DEBUG: FormData creado');
    for (let [key, value] of formData.entries()) {
      console.log('DEBUG: FormData entry:', key, value);
      if (value instanceof File) {
        console.log('DEBUG: File en FormData:', value.name, value.size, value.type);
      }
    }
    
    // Verificar que el archivo esté en el FormData
    const archivoEnFormData = formData.get('archivo');
    console.log('DEBUG: Archivo en FormData:', archivoEnFormData);
    if (archivoEnFormData instanceof File) {
      console.log('DEBUG: Archivo válido en FormData:', archivoEnFormData.name, archivoEnFormData.size);
    } else {
      console.error('DEBUG: ERROR - Archivo no válido en FormData');
      setUploadError('Error al preparar el archivo');
      setUploading(false);
      return;
    }
    
    fetch(`${API_BASE}/api/galeria/upload/`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${loginUser}:${loginPass}`)
        // NO incluir Content-Type para FormData, el navegador lo establece automáticamente
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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans pt-32 flex flex-col items-center relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Círculos decorativos grandes */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-200 to-blue-300 rounded-full opacity-20 blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full opacity-15 blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        
        {/* Elementos geométricos sutiles */}
        <div className="absolute top-20 right-1/4 w-32 h-32 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full opacity-10 blur-2xl"></div>
        <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-gradient-to-tl from-cyan-300 to-blue-400 rounded-full opacity-15 blur-2xl"></div>
        
        {/* Nuevos elementos impactantes */}
        <div className="absolute top-1/3 right-1/3 w-40 h-40 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full opacity-15 blur-3xl animate-bounce" style={{animationDuration: '6s'}}></div>
        <div className="absolute bottom-1/3 left-1/4 w-32 h-32 bg-gradient-to-tr from-cyan-400 to-blue-400 rounded-full opacity-20 blur-2xl animate-pulse" style={{animationDelay: '3s'}}></div>
      </div>
      


      <div className="relative z-10 w-full flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-black text-slate-800 mb-12 mt-4 drop-shadow-2xl text-center tracking-tight animate-fade-in break-words max-w-full leading-tight">
          Galería
        </h1>
        
        {/* Galería */}
        {loadingGallery ? (
          <div className="text-slate-700 animate-pulse text-lg">Cargando galería...</div>
        ) : (
          <>
            {/* Previsualización grande */}
            {gallery[selectedIdx] && (
              <div className="mb-12 flex flex-col items-center">
                <button
                  className="rounded-3xl shadow-2xl border-4 border-white bg-white overflow-hidden max-w-4xl w-full flex flex-col items-center focus:outline-none transform hover:scale-105 transition-all duration-500 hover:shadow-3xl relative"
                  style={{ cursor: 'zoom-in' }}
                  onClick={() => setModalImg(gallery[selectedIdx].url)}
                  aria-label="Ver en pantalla completa"
                >
                  {gallery[selectedIdx].tipo === 'video' ? (
                    <video src={gallery[selectedIdx].url} controls className="w-full max-h-[600px] object-contain bg-slate-50" />
                  ) : (
                    <img src={gallery[selectedIdx].url} alt={gallery[selectedIdx].nombre} className="w-full max-h-[600px] object-contain" />
                  )}
                  <div className="absolute bottom-0 left-0 w-full px-8 py-6 text-white text-base flex flex-col items-start">
                    <span className="font-bold truncate w-full text-xl drop-shadow-lg" title={gallery[selectedIdx].nombre}>{gallery[selectedIdx].nombre}</span>
                    <div className="flex justify-between items-center w-full mt-3">
                      <span className="text-blue-200 font-medium text-lg drop-shadow-lg">{gallery[selectedIdx].fecha}</span>
                      <span className="text-slate-200 text-base drop-shadow-lg">por {gallery[selectedIdx].usuario || 'Anónimo'}</span>
                    </div>
                  </div>
                </button>
              </div>
            )}
            
            {/* Miniaturas */}
            <div className="flex flex-wrap justify-center gap-8 max-w-7xl mb-12 px-4">
              {gallery.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIdx(idx)}
                  className={`border-4 ${selectedIdx === idx ? 'border-indigo-500 scale-110 shadow-2xl ring-4 ring-indigo-200' : 'border-slate-300'} rounded-2xl overflow-hidden focus:outline-none transition-all duration-500 hover:scale-110 hover:shadow-2xl bg-white relative transform hover:rotate-2 hover:border-indigo-400`}
                  style={{ width: 240, height: 170 }}
                  aria-label={`Ver elemento ${idx+1}`}
                >
                  <div className="relative w-full h-full">
                    {item.tipo === 'video' ? (
                      <>
                        <video src={item.url} className="w-full h-full object-cover bg-slate-50" />
                        <span className="absolute top-3 right-3 bg-black/80 rounded-full p-2 backdrop-blur-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 3.75A2.25 2.25 0 0 0 2.25 6v8A2.25 2.25 0 0 0 4.5 16.25h11A2.25 2.25 0 0 0 20.5 14V6A2.25 2.25 0 0 0 18.25 3.75h-11zm3.75 3.5a.75.75 0 0 1 1.13-.65l4.5 2.75a.75.75 0 0 1 0 1.3l-4.5 2.75A.75.75 0 0 1 8.25 12V6.75z" />
                          </svg>
                        </span>
                      </>
                    ) : (
                      <img src={item.url} alt={`Miniatura ${idx+1}`} className="w-full h-full object-cover" />
                    )}
                    {/* Nombre, fecha y usuario */}
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 via-black/60 to-transparent text-white text-sm px-4 py-3 flex flex-col items-start">
                      <span className="font-bold truncate w-full" title={item.nombre}>{item.nombre}</span>
                      <div className="flex justify-between items-center w-full mt-1">
                        <span className="text-blue-300 text-xs font-medium">{item.fecha}</span>
                        <span className="text-slate-300 text-xs">por {item.usuario || 'Anónimo'}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
        
        {/* Texto y botones debajo de la galería */}
        <div className="flex flex-col items-center gap-6 mb-8">
          <p className="text-lg text-slate-600 text-center max-w-xl animate-fade-in">Fotos y videos de The Badgers. Solo usuarios pueden subir contenido.</p>
          <div className="flex gap-4 flex-wrap justify-center">
            {isLoggedIn ? (
              <>
                <button onClick={() => setShowUpload(true)} className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                  Subir foto/video
                </button>
                <button onClick={() => setShowChangePass(true)} className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  Cambiar contraseña
                </button>
                <button onClick={handleLogout} className="bg-white/80 hover:bg-white text-slate-700 font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border border-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                  </svg>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <button onClick={() => setShowLogin(true)} className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modales modernizados */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm" onClick={() => setShowLogin(false)}>
          <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xs w-full p-6 relative animate-fade-in" onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => setShowLogin(false)} className="absolute top-3 right-3 text-slate-500 text-2xl font-bold hover:text-slate-700">×</button>
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-4">Login</h2>
            <input name="user" type="text" placeholder="Usuario" className="w-full mb-3 px-3 py-2 rounded-lg bg-slate-50 text-slate-800 border border-slate-200 focus:border-indigo-500 focus:outline-none" autoFocus />
            <input name="pass" type="password" placeholder="Contraseña" className="w-full mb-3 px-3 py-2 rounded-lg bg-slate-50 text-slate-800 border border-slate-200 focus:border-indigo-500 focus:outline-none" />
            {loginError && <div className="text-red-500 text-sm mb-2">{loginError}</div>}
            <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300">Entrar</button>
          </form>
        </div>
      )}
      
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm" onClick={() => setShowUpload(false)}>
          <form onSubmit={handleUpload} className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xs w-full p-6 relative animate-fade-in" onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => setShowUpload(false)} className="absolute top-3 right-3 text-slate-500 text-2xl font-bold hover:text-slate-700">×</button>
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-4">Subir foto/video</h2>
            <input name="nombre" type="text" placeholder="Nombre" className="w-full mb-3 px-3 py-2 rounded-lg bg-slate-50 text-slate-800 border border-slate-200 focus:border-indigo-500 focus:outline-none" />
            <input 
              name="file" 
              type="file" 
              accept="image/*,video/mp4" 
              className="w-full mb-3 px-3 py-2 rounded-lg bg-slate-50 text-slate-800 border border-slate-200 focus:border-indigo-500 focus:outline-none" 
              required
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  console.log('Archivo seleccionado:', file.name, file.size, file.type);
                }
              }}
            />
            {uploadError && <div className="text-red-500 text-sm mb-2">{uploadError}</div>}
            <button 
              type="submit" 
              className={`w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={uploading}
            >
              {uploading ? 'Subiendo...' : 'Subir'}
            </button>
          </form>
        </div>
      )}
      
      {showChangePass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm" onClick={() => setShowChangePass(false)}>
          <form onSubmit={handleChangePassword} className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xs w-full p-6 relative animate-fade-in" onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => setShowChangePass(false)} className="absolute top-3 right-3 text-slate-500 text-2xl font-bold hover:text-slate-700">×</button>
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-4">Cambiar contraseña</h2>
            <input name="oldpass" type="password" placeholder="Contraseña antigua" className="w-full mb-3 px-3 py-2 rounded-lg bg-slate-50 text-slate-800 border border-slate-200 focus:border-indigo-500 focus:outline-none" />
            <input name="newpass" type="password" placeholder="Nueva contraseña" className="w-full mb-3 px-3 py-2 rounded-lg bg-slate-50 text-slate-800 border border-slate-200 focus:border-indigo-500 focus:outline-none" />
            <input name="confirmpass" type="password" placeholder="Confirmar nueva contraseña" className="w-full mb-3 px-3 py-2 rounded-lg bg-slate-50 text-slate-800 border border-slate-200 focus:border-indigo-500 focus:outline-none" />
            {changePassError && <div className="text-red-500 text-sm mb-2">{changePassError}</div>}
            {changePassSuccess && <div className="text-green-500 text-sm mb-2">{changePassSuccess}</div>}
            <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300">
              Cambiar contraseña
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<><Hero /><SobreNosotrosYClases /><Contacto /></>} />
        <Route path="/tienda" element={<Tienda />} />
        <Route path="/galeria" element={<Galeria />} />
      </Routes>
    </div>
  );
}
