import React, { useEffect, useState, useCallback } from "react";
import "./App.css";
import badgersLogo from "./assets/badgers-logo.png";
import { Parallax } from 'react-parallax';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import * as API from './services/api.js';
import badgersHeroBg from "./assets/the-badgers-academia.jpeg";
import gymBackground from "./assets/gym-background.jpeg";

const NAV_ITEMS = [
  { label: "Inicio", href: "/#inicio" },
  { label: "Sobre Nosotros", href: "/#sobre" },
  { label: "Clases", href: "/#clases" },
  { label: "Tienda", href: "/tienda" },
  { label: "Galería", href: "/galeria" },
  { label: "Torneo BJJ", href: "/torneo" },
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
                <div className="text-indigo-600 font-semibold text-base mb-1">${parseFloat(prod.precio_venta).toLocaleString('es-UY', { minimumFractionDigits: 2 })}</div>
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
  // Manejar navegación por teclado
  const handleKeyDown = React.useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Agregar listener de teclado cuando el modal se abre
  React.useEffect(() => {
    if (!img) return;

    document.addEventListener('keydown', handleKeyDown);
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [img, handleKeyDown]);

  if (!img) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm fullscreen-modal" onClick={onClose}>
      <div className="relative w-full h-full flex items-center justify-center p-4 fullscreen-modal-content" onClick={e => e.stopPropagation()}>
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-60 text-white text-4xl font-bold hover:text-cyan-400 transition-colors duration-200 bg-black/50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-black/70"
          aria-label="Cerrar pantalla completa (ESC)"
        >
          ×
        </button>

        {/* Contenido del modal */}
        <div className="max-w-[95vw] max-h-[95vh] flex items-center justify-center">
          {isVideo(img) ? (
            <video
              src={img}
              controls
              autoPlay
              className="max-w-full max-h-full rounded-lg shadow-2xl"
              style={{ maxWidth: '95vw', maxHeight: '95vh' }}
            />
          ) : (
            <img
              src={img}
              alt="Imagen en pantalla completa"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              style={{ maxWidth: '95vw', maxHeight: '95vh' }}
            />
          )}
        </div>

        {/* Instrucciones */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
          Presiona ESC o haz click fuera para cerrar
        </div>
      </div>
    </div>
  );
}

function Galeria({ 
  isLoggedIn, 
  loginUser, 
  loginPass, 
  setShowLogin, 
  handleLogin, 
  handleLogout, 
  loginError, 
  showLogin,
  API_BASE,
  setLoginPass 
}) {
  const [modalImg, setModalImg] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [showChangePass, setShowChangePass] = useState(false);
  const [changePassError, setChangePassError] = useState('');
  const [changePassSuccess, setChangePassSuccess] = useState('');

  useEffect(() => {
    // Solo cargar galería si el usuario está logueado Y tenemos credenciales válidas
    if (!isLoggedIn || !loginUser || !loginPass) {
      setLoadingGallery(false);
      setGallery([]);
      return;
    }

    setLoadingGallery(true);
    console.log('Cargando galería desde:', `${API_BASE}/api/galeria/`);
    
    // Incluir autenticación básica en la petición
    const auth = btoa(`${loginUser}:${loginPass}`);
    
    fetch(`${API_BASE}/api/galeria/`, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    })
      .then(res => {
        console.log('Respuesta de la API:', res.status, res.statusText);
        if (res.status === 401) {
          // Si hay error de autenticación, limpiar el login y mostrar el formulario
          localStorage.removeItem('badgers_user');
          localStorage.removeItem('badgers_pass');
          // Note: No podemos llamar handleLogout aquí directamente ya que viene por props
          // En su lugar, establecemos el estado local para mostrar login
          throw new Error('No autorizado');
        }
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
        // Si hay error de autorización, forzar el logout
        if (err.message === 'No autorizado') {
          handleLogout();
        }
      })
      .finally(() => setLoadingGallery(false));
  }, [API_BASE, isLoggedIn, loginUser, loginPass, handleLogout]);

  // Cuando se sube una nueva imagen, seleccionarla automáticamente
  useEffect(() => {
    if (gallery.length > 0) {
      setSelectedIdx(gallery.length - 1);
    }
  }, [gallery.length]);

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
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-200 to-blue-300 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full opacity-15 blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>

        {/* Elementos geométricos sutiles */}
        <div className="absolute top-20 right-1/4 w-32 h-32 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full opacity-10 blur-2xl"></div>
        <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-gradient-to-tl from-cyan-300 to-blue-400 rounded-full opacity-15 blur-2xl"></div>

        {/* Nuevos elementos impactantes */}
        <div className="absolute top-1/3 right-1/3 w-40 h-40 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full opacity-15 blur-3xl animate-bounce" style={{ animationDuration: '6s' }}></div>
        <div className="absolute bottom-1/3 left-1/4 w-32 h-32 bg-gradient-to-tr from-cyan-400 to-blue-400 rounded-full opacity-20 blur-2xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>



      <div className="relative z-10 w-full flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-black text-slate-800 mb-12 mt-4 drop-shadow-2xl text-center tracking-tight animate-fade-in break-words max-w-full leading-tight">
          Galería
        </h1>

        {/* Mostrar login prompt si no está autenticado */}
        {!isLoggedIn ? (
          <div className="flex flex-col items-center gap-6 mb-8 max-w-md">
            <div className="bg-white/90 rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-indigo-500 mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Acceso Requerido</h2>
              <p className="text-slate-600 mb-6">
                Para ver la galería de fotos y videos de The Badgers, necesitas iniciar sesión con tus credenciales.
              </p>
              <button 
                onClick={() => setShowLogin(true)} 
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                Iniciar Sesión
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Galería - solo mostrar si está autenticado */}
            {loadingGallery ? (
              <div className="text-slate-700 animate-pulse text-lg">Cargando galería...</div>
            ) : (
              <>
                {/* Previsualización grande */}
                {gallery[selectedIdx] && (
                  <div className="mb-12 flex flex-col items-center">
                    <button
                      className="rounded-3xl shadow-2xl border-4 border-white bg-white overflow-hidden max-w-4xl w-full flex flex-col items-center focus:outline-none transform hover:scale-105 transition-all duration-500 hover:shadow-3xl relative group gallery-image-hover zoom-cursor"
                      onClick={() => setModalImg(gallery[selectedIdx].url)}
                      aria-label="Ver en pantalla completa"
                    >
                      {/* Icono de pantalla completa */}
                      <div className="absolute top-4 right-4 z-10 bg-black/60 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                        </svg>
                      </div>

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
                      onDoubleClick={() => setModalImg(item.url)}
                      className={`border-4 ${selectedIdx === idx ? 'border-indigo-500 scale-110 shadow-2xl ring-4 ring-indigo-200' : 'border-slate-300'} rounded-2xl overflow-hidden focus:outline-none transition-all duration-500 hover:scale-110 hover:shadow-2xl bg-white relative transform hover:rotate-2 hover:border-indigo-400 cursor-pointer group`}
                      style={{ width: 240, height: 170 }}
                      aria-label={`Ver elemento ${idx + 1} - Click para seleccionar, doble click para pantalla completa`}
                    >
                      {/* Icono de pantalla completa para miniaturas */}
                      <div className="absolute top-2 right-2 z-10 bg-black/60 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                        </svg>
                      </div>
                      <div className="relative w-full h-full">
                        {item.tipo === 'video' ? (
                          <>
                            <video src={item.url} className="w-full h-full object-cover bg-slate-50" />
                            <span className="absolute top-3 right-3 bg-black/80 rounded-full p-2 backdrop-blur-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 3.75A2.25 2.25 0 0 0 2.25 6v8A2.25 2.25 0 0 0 4.5 16.25h11A2.25 2.25 0 0 0 20.5 14V6A2.25 2.25 0 0 0 18.25 3.75h-11zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5a5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5zm5.13.62a1.13 1.13 0 1 1 0 2.25a1.13 1.13 0 0 1 0-2.25z" />
                              </svg>
                            </span>
                          </>
                        ) : (
                          <img src={item.url} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
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
          </>
        )}

        {/* Texto y botones debajo de la galería */}
        <div className="flex flex-col items-center gap-6 mb-8">
          <p className="text-lg text-slate-600 text-center max-w-xl animate-fade-in">
            Fotos y videos de The Badgers. Solo usuarios pueden subir contenido.
            <br />
            <span className="text-sm text-slate-500 mt-2 block">
              💡 Haz click en las imágenes grandes para pantalla completa, o doble click en las miniaturas
            </span>
          </p>
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

      {/* Modal de pantalla completa */}
      <GaleriaModal img={modalImg} onClose={() => setModalImg(null)} />
    </div>
  );
}

// Componente principal del sistema de torneo BJJ
function TorneoBJJ({ 
  setIsJudgingFullscreen, 
  isLoggedIn, 
  loginUser, 
  loginPass, 
  setShowLogin, 
  handleLogin, 
  handleLogout, 
  loginError, 
  showLogin 
}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tournaments, setTournaments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [activeTournament, setActiveTournament] = useState(null);

  // Cargar datos de prueba al montar el componente
  useEffect(() => {
    // Torneos de ejemplo
    const sampleTournaments = [
      {
        id: 1,
        name: 'Open BJJ 2025',
        status: 'active',
        date: '2025-08-15',
        location: 'Buenos Aires',
      },
      {
        id: 2,
        name: 'Copa Badgers',
        status: 'completed',
        date: '2025-07-10',
        location: 'Córdoba',
      }
    ];
    // Categorías de ejemplo
    const sampleCategories = [
      { id: 1, name: 'Adulto - Azul', weight: '-76kg', tournamentId: 1 },
      { id: 2, name: 'Adulto - Blanca', weight: '-70kg', tournamentId: 1 },
      { id: 3, name: 'Juvenil - Azul', weight: '-60kg', tournamentId: 2 }
    ];
    // Participantes de ejemplo
    const sampleParticipants = [
      { id: 1, name: 'Juan Pérez', categoryId: 1, team: 'Badgers', points: 12 },
      { id: 2, name: 'Lucas Gómez', categoryId: 1, team: 'Gracie', points: 8 },
      { id: 3, name: 'Martina López', categoryId: 2, team: 'Badgers', points: 10 },
      { id: 4, name: 'Sofía Torres', categoryId: 3, team: 'Alliance', points: 15 }
    ];
    setTournaments(sampleTournaments);
    setCategories(sampleCategories);
    setParticipants(sampleParticipants);
    setActiveTournament(sampleTournaments[0]);
  }, []);

  // Si no está logueado, mostrar pantalla de login
  if (!isLoggedIn) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 pt-20 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 w-full max-w-md mx-4">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              Sistema de Torneo BJJ
            </h1>
            <p className="text-cyan-200">
              Inicia sesión para acceder al sistema de torneos
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Usuario
              </label>
              <input
                type="text"
                name="user"
                className="w-full px-4 py-2 bg-white/20 text-white rounded-lg border border-cyan-500/30 focus:border-cyan-400 focus:outline-none placeholder-white/50"
                placeholder="Ingresa tu usuario"
                required
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Contraseña
              </label>
              <input
                type="password"
                name="pass"
                className="w-full px-4 py-2 bg-white/20 text-white rounded-lg border border-cyan-500/30 focus:border-cyan-400 focus:outline-none placeholder-white/50"
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>
            {loginError && (
              <div className="text-red-400 text-sm text-center bg-red-500/20 p-3 rounded-lg">
                {loginError}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Iniciar Sesión
            </button>
          </form>
          
          <div className="text-center mt-4">
            <p className="text-cyan-200 text-sm">
              Usa las mismas credenciales de la galería
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 pt-20 overflow-hidden">
      <div className="h-full max-w-7xl mx-auto px-4 py-8 flex flex-col">
        <div className="text-center mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-white mb-3 animate-fade-in">
              Sistema de Torneo BJJ
            </h1>
            <button
              onClick={handleLogout}
              className="bg-red-600/80 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Cerrar Sesión
            </button>
          </div>
          <p className="text-lg text-cyan-200 animate-fade-in delay-100">
            Gestión completa de torneos de Brazilian Jiu-Jitsu
          </p>
        </div>

          {/* Navigation Tabs */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 mb-6 animate-fade-in delay-200">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'dashboard', label: 'Panel Principal', icon: '🏆' },
                { id: 'tournaments', label: 'Torneos', icon: '🥋' },
                { id: 'categories', label: 'Categorías', icon: '⚖️' },
                { id: 'participants', label: 'Participantes', icon: '👥' },
                { id: 'brackets', label: 'Llaves', icon: '🌳' },
                { id: 'judging', label: 'Luchas' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${activeTab === tab.id
                    ? 'bg-cyan-500 text-white shadow-lg'
                    : 'text-white hover:bg-white/20'
                    }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto animate-fade-in delay-300">
            {activeTab === 'dashboard' && <TournamentDashboard tournaments={tournaments} activeTournament={activeTournament} />}
            {activeTab === 'tournaments' && <TournamentManager tournaments={tournaments} setTournaments={setTournaments} setActiveTournament={setActiveTournament} />}
            {activeTab === 'categories' && <CategoryManager categories={categories} setCategories={setCategories} />}
            {activeTab === 'participants' && <ParticipantManager participants={participants} setParticipants={setParticipants} categories={categories} />}
            {activeTab === 'brackets' && <BracketManager tournaments={tournaments} participants={participants} categories={categories} />}
            {activeTab === 'judging' && <JudgingSystem activeTournament={activeTournament} tournaments={tournaments} setIsJudgingFullscreen={setIsJudgingFullscreen} />}
          </div>
        </div>
      </div>
  );
}

// Dashboard Component
function TournamentDashboard({ tournaments, activeTournament }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-cyan-400/30">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🏆</span>
          <h3 className="text-xl font-bold text-white">Torneos Activos</h3>
        </div>
        <p className="text-3xl font-bold text-cyan-400">{tournaments.filter(t => t.status === 'active').length}</p>
        <p className="text-cyan-200">Torneos en progreso</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-cyan-400/30">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">👥</span>
          <h3 className="text-xl font-bold text-white">Participantes</h3>
        </div>
        <p className="text-3xl font-bold text-cyan-400">0</p>
        <p className="text-cyan-200">Total registrados</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-cyan-400/30">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">⚡</span>
          <h3 className="text-xl font-bold text-white">Luchas Hoy</h3>
        </div>
        <p className="text-3xl font-bold text-cyan-400">0</p>
        <p className="text-cyan-200">Combates programados</p>
      </div>

      {activeTournament && (
        <div className="md:col-span-2 lg:col-span-3 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-cyan-400/30">
          <h3 className="text-xl font-bold text-white mb-4">🏆 Torneo Activo: {activeTournament.name}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-cyan-400 font-semibold">Estado</p>
              <p className="text-white capitalize">{activeTournament.status}</p>
            </div>
            <div className="text-center">
              <p className="text-cyan-400 font-semibold">Fecha</p>
              <p className="text-white">{activeTournament.date}</p>
            </div>
            <div className="text-center">
              <p className="text-cyan-400 font-semibold">Categorías</p>
              <p className="text-white">{activeTournament.categories?.length || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-cyan-400 font-semibold">Participantes</p>
              <p className="text-white">{activeTournament.participants?.length || 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Tournament Manager Component
function TournamentManager({ tournaments, setTournaments, setActiveTournament }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
    ubicacion: '',
    descripcion: ''
  });

  // Cargar torneos al montar el componente
  const loadTournaments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await API.torneoAPI.getAll();
      setTournaments(data.results || data);
    } catch (error) {
      console.error('Error loading tournaments:', error);
      // Mostrar mensaje de error al usuario
    } finally {
      setLoading(false);
    }
  }, [setTournaments]);

  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const newTournament = await API.torneoAPI.create(formData);
      setTournaments([...tournaments, newTournament]);
      setFormData({ nombre: '', fecha_inicio: '', fecha_fin: '', ubicacion: '', descripcion: '' });
      setShowModal(false);
    } catch (error) {
      console.error('Error creating tournament:', error);
      alert('Error creando el torneo. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const activateTournament = async (tournament) => {
    try {
      await API.torneoAPI.activar(tournament.id);
      setActiveTournament(tournament);
      await loadTournaments(); // Recargar la lista
    } catch (error) {
      console.error('Error activating tournament:', error);
      alert('Error activando el torneo.');
    }
  };

  const finalizarTournament = async (tournament) => {
    try {
      await API.torneoAPI.finalizar(tournament.id);
      await loadTournaments(); // Recargar la lista
    } catch (error) {
      console.error('Error finalizing tournament:', error);
      alert('Error finalizando el torneo.');
    }
  };

  const deleteTournament = async (tournament) => {
    if (confirm(`¿Estás seguro de eliminar el torneo "${tournament.nombre}"?`)) {
      try {
        await API.torneoAPI.delete(tournament.id);
        await loadTournaments(); // Recargar la lista
      } catch (error) {
        console.error('Error deleting tournament:', error);
        alert('Error eliminando el torneo.');
      }
    }
  };

  if (loading && tournaments.length === 0) {
    return (
      <div className="text-center text-white">
        <p>Cargando torneos...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Gestión de Torneos</h2>
        <button
          onClick={() => setShowModal(true)}
          disabled={loading}
          className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          + Nuevo Torneo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map(tournament => (
          <div key={tournament.id} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-cyan-400/30">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">{tournament.nombre}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tournament.estado === 'activo' ? 'bg-green-500 text-white' :
                  tournament.estado === 'finalizado' ? 'bg-blue-500 text-white' :
                    tournament.estado === 'cancelado' ? 'bg-red-500 text-white' :
                      'bg-yellow-500 text-black'
                }`}>
                {tournament.estado}
              </span>
            </div>
            <p className="text-cyan-200 mb-2">📅 {tournament.fecha_inicio} - {tournament.fecha_fin}</p>
            <p className="text-cyan-200 mb-2">📍 {tournament.ubicacion}</p>
            <p className="text-cyan-200 mb-4 text-sm">{tournament.descripcion}</p>
            <div className="flex gap-2 flex-wrap">
              {tournament.estado === 'planificacion' && (
                <button
                  onClick={() => activateTournament(tournament)}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white px-4 py-2 rounded font-semibold text-sm transition-colors"
                >
                  Activar
                </button>
              )}
              {tournament.estado === 'activo' && (
                <button
                  onClick={() => finalizarTournament(tournament)}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white px-4 py-2 rounded font-semibold text-sm transition-colors"
                >
                  Finalizar
                </button>
              )}
              <button
                onClick={() => setActiveTournament(tournament)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded font-semibold text-sm transition-colors"
              >
                Gestionar
              </button>
              <button
                onClick={() => deleteTournament(tournament)}
                disabled={loading || tournament.estado === 'activo'}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-500 text-white px-4 py-2 rounded font-semibold text-sm transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para nuevo torneo */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full max-h-[50vh] overflow-y-auto border border-cyan-400/30 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6">Crear Nuevo Torneo</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-cyan-200 font-semibold mb-2">Nombre del Torneo</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-cyan-300 border border-cyan-400/30 focus:border-cyan-400 focus:outline-none"
                  placeholder="Ej: Campeonato BJJ 2025"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-cyan-200 font-semibold mb-2">Fecha de Inicio</label>
                <input
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-cyan-400/30 focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-cyan-200 font-semibold mb-2">Fecha de Fin</label>
                <input
                  type="date"
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-cyan-400/30 focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-cyan-200 font-semibold mb-2">Ubicación</label>
                <input
                  type="text"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-cyan-300 border border-cyan-400/30 focus:border-cyan-400 focus:outline-none"
                  placeholder="Ej: The Badgers Academy"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-cyan-200 font-semibold mb-2">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-cyan-300 border border-cyan-400/30 focus:border-cyan-400 focus:outline-none"
                  placeholder="Descripción del torneo..."
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-500 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  {loading ? 'Creando...' : 'Crear Torneo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Category Manager Component
function CategoryManager({ categories, setCategories }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    clase_peso: '',
    cinturon: '',
    grupo_edad: '',
    genero: ''
  });

  // Cargar categorías al montar el componente
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await API.categoriaAPI.getAll();
      setCategories(data.results || data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  }, [setCategories]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const newCategory = await API.categoriaAPI.create(formData);
      setCategories([...categories, newCategory]);
      setFormData({ nombre: '', clase_peso: '', cinturon: '', grupo_edad: '', genero: '' });
      setShowModal(false);
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error creando la categoría. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (category) => {
    if (confirm(`¿Estás seguro de eliminar la categoría "${category.nombre}"?`)) {
      try {
        await API.categoriaAPI.delete(category.id);
        await loadCategories(); // Recargar la lista
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error eliminando la categoría.');
      }
    }
  };

  const beltColors = ['Blanca', 'Azul', 'Púrpura', 'Marrón', 'Negra'];
  const weightClasses = [
    'Galo (-57.5kg)', 'Pluma (-64kg)', 'Ligero (-70kg)', 'Medio (-76kg)',
    'Medio-Pesado (-82.3kg)', 'Pesado (-88.3kg)', 'Super Pesado (-94.3kg)',
    'Pesadísimo (+94.3kg)'
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Gestión de Categorías</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          + Nueva Categoría
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => (
          <div key={category.id} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-cyan-400/30">
            <h3 className="text-lg font-bold text-white mb-3">{category.nombre}</h3>
            <div className="space-y-2 text-cyan-200">
              <p><span className="font-semibold">Peso:</span> {category.clase_peso}</p>
              <p><span className="font-semibold">Cinturón:</span> {category.cinturon}</p>
              <p><span className="font-semibold">Edad:</span> {category.grupo_edad}</p>
              <p><span className="font-semibold">Género:</span> {category.genero}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white px-3 py-2 rounded text-sm font-semibold transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => deleteCategory(category)}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-500 text-white px-3 py-2 rounded text-sm font-semibold transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para nueva categoría */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full max-h-[50vh] overflow-y-auto border border-cyan-400/30 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6">Crear Nueva Categoría</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-cyan-200 font-semibold mb-2">Nombre de la Categoría</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-cyan-300 border border-cyan-400/30 focus:border-cyan-400 focus:outline-none"
                  placeholder="Ej: Adulto Masculino Ligero Azul"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-cyan-200 font-semibold mb-2">Clase de Peso</label>
                <select
                  value={formData.clase_peso}
                  onChange={(e) => setFormData({ ...formData, clase_peso: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-cyan-400/30 focus:border-cyan-400 focus:outline-none"
                  required
                >
                  <option value="">Seleccionar peso</option>
                  {weightClasses.map(weight => (
                    <option key={weight} value={weight} className="bg-slate-800">{weight}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-cyan-200 font-semibold mb-2">Cinturón</label>
                <select
                  value={formData.cinturon}
                  onChange={(e) => setFormData({ ...formData, cinturon: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-cyan-400/30 focus:border-cyan-400 focus:outline-none"
                  required
                >
                  <option value="">Seleccionar cinturón</option>
                  {beltColors.map(belt => (
                    <option key={belt} value={belt} className="bg-slate-800">{belt}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-cyan-200 font-semibold mb-2">Grupo de Edad</label>
                <select
                  value={formData.grupo_edad}
                  onChange={(e) => setFormData({ ...formData, grupo_edad: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-cyan-400/30 focus:border-cyan-400 focus:outline-none"
                  required
                >
                  <option value="">Seleccionar edad</option>
                  <option value="Juvenil (16-17)" className="bg-slate-800">Juvenil (16-17)</option>
                  <option value="Adulto (18-29)" className="bg-slate-800">Adulto (18-29)</option>
                  <option value="Master 1 (30-35)" className="bg-slate-800">Master 1 (30-35)</option>
                  <option value="Master 2 (36-40)" className="bg-slate-800">Master 2 (36-40)</option>
                  <option value="Master 3 (41-45)" className="bg-slate-800">Master 3 (41-45)</option>
                  <option value="Master 4 (46-50)" className="bg-slate-800">Master 4 (46-50)</option>
                  <option value="Master 5 (51+)" className="bg-slate-800">Master 5 (51+)</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-cyan-200 font-semibold mb-2">Género</label>
                <select
                  value={formData.genero}
                  onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-cyan-400/30 focus:border-cyan-400 focus:outline-none"
                  required
                >
                  <option value="">Seleccionar género</option>
                  <option value="Masculino" className="bg-slate-800">Masculino</option>
                  <option value="Femenino" className="bg-slate-800">Femenino</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-500 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  {loading ? 'Creando...' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Participant Manager Component
function ParticipantManager({ participants, setParticipants, categories }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    academia: 'The Badgers',
    peso: '',
    cinturon: '',
    fecha_nacimiento: '',
    categoria_id: ''
  });

  // Cargar participantes al montar el componente
  const loadParticipants = useCallback(async () => {
    try {
      setLoading(true);
      const data = await API.participanteAPI.getAll();
      setParticipants(data.results || data);
    } catch (error) {
      console.error('Error loading participants:', error);
    } finally {
      setLoading(false);
    }
  }, [setParticipants]);

  useEffect(() => {
    loadParticipants();
  }, [loadParticipants]);

  const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const newParticipant = await API.participanteAPI.create(formData);
      setParticipants([...participants, newParticipant]);
      setFormData({ nombre: '', academia: 'The Badgers', peso: '', cinturon: '', fecha_nacimiento: '', categoria_id: '' });
      setShowModal(false);
    } catch (error) {
      console.error('Error creating participant:', error);
      alert('Error creando el participante. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const deleteParticipant = async (participant) => {
    if (confirm(`¿Estás seguro de eliminar al participante "${participant.nombre}"?`)) {
      try {
        await API.participanteAPI.delete(participant.id);
        await loadParticipants(); // Recargar la lista
      } catch (error) {
        console.error('Error deleting participant:', error);
        alert('Error eliminando el participante.');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Gestión de Participantes</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          + Nuevo Participante
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {participants.map(participant => {
          const category = categories.find(c => c.id.toString() === participant.categoria_id);
          const age = participant.fecha_nacimiento ? calculateAge(participant.fecha_nacimiento) : 0;
          return (
            <div key={participant.id} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-cyan-400/30">
              <h3 className="text-lg font-bold text-white mb-3">{participant.nombre}</h3>
              <div className="space-y-2 text-cyan-200">
                <p><span className="font-semibold">Academia:</span> {participant.academia}</p>
                <p><span className="font-semibold">Peso:</span> {participant.peso}kg</p>
                <p><span className="font-semibold">Cinturón:</span> {participant.cinturon}</p>
                <p><span className="font-semibold">Edad:</span> {age} años</p>
                {participant.fecha_nacimiento && (
                  <p><span className="font-semibold">Nacimiento:</span> {new Date(participant.fecha_nacimiento).toLocaleDateString('es-ES')}</p>
                )}
                <p><span className="font-semibold">Categoría:</span> {category?.nombre || 'Sin categoría'}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white px-3 py-2 rounded text-sm font-semibold transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteParticipant(participant)}
                  disabled={loading}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-500 text-white px-3 py-2 rounded text-sm font-semibold transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para nuevo participante */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full max-h-[50vh] overflow-y-auto border border-cyan-400/30 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-4">Registrar Participante</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block text-cyan-200 font-semibold mb-2">Nombre Completo</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white placeholder-cyan-300 border border-cyan-400/30 focus:border-cyan-400 focus:outline-none"
                  placeholder="Nombre del competidor"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-cyan-200 font-semibold mb-2">Academia</label>
                <input
                  type="text"
                  value={formData.academia}
                  onChange={(e) => setFormData({ ...formData, academia: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white placeholder-cyan-300 border border-cyan-400/30 focus:border-cyan-400 focus:outline-none"
                  placeholder="Nombre de la academia"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-cyan-200 font-semibold mb-2">Peso (kg)</label>
                <select
                  value={formData.peso}
                  onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white border border-cyan-400/30 focus:border-cyan-400 focus:outline-none"
                  required
                >
                  <option value="">Seleccionar peso</option>
                  <option value="49" className="bg-slate-800">49 kg</option>
                  <option value="52" className="bg-slate-800">52 kg</option>
                  <option value="56" className="bg-slate-800">56 kg</option>
                  <option value="60" className="bg-slate-800">60 kg</option>
                  <option value="64" className="bg-slate-800">64 kg</option>
                  <option value="69" className="bg-slate-800">69 kg</option>
                  <option value="74" className="bg-slate-800">74 kg</option>
                  <option value="79" className="bg-slate-800">79 kg</option>
                  <option value="85" className="bg-slate-800">85 kg</option>
                  <option value="91" className="bg-slate-800">91 kg</option>
                  <option value="97" className="bg-slate-800">97 kg</option>
                  <option value="105" className="bg-slate-800">105 kg</option>
                  <option value="120" className="bg-slate-800">120 kg</option>
                  <option value="120+" className="bg-slate-800">120+ kg</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-cyan-200 font-semibold mb-2">Cinturón</label>
                <select
                  value={formData.cinturon}
                  onChange={(e) => setFormData({ ...formData, cinturon: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white border border-cyan-400/30 focus:border-cyan-400 focus:outline-none"
                  required
                >
                  <option value="">Seleccionar cinturón</option>
                  <option value="Blanca" className="bg-slate-800">Blanca</option>
                  <option value="Azul" className="bg-slate-800">Azul</option>
                  <option value="Púrpura" className="bg-slate-800">Púrpura</option>
                  <option value="Marrón" className="bg-slate-800">Marrón</option>
                  <option value="Negra" className="bg-slate-800">Negra</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-cyan-200 font-semibold mb-2">Fecha de Nacimiento</label>
                <input
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white border border-cyan-400/30 focus:border-cyan-400 focus:outline-none"
                  required
                />
                {formData.fecha_nacimiento && (
                  <p className="text-cyan-300 text-sm mt-1">
                    Edad: {calculateAge(formData.fecha_nacimiento)} años
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-cyan-200 font-semibold mb-2">Categoría</label>
                <select
                  value={formData.categoria_id}
                  onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white border border-cyan-400/30 focus:border-cyan-400 focus:outline-none"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id} className="bg-slate-800">{category.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 sticky bottom-0 bg-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-600 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-500 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  {loading ? 'Registrando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Bracket Manager Component
function BracketManager({ tournaments, participants, categories }) {
  const [selectedTournament, setSelectedTournament] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [brackets, setBrackets] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const generateBracket = React.useCallback(() => {
    if (!selectedTournament || !selectedCategory) return;

    const categoryParticipants = participants.filter(p => p.categoryId === selectedCategory);

    if (categoryParticipants.length < 2) {
      setBrackets(prev => ({
        ...prev,
        [`${selectedTournament}-${selectedCategory}`]: null
      }));
      return;
    }

    // Generar llaves de eliminación simple
    const shuffled = [...categoryParticipants].sort(() => Math.random() - 0.5);
    const rounds = [];
    let currentRound = shuffled;

    // Calcular número de rondas necesarias
    const totalRounds = Math.ceil(Math.log2(shuffled.length));

    for (let round = 0; round < totalRounds; round++) {
      const matches = [];
      for (let i = 0; i < currentRound.length; i += 2) {
        if (i + 1 < currentRound.length) {
          matches.push({
            id: `${round}-${i / 2}`,
            participant1: currentRound[i],
            participant2: currentRound[i + 1],
            winner: null,
            status: 'pending',
            editable: true
          });
        } else {
          // Bye (pasa automáticamente)
          matches.push({
            id: `${round}-${i / 2}`,
            participant1: currentRound[i],
            participant2: null,
            winner: currentRound[i],
            status: 'bye',
            editable: false
          });
        }
      }
      rounds.push(matches);
      currentRound = matches.map(m => m.winner || m.participant1);
    }

    setBrackets(prev => ({
      ...prev,
      [`${selectedTournament}-${selectedCategory}`]: rounds
    }));
  }, [selectedTournament, selectedCategory, participants]);

  // Generar llave automáticamente cuando se selecciona torneo y categoría
  React.useEffect(() => {
    if (selectedTournament && selectedCategory && !isLocked) {
      generateBracket();
    }
  }, [selectedTournament, selectedCategory, participants, isLocked, generateBracket]);

  const swapParticipants = (roundIndex, matchIndex, participant1, participant2) => {
    setBrackets(prev => {
      const updated = { ...prev };
      const currentBracket = updated[`${selectedTournament}-${selectedCategory}`];

      if (currentBracket && currentBracket[roundIndex] && currentBracket[roundIndex][matchIndex]) {
        currentBracket[roundIndex][matchIndex].participant1 = participant2;
        currentBracket[roundIndex][matchIndex].participant2 = participant1;
      }
      return updated;
    });
  };

  const lockBracket = () => {
    setIsLocked(true);
    setEditMode(false);
    setBrackets(prev => {
      const updated = { ...prev };
      const currentBracket = updated[`${selectedTournament}-${selectedCategory}`];

      if (currentBracket) {
        currentBracket.forEach(round => {
          round.forEach(match => {
            match.editable = false;
          });
        });
      }
      return updated;
    });
  };

  const unlockBracket = () => {
    setIsLocked(false);
    setBrackets(prev => {
      const updated = { ...prev };
      const currentBracket = updated[`${selectedTournament}-${selectedCategory}`];

      if (currentBracket) {
        currentBracket.forEach(round => {
          round.forEach(match => {
            if (match.status === 'pending' && match.participant2) {
              match.editable = true;
            }
          });
        });
      }
      return updated;
    });
  };

  const setWinner = (roundIndex, matchIndex, winner) => {
    setBrackets(prev => {
      const updated = { ...prev };
      updated[`${selectedTournament}-${selectedCategory}`][roundIndex][matchIndex].winner = winner;
      updated[`${selectedTournament}-${selectedCategory}`][roundIndex][matchIndex].status = 'completed';
      return updated;
    });
  };

  const currentBracket = brackets[`${selectedTournament}-${selectedCategory}`];
  const categoryParticipants = participants.filter(p => p.categoryId === selectedCategory);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-4">Gestión de Llaves</h2>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-4 border border-cyan-400/30">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-cyan-200 font-semibold mb-2">Torneo</label>
              <select
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white border border-cyan-400/30 focus:border-cyan-400 focus:outline-none text-sm"
              >
                <option value="">Seleccionar torneo</option>
                {tournaments.map(tournament => (
                  <option key={tournament.id} value={tournament.id} className="bg-slate-800">{tournament.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-cyan-200 font-semibold mb-2">Categoría</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white border border-cyan-400/30 focus:border-cyan-400 focus:outline-none text-sm"
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id} className="bg-slate-800">{category.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={generateBracket}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-3 rounded-lg font-semibold transition-colors text-sm"
                disabled={isLocked}
              >
                Regenerar
              </button>
            </div>
            <div className="flex items-end gap-2">
              {!isLocked ? (
                <>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className={`flex-1 ${editMode ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-500 hover:bg-blue-600'} text-white py-2 px-3 rounded-lg font-semibold transition-colors text-sm`}
                  >
                    {editMode ? 'Terminar Edición' : 'Editar'}
                  </button>
                  <button
                    onClick={lockBracket}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg font-semibold transition-colors text-sm"
                  >
                    Iniciar Categoría
                  </button>
                </>
              ) : (
                <button
                  onClick={unlockBracket}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg font-semibold transition-colors text-sm"
                >
                  Desbloquear
                </button>
              )}
            </div>
          </div>
        </div>

        {selectedCategory && categoryParticipants.length < 2 && (
          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4 mb-4">
            <p className="text-yellow-200 text-center">
              ⚠️ Se necesitan al menos 2 participantes para generar una llave.
              Participantes actuales: {categoryParticipants.length}
            </p>
          </div>
        )}

        {isLocked && (
          <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4 mb-4">
            <p className="text-green-200 text-center">
              🔒 Categoría iniciada - La llave está bloqueada para edición
            </p>
          </div>
        )}
      </div>

      {currentBracket && (
        <div className="flex-1 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-cyan-400/30 overflow-hidden">
          <div className="h-full overflow-auto">
            <div className="flex gap-6 pb-4">
              {currentBracket.map((round, roundIndex) => (
                <div key={roundIndex} className="min-w-56 flex-shrink-0">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-3 text-center">
                    {roundIndex === currentBracket.length - 1 ? 'Final' : `Ronda ${roundIndex + 1}`}
                  </h4>
                  <div className="space-y-3">
                    {round.map((match, matchIndex) => (
                      <div key={match.id} className={`bg-white/10 rounded-lg p-3 border border-cyan-400/20 ${editMode && match.editable ? 'ring-2 ring-orange-400/50' : ''}`}>
                        <div className="space-y-2">
                          <div className={`p-2 rounded text-sm ${match.winner?.id === match.participant1?.id ? 'bg-green-500/30' : 'bg-white/10'}`}>
                            <p className="text-white font-semibold">{match.participant1?.name}</p>
                            <p className="text-cyan-200 text-xs">{match.participant1?.academy}</p>
                          </div>
                          {match.participant2 ? (
                            <div className={`p-2 rounded text-sm ${match.winner?.id === match.participant2?.id ? 'bg-green-500/30' : 'bg-white/10'}`}>
                              <p className="text-white font-semibold">{match.participant2.name}</p>
                              <p className="text-cyan-200 text-xs">{match.participant2.academy}</p>
                            </div>
                          ) : (
                            <div className="p-2 rounded bg-yellow-500/30 text-sm">
                              <p className="text-yellow-200 text-xs text-center">Pase automático</p>
                            </div>
                          )}
                        </div>

                        {editMode && match.editable && match.participant2 && (
                          <div className="mt-2">
                            <button
                              onClick={() => swapParticipants(roundIndex, matchIndex, match.participant1, match.participant2)}
                              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-1 px-2 rounded text-sm"
                            >
                              ↕️ Intercambiar
                            </button>
                          </div>
                        )}

                        {match.status === 'pending' && match.participant2 && !editMode && (
                          <div className="mt-2 flex gap-1">
                            <button
                              onClick={() => setWinner(roundIndex, matchIndex, match.participant1)}
                              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1 px-1 rounded text-sm"
                            >
                              P1
                            </button>
                            <button
                              onClick={() => setWinner(roundIndex, matchIndex, match.participant2)}
                              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1 px-1 rounded text-sm"
                            >
                              P2
                            </button>
                          </div>
                        )}

                        {match.status === 'completed' && (
                          <div className="mt-2 text-center">
                            <span className="text-green-400 font-semibold text-xs">✓ Completado</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Judging System Component (similar a la imagen proporcionada)
function JudgingSystem({ setIsJudgingFullscreen }) {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [timer, setTimer] = useState(300); // 5 minutos por defecto
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [colorsSwapped, setColorsSwapped] = useState(false);
  const [scores, setScores] = useState({
    participant1: { points: 0, advantages: 0, penalties: 0 },
    participant2: { points: 0, advantages: 0, penalties: 0 }
  });

  // Simulación de luchas disponibles
  const availableMatches = [
    {
      id: 1,
      participant1: { name: 'Reginald Washington', academy: 'Skyline Sports' },
      participant2: { name: 'Jeffrey Worthington', academy: 'Patriot Athletics' },
      category: 'Adulto Masculino Ligero Azul',
      round: 'Final'
    }
  ];

  React.useEffect(() => {
    let interval = null;
    if (isRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timer]);

  // Listener para detectar cambios en pantalla completa
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement);

      if (!isCurrentlyFullscreen && isFullscreen) {
        setIsFullscreen(false);
        setIsJudgingFullscreen(false); // Mostrar navbar cuando se sale de pantalla completa
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen, setIsJudgingFullscreen]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const adjustScore = (participant, type, delta) => {
    setScores(prev => ({
      ...prev,
      [participant]: {
        ...prev[participant],
        [type]: Math.max(0, prev[participant][type] + delta)
      }
    }));
  };

  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        await document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        await document.documentElement.msRequestFullscreen();
      }
      setIsFullscreen(true);
      setIsJudgingFullscreen(true); // Ocultar navbar
    } catch (error) {
      console.log('Error entering fullscreen:', error);
      // Si falla la pantalla completa nativa, usar fullscreen simulado
      setIsFullscreen(true);
      setIsJudgingFullscreen(true); // Ocultar navbar
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
    } catch (error) {
      console.log('Error exiting fullscreen:', error);
    }
    setIsFullscreen(false);
    setIsJudgingFullscreen(false); // Mostrar navbar
  };

  const handleStartMatch = (match) => {
    setSelectedMatch(match);
    // NO activar pantalla completa automáticamente al iniciar la lucha
  };

  if (!selectedMatch) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Sistema de Judging</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableMatches.map(match => (
            <div key={match.id} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-cyan-400/30">
              <h3 className="text-lg font-bold text-white mb-3">{match.round}</h3>
              <p className="text-cyan-200 mb-2">{match.category}</p>
              <div className="space-y-2 mb-4">
                <div className="bg-red-500/20 p-3 rounded border border-red-400/30">
                  <p className="text-white font-semibold">{match.participant1.name}</p>
                  <p className="text-red-200 text-sm">{match.participant1.academy}</p>
                </div>
                <div className="text-center text-cyan-300 font-bold">VS</div>
                <div className="bg-blue-500/20 p-3 rounded border border-blue-400/30">
                  <p className="text-white font-semibold">{match.participant2.name}</p>
                  <p className="text-blue-200 text-sm">{match.participant2.academy}</p>
                </div>
              </div>
              <button
                onClick={() => handleStartMatch(match)}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Iniciar Lucha
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Determinar qué participante mostrar en cada lado según los colores intercambiados
  const leftParticipant = colorsSwapped ? selectedMatch.participant2 : selectedMatch.participant1;
  const rightParticipant = colorsSwapped ? selectedMatch.participant1 : selectedMatch.participant2;
  const leftScore = colorsSwapped ? 'participant2' : 'participant1';
  const rightScore = colorsSwapped ? 'participant1' : 'participant2';
  const leftColorStyle = colorsSwapped ? 'blue' : 'red';
  const rightColorStyle = colorsSwapped ? 'red' : 'blue';

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-[70] bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 p-2 overflow-auto flex flex-col' : 'max-w-6xl mx-auto'}`}>
      {/* Header - oculto en pantalla completa */}
      {!isFullscreen && (
        <div className="text-center mb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => isFullscreen ? exitFullscreen() : enterFullscreen()}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
              >
                {isFullscreen ? '🗗 Salir Pantalla Completa' : '🗖 Pantalla Completa'}
              </button>
              {!isRunning && (
                <button
                  onClick={() => setColorsSwapped(!colorsSwapped)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                >
                  🔄 Intercambiar Colores
                </button>
              )}
            </div>
          </div>
          <h2 className={`${isFullscreen ? 'text-2xl' : 'text-3xl'} font-bold text-white mb-2`}>Sistema de Judging</h2>
          <p className="text-cyan-200">{selectedMatch.category} • {selectedMatch.round}</p>
        </div>
      )}

      {/* Botón cerrar en pantalla completa */}
      {isFullscreen && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={exitFullscreen}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
          >
            ✕ Cerrar
          </button>
        </div>
      )}

      {/* Timer */}
      <div className="text-center mb-4 flex-shrink-0">
        <div className="bg-black/50 rounded-xl p-4 mb-4 border border-cyan-400/30 inline-block">
          <div className={`${isFullscreen ? 'text-4xl' : 'text-6xl'} font-bold text-green-400 mb-2`}>{formatTime(timer)}</div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={async () => {
                if (!isRunning) {
                  // Si se está iniciando el timer, entrar en pantalla completa automáticamente
                  await enterFullscreen();
                }
                setIsRunning(!isRunning);
              }}
              className={`bg-green-500 hover:bg-green-600 text-white ${isFullscreen ? 'px-4 py-2 text-sm' : 'px-6 py-3'} rounded-lg font-semibold transition-colors`}
            >
              {isRunning ? 'Pausar' : 'Iniciar'}
            </button>
            <button
              onClick={() => setTimer(300)}
              className={`bg-blue-500 hover:bg-blue-600 text-white ${isFullscreen ? 'px-4 py-2 text-sm' : 'px-6 py-3'} rounded-lg font-semibold transition-colors`}
            >
              Reiniciar
            </button>
            <button
              onClick={() => {
                const newTime = prompt('Tiempo en segundos:', timer);
                if (newTime && !isNaN(newTime)) setTimer(parseInt(newTime));
              }}
              className={`bg-cyan-500 hover:bg-cyan-600 text-white ${isFullscreen ? 'px-4 py-2 text-sm' : 'px-6 py-3'} rounded-lg font-semibold transition-colors`}
            >
              Editar Tiempo
            </button>
          </div>
        </div>
      </div>

      {/* Scoring Interface */}
      <div className={`grid grid-cols-2 gap-4 mb-4 flex-1 ${isFullscreen ? 'min-h-0' : ''}`}>
        {/* Left Participant (Red by default, Blue when swapped) */}
        <div className={`bg-${leftColorStyle}-500/20 backdrop-blur-md rounded-xl p-4 border border-${leftColorStyle}-400/30 flex flex-col ${isFullscreen ? 'min-h-0' : ''}`}>
          <div className="text-center mb-4 flex-shrink-0">
            <h3 className={`${isFullscreen ? 'text-xl' : 'text-2xl'} font-bold text-white`}>{leftParticipant.name}</h3>
            <p className={`text-${leftColorStyle}-200`}>{leftParticipant.academy}</p>
          </div>

          <div className="text-center mb-4 flex-shrink-0">
            <div className={`${isFullscreen ? 'text-4xl' : 'text-6xl'} font-bold text-white mb-2`}>{scores[leftScore].points}</div>
            <p className={`text-${leftColorStyle}-200`}>Puntos</p>
          </div>

          {/* Point Buttons */}
          <div className={`grid grid-cols-2 gap-2 mb-4 flex-shrink-0`}>
            <button
              onClick={() => adjustScore(leftScore, 'points', -4)}
              className={`bg-${leftColorStyle}-600 hover:bg-${leftColorStyle}-700 text-white ${isFullscreen ? 'py-2 text-sm' : 'py-3'} rounded-lg font-semibold`}
            >
              -4
            </button>
            <button
              onClick={() => adjustScore(leftScore, 'points', 4)}
              className={`bg-${leftColorStyle}-600 hover:bg-${leftColorStyle}-700 text-white ${isFullscreen ? 'py-2 text-sm' : 'py-3'} rounded-lg font-semibold`}
            >
              +4
            </button>
            <button
              onClick={() => adjustScore(leftScore, 'points', -3)}
              className={`bg-${leftColorStyle}-600 hover:bg-${leftColorStyle}-700 text-white ${isFullscreen ? 'py-2 text-sm' : 'py-3'} rounded-lg font-semibold`}
            >
              -3
            </button>
            <button
              onClick={() => adjustScore(leftScore, 'points', 3)}
              className={`bg-${leftColorStyle}-600 hover:bg-${leftColorStyle}-700 text-white ${isFullscreen ? 'py-2 text-sm' : 'py-3'} rounded-lg font-semibold`}
            >
              +3
            </button>
            <button
              onClick={() => adjustScore(leftScore, 'points', -2)}
              className={`bg-${leftColorStyle}-600 hover:bg-${leftColorStyle}-700 text-white ${isFullscreen ? 'py-2 text-sm' : 'py-3'} rounded-lg font-semibold`}
            >
              -2
            </button>
            <button
              onClick={() => adjustScore(leftScore, 'points', 2)}
              className={`bg-${leftColorStyle}-600 hover:bg-${leftColorStyle}-700 text-white ${isFullscreen ? 'py-2 text-sm' : 'py-3'} rounded-lg font-semibold`}
            >
              +2
            </button>
          </div>

          {/* Advantages and Penalties */}
          <div className="grid grid-cols-2 gap-2 flex-1">
            <div className="bg-green-500/30 rounded-lg p-3 text-center">
              <p className="text-green-200 font-semibold mb-2 text-sm">Ventajas</p>
              <div className={`${isFullscreen ? 'text-xl' : 'text-2xl'} font-bold text-white mb-2`}>{scores[leftScore].advantages}</div>
              <div className="flex gap-1">
                <button
                  onClick={() => adjustScore(leftScore, 'advantages', -1)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 rounded text-sm"
                >
                  -
                </button>
                <button
                  onClick={() => adjustScore(leftScore, 'advantages', 1)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 rounded text-sm"
                >
                  +
                </button>
              </div>
            </div>

            <div className="bg-red-500/30 rounded-lg p-3 text-center">
              <p className="text-red-200 font-semibold mb-2 text-sm">Penalizaciones</p>
              <div className={`${isFullscreen ? 'text-xl' : 'text-2xl'} font-bold text-white mb-2`}>{scores[leftScore].penalties}</div>
              <div className="flex gap-1">
                <button
                  onClick={() => adjustScore(leftScore, 'penalties', -1)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded text-sm"
                >
                  -
                </button>
                <button
                  onClick={() => adjustScore(leftScore, 'penalties', 1)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded text-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Participant (Blue by default, Red when swapped) */}
        <div className={`bg-${rightColorStyle}-500/20 backdrop-blur-md rounded-xl p-4 border border-${rightColorStyle}-400/30 flex flex-col ${isFullscreen ? 'min-h-0' : ''}`}>
          <div className="text-center mb-4 flex-shrink-0">
            <h3 className={`${isFullscreen ? 'text-xl' : 'text-2xl'} font-bold text-white`}>{rightParticipant.name}</h3>
            <p className={`text-${rightColorStyle}-200`}>{rightParticipant.academy}</p>
          </div>

          <div className="text-center mb-4 flex-shrink-0">
            <div className={`${isFullscreen ? 'text-4xl' : 'text-6xl'} font-bold text-white mb-2`}>{scores[rightScore].points}</div>
            <p className={`text-${rightColorStyle}-200`}>Puntos</p>
          </div>

          {/* Point Buttons */}
          <div className={`grid grid-cols-2 gap-2 mb-4 flex-shrink-0`}>
            <button
              onClick={() => adjustScore(rightScore, 'points', -4)}
              className={`bg-${rightColorStyle}-600 hover:bg-${rightColorStyle}-700 text-white ${isFullscreen ? 'py-2 text-sm' : 'py-3'} rounded-lg font-semibold`}
            >
              -4
            </button>
            <button
              onClick={() => adjustScore(rightScore, 'points', 4)}
              className={`bg-${rightColorStyle}-600 hover:bg-${rightColorStyle}-700 text-white ${isFullscreen ? 'py-2 text-sm' : 'py-3'} rounded-lg font-semibold`}
            >
              +4
            </button>
            <button
              onClick={() => adjustScore(rightScore, 'points', -3)}
              className={`bg-${rightColorStyle}-600 hover:bg-${rightColorStyle}-700 text-white ${isFullscreen ? 'py-2 text-sm' : 'py-3'} rounded-lg font-semibold`}
            >
              -3
            </button>
            <button
              onClick={() => adjustScore(rightScore, 'points', 3)}
              className={`bg-${rightColorStyle}-600 hover:bg-${rightColorStyle}-700 text-white ${isFullscreen ? 'py-2 text-sm' : 'py-3'} rounded-lg font-semibold`}
            >
              +3
            </button>
            <button
              onClick={() => adjustScore(rightScore, 'points', -2)}
              className={`bg-${rightColorStyle}-600 hover:bg-${rightColorStyle}-700 text-white ${isFullscreen ? 'py-2 text-sm' : 'py-3'} rounded-lg font-semibold`}
            >
              -2
            </button>
            <button
              onClick={() => adjustScore(rightScore, 'points', 2)}
              className={`bg-${rightColorStyle}-600 hover:bg-${rightColorStyle}-700 text-white ${isFullscreen ? 'py-2 text-sm' : 'py-3'} rounded-lg font-semibold`}
            >
              +2
            </button>
          </div>

          {/* Advantages and Penalties */}
          <div className="grid grid-cols-2 gap-2 flex-1">
            <div className="bg-green-500/30 rounded-lg p-3 text-center">
              <p className="text-green-200 font-semibold mb-2 text-sm">Ventajas</p>
              <div className={`${isFullscreen ? 'text-xl' : 'text-2xl'} font-bold text-white mb-2`}>{scores[rightScore].advantages}</div>
              <div className="flex gap-1">
                <button
                  onClick={() => adjustScore(rightScore, 'advantages', -1)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 rounded text-sm"
                >
                  -
                </button>
                <button
                  onClick={() => adjustScore(rightScore, 'advantages', 1)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 rounded text-sm"
                >
                  +
                </button>
              </div>
            </div>

            <div className="bg-red-500/30 rounded-lg p-3 text-center">
              <p className="text-red-200 font-semibold mb-2 text-sm">Penalizaciones</p>
              <div className={`${isFullscreen ? 'text-xl' : 'text-2xl'} font-bold text-white mb-2`}>{scores[rightScore].penalties}</div>
              <div className="flex gap-1">
                <button
                  onClick={() => adjustScore(rightScore, 'penalties', -1)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded text-sm"
                >
                  -
                </button>
                <button
                  onClick={() => adjustScore(rightScore, 'penalties', 1)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded text-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons - ocultos en pantalla completa */}
      {!isFullscreen && (
        <div className="text-center flex-shrink-0">
          <div className={`flex gap-2 justify-center ${isFullscreen ? 'flex-wrap' : ''}`}>
            <button
              onClick={async () => {
                if (confirm('¿Guardar el resultado de esta lucha?')) {
                  // Lógica para guardar resultado
                  alert('Resultado guardado');
                  await exitFullscreen();
                  setSelectedMatch(null);
                  setScores({
                    participant1: { points: 0, advantages: 0, penalties: 0 },
                    participant2: { points: 0, advantages: 0, penalties: 0 }
                  });
                  setTimer(300);
                  setIsRunning(false);
                  setIsFullscreen(false);
                  setIsJudgingFullscreen(false); // Mostrar navbar
                  setColorsSwapped(false);
                }
              }}
              className={`bg-blue-500 hover:bg-blue-600 text-white ${isFullscreen ? 'px-4 py-2 text-sm' : 'px-8 py-3'} rounded-lg font-semibold transition-colors`}
            >
              💾 Guardar Resultado
            </button>
            <button
              onClick={() => {
                if (confirm('¿Editar el tiempo de la lucha?')) {
                  const newTime = prompt('Tiempo en minutos:', Math.floor(timer / 60));
                  if (newTime && !isNaN(newTime)) setTimer(parseInt(newTime) * 60);
                }
              }}
              className={`bg-cyan-500 hover:bg-cyan-600 text-white ${isFullscreen ? 'px-4 py-2 text-sm' : 'px-8 py-3'} rounded-lg font-semibold transition-colors`}
            >
              ⏱️ Editar Tiempo
            </button>
            <button
              onClick={async () => {
                if (confirm('¿Volver a la lista de luchas?')) {
                  await exitFullscreen();
                  setSelectedMatch(null);
                  setScores({
                    participant1: { points: 0, advantages: 0, penalties: 0 },
                    participant2: { points: 0, advantages: 0, penalties: 0 }
                  });
                  setTimer(300);
                  setIsRunning(false);
                  setIsFullscreen(false);
                  setIsJudgingFullscreen(false); // Mostrar navbar
                  setColorsSwapped(false);
                }
              }}
              className={`bg-gray-500 hover:bg-gray-600 text-white ${isFullscreen ? 'px-4 py-2 text-sm' : 'px-8 py-3'} rounded-lg font-semibold transition-colors`}
            >
              ⬅️ Volver
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [isJudgingFullscreen, setIsJudgingFullscreen] = React.useState(false);
  
  // Variables de login compartidas entre Galeria y Torneo
  // No inicializar automáticamente desde localStorage para evitar 401 errors
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState('');

  // API base URL
  const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://thebadgerspage.onrender.com';

  // Verificar credenciales almacenadas al cargar la aplicación
  useEffect(() => {
    const storedUser = localStorage.getItem('badgers_user');
    const storedPass = localStorage.getItem('badgers_pass');
    
    // Solo intentar auto-login si tenemos credenciales almacenadas
    if (storedUser && storedPass) {
      // Verificar si las credenciales siguen siendo válidas
      fetch(`${API_BASE}/api/galeria/`, {
        headers: {
          'Authorization': 'Basic ' + btoa(`${storedUser}:${storedPass}`)
        }
      })
      .then(res => {
        if (res.ok) {
          // Credenciales válidas, iniciar sesión automáticamente
          setLoginUser(storedUser);
          setLoginPass(storedPass);
          setIsLoggedIn(true);
        } else {
          // Credenciales inválidas, limpiar localStorage
          localStorage.removeItem('badgers_user');
          localStorage.removeItem('badgers_pass');
        }
      })
      .catch(() => {
        // Error de red, limpiar localStorage
        localStorage.removeItem('badgers_user');
        localStorage.removeItem('badgers_pass');
      });
    }
  }, [API_BASE]);

  // Función de login compartida
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

  // Función de logout compartida
  function handleLogout() {
    localStorage.removeItem('badgers_user');
    localStorage.removeItem('badgers_pass');
    setLoginUser('');
    setLoginPass('');
    setIsLoggedIn(false);
  }

  return (
    <div className="App">
      {!isJudgingFullscreen && <Navbar />}
      <Routes>
        <Route path="/" element={<><Hero /><SobreNosotrosYClases /><Contacto /></>} />
        <Route path="/tienda" element={<Tienda />} />
        <Route path="/galeria" element={
          <Galeria 
            isLoggedIn={isLoggedIn}
            loginUser={loginUser}
            loginPass={loginPass}
            setShowLogin={setShowLogin}
            handleLogin={handleLogin}
            handleLogout={handleLogout}
            loginError={loginError}
            showLogin={showLogin}
            API_BASE={API_BASE}
            setLoginPass={setLoginPass}
          />
        } />
        <Route path="/torneo" element={
          <TorneoBJJ 
            setIsJudgingFullscreen={setIsJudgingFullscreen} 
            isLoggedIn={isLoggedIn}
            loginUser={loginUser}
            loginPass={loginPass}
            setShowLogin={setShowLogin}
            handleLogin={handleLogin}
            handleLogout={handleLogout}
            loginError={loginError}
          />
        } />
      </Routes>
    </div>
  );
}
