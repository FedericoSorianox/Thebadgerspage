import React, { useEffect, useState } from "react";
import "./App.css";
import badgersLogo from "./assets/badgers-logo.png";
import { Parallax } from 'react-parallax';
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ProtectedComponent } from './components/AuthComponents.jsx';
import badgersHeroBg from "./assets/the-badgers-academia.jpeg";
import gymBackground from "./assets/gym-background.jpeg";
import Galeria from './components/Galeria.jsx';
import TorneoDashboard from './components/TorneoDashboard.jsx';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? 'https://thebadgerspage.onrender.com' : 'http://127.0.0.1:8000');

// FORCE correct API URL in production - temporary fix for environment variable issue
const FORCED_API_BASE = import.meta.env.PROD ? 'https://thebadgerspage.onrender.com' : API_BASE;

console.log('DEBUG API_BASE:', API_BASE);
console.log('DEBUG FORCED_API_BASE:', FORCED_API_BASE);
console.log('DEBUG PROD mode:', import.meta.env.PROD);
console.log('DEBUG VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

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
              ) : item.href.startsWith('/torneo') ? (
                <Link
                  to={item.href}
                  className={`text-cyan-100 font-semibold hover:text-cyan-400 transition-colors duration-200 drop-shadow ${location.pathname === '/torneo' ? 'text-cyan-400' : ''}`}
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
                ) : item.href.startsWith('/torneo') ? (
                  <Link
                    to={item.href}
                    onClick={() => handleLinkClick(item.href)}
                    className={`block py-3 text-cyan-100 font-semibold hover:text-cyan-400 transition-colors duration-200 drop-shadow ${location.pathname === '/torneo' ? 'text-cyan-400' : ''}`}
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
            <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5a5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5zm5.13.62a1.13 1.13 0 1 1 0 2.25a1.13 1.13 0 0 1 0-2.25z" />
          </svg>
          Instagram
        </a>
        <a
          href="https://wa.me/59892627480?text=Estoy%20interesado%20en%20tener%20una%20clase%20de%20prueba"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold rounded-full shadow-lg transition-all duration-300 text-base uppercase tracking-wider mt-2 mb-6 border-0 transform hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487.5-.669.51-.173.008-.371.01-.57.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
          </svg>
          Comunicate por WhatsApp
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
        <div className="text-indigo-600 font-semibold text-xl text-center mb-2">${parseFloat(producto.precio_venta).toLocaleString('es-UY', { minimumFractionDigits: 2 })}</div>
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
    // Usar el proxy local para evitar errores de CORS
    fetch('/api/productos/')
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
        <div className="absolute top-80 right-1/4 w-1 h-1 bg-indigo-600 rounded-full"></div>
        <div className="absolute top-96 left-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
        <div className="absolute top-40 right-1/3 w-1.5 h-1.5 bg-cyan-600 rounded-full"></div>
        <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-indigo-600 rounded-full"></div>
        <div className="absolute bottom-48 right-1/3 w-2 h-2 bg-blue-600 rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-4xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200 p-10 text-center animate-fade-in flex flex-col items-center gap-6">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 drop-shadow">Tienda</h2>
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
                <div className="text-indigo-600 font-semibold text-base mb-1">${parseFloat(prod.precio_venta).toLocaleString('es-UY', { minimumFractionDigits: 2 })}</div>
                <div className="text-slate-600 text-sm mb-2">Stock: {prod.stock > 0 ? prod.stock : <span className='text-red-500 font-bold'>Sin stock</span>}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function Home() {
  return (
    <>
      <Hero />
      <SobreNosotrosYClases />
      <Contacto />
    </>
  );
}

function TorneoPage() {
  return (
    <ProtectedComponent>
      <div className="min-h-screen w-full pt-28 text-white px-4">
        <h1 className="text-3xl font-bold mb-4">Sistema de Torneo BJJ</h1>
        <TorneoDashboard />
      </div>
    </ProtectedComponent>
  );
}

export default function App() {
  // Stubs para compatibilidad con Galeria actual (auth básica de galería)
  const storedUser = typeof window !== 'undefined' ? localStorage.getItem('badgers_user') : null;
  const storedPass = typeof window !== 'undefined' ? localStorage.getItem('badgers_pass') : null;

  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tienda" element={<Tienda />} />
        <Route
          path="/galeria"
          element={
            <Galeria
              isLoggedIn={!!(storedUser && storedPass)}
              loginUser={storedUser || ''}
              loginPass={storedPass || ''}
              setShowLogin={() => {}}
              handleLogin={() => {}}
              handleLogout={() => {}}
              loginError={null}
              showLogin={false}
              API_BASE={FORCED_API_BASE}
              setLoginPass={(p) => localStorage.setItem('badgers_pass', p)}
            />
          }
        />
        <Route path="/torneo" element={<TorneoPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}