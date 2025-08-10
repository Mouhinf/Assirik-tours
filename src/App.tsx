import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Destinations from './components/Destinations';
import WhyChooseUs from './components/WhyChooseUs';
import Contact from './components/Contact';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ReservationModal from './components/ReservationModal';
import QuoteModal from './components/QuoteModal';

function App() {
  const [currentPage, setCurrentPage] = useState('accueil');
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'accueil':
        return (
          <>
            <Hero 
              onReservation={() => setIsReservationModalOpen(true)}
              onQuote={() => setIsQuoteModalOpen(true)}
            />
            <Services />
            <About />
            <WhyChooseUs />
            <Destinations />
            <Contact />
          </>
        );
      case 'apropos':
        return <About expanded />;
      case 'services':
        return <Services expanded />;
      case 'destinations':
        return <Destinations expanded />;
      case 'contact':
        return <Contact expanded />;
      default:
        return (
          <>
            <Hero 
              onReservation={() => setIsReservationModalOpen(true)}
              onQuote={() => setIsQuoteModalOpen(true)}
            />
            <Services />
            <About />
            <WhyChooseUs />
            <Destinations />
            <Contact />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />
      <main>
        {renderPage()}
      </main>
      <Footer onPageChange={setCurrentPage} />
      <WhatsAppButton />
      
      <ReservationModal 
        isOpen={isReservationModalOpen} 
        onClose={() => setIsReservationModalOpen(false)} 
      />
      <QuoteModal 
        isOpen={isQuoteModalOpen} 
        onClose={() => setIsQuoteModalOpen(false)} 
      />
    </div>
  );
}

export default App;