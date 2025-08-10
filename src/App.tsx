import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Contact from './components/Contact';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';

function App() {
  const [activeSection, setActiveSection] = useState('accueil');

  return (
    <div className="min-h-screen bg-white">
      <Header activeSection={activeSection} setActiveSection={setActiveSection} />
      <main>
        {activeSection === 'accueil' && <Hero setActiveSection={setActiveSection} />}
        {activeSection === 'services' && <Services />}
        {activeSection === 'apropos' && <About />}
        {activeSection === 'contact' && <Contact />}
        {activeSection === 'temoignages' && <Testimonials />}
      </main>
      <Footer setActiveSection={setActiveSection} />
    </div>
  );
}

export default App;