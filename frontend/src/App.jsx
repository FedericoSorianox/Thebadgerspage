import React, { useEffect, useState } from "react";
import axios from "axios";

function Navbar() {
  return (
    <nav className="bg-white shadow-md dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">MiSitio</span>
        <ul className="flex space-x-6">
          <li><a href="#inicio" className="text-gray-700 dark:text-gray-200 hover:text-blue-600">Inicio</a></li>
          <li><a href="#servicios" className="text-gray-700 dark:text-gray-200 hover:text-blue-600">Servicios</a></li>
          <li><a href="#contacto" className="text-gray-700 dark:text-gray-200 hover:text-blue-600">Contacto</a></li>
        </ul>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section id="inicio" className="bg-gradient-to-br from-blue-100 to-blue-300 dark:from-gray-800 dark:to-gray-900 py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6">Bienvenido a <span className="text-blue-600 dark:text-blue-400">MiSitio</span></h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">Tu solución moderna para páginas web atractivas y funcionales. ¡Impulsa tu presencia online con nosotros!</p>
        <a href="#servicios" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition">Ver servicios</a>
      </div>
    </section>
  );
}

function Servicios() {
  return (
    <section id="servicios" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Nuestros Servicios</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-blue-50 dark:bg-gray-800 p-8 rounded-lg shadow hover:scale-105 transition">
            <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4">Diseño Web</h3>
            <p className="text-gray-700 dark:text-gray-300">Creamos sitios web modernos, responsivos y atractivos para tu negocio o proyecto personal.</p>
          </div>
          <div className="bg-blue-50 dark:bg-gray-800 p-8 rounded-lg shadow hover:scale-105 transition">
            <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4">Desarrollo a Medida</h3>
            <p className="text-gray-700 dark:text-gray-300">Soluciones personalizadas usando las últimas tecnologías para cubrir tus necesidades.</p>
          </div>
          <div className="bg-blue-50 dark:bg-gray-800 p-8 rounded-lg shadow hover:scale-105 transition">
            <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4">Soporte y Mantenimiento</h3>
            <p className="text-gray-700 dark:text-gray-300">Acompañamiento continuo para que tu web siempre esté actualizada y segura.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Contacto() {
  return (
    <section id="contacto" className="py-20 bg-blue-100 dark:bg-gray-800">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Contacto</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-8">¿Listo para empezar tu proyecto? ¡Contáctanos!</p>
        <a href="mailto:info@misitio.com" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition">Enviar Email</a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} MiSitio. Todos los derechos reservados.
      </div>
    </footer>
  );
}

export default function App() {
  const [mensajeApi, setMensajeApi] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8000/api/")
      .then(res => setMensajeApi(res.data.mensaje))
      .catch(() => setMensajeApi("No se pudo conectar con el backend"));
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        {mensajeApi && (
          <div className="max-w-xl mx-auto my-6 p-4 bg-green-100 text-green-800 rounded text-center shadow">
            {mensajeApi}
          </div>
        )}
        <Servicios />
        <Contacto />
      </main>
      <Footer />
    </div>
  );
}
