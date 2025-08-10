import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, Clock } from 'lucide-react';

interface ContactProps {
  expanded?: boolean;
}

const Contact: React.FC<ContactProps> = ({ expanded = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Contact form submitted:', formData);
    alert('Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter subscription:', newsletterEmail);
    alert('Merci pour votre inscription à notre newsletter !');
    setNewsletterEmail('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-6">
            Contactez-nous
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Notre équipe est à votre écoute pour répondre à toutes vos questions 
            et vous accompagner dans vos projets de voyage.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-navy-900 mb-6">Nos Coordonnées</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-12 h-12 bg-gold-100 rounded-full mr-4">
                    <MapPin className="h-6 w-6 text-gold-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-navy-900">Adresse</h4>
                    <p className="text-gray-600">Rue 22 prolongée, Fass Delorme, Dakar, Sénégal</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center justify-center w-12 h-12 bg-gold-100 rounded-full mr-4">
                    <Phone className="h-6 w-6 text-gold-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-navy-900">Téléphone</h4>
                    <p className="text-gray-600">+221 77 549 53 14</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center justify-center w-12 h-12 bg-gold-100 rounded-full mr-4">
                    <Mail className="h-6 w-6 text-gold-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-navy-900">Email</h4>
                    <p className="text-gray-600">assikirtours@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center justify-center w-12 h-12 bg-gold-100 rounded-full mr-4">
                    <Clock className="h-6 w-6 text-gold-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-navy-900">Horaires</h4>
                    <p className="text-gray-600">Lun - Ven: 9h00 - 18h00</p>
                    <p className="text-gray-600">Sam - Dim: Fermé</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-gray-200 rounded-xl h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Carte Google Maps</p>
                <p className="text-sm text-gray-500">Rue 22 prolongée, Fass Delorme, Dakar</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-navy-900 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200"
                  placeholder="Votre nom complet"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-navy-900 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200"
                    placeholder="votre@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-navy-900 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200"
                    placeholder="+221 XX XXX XX XX"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-navy-900 mb-2">
                  Sujet *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="billet">Réservation billet d'avion</option>
                  <option value="visa">Assistance visa</option>
                  <option value="immobilier">Services immobiliers</option>
                  <option value="autre">Autre demande</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-navy-900 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200"
                  placeholder="Décrivez votre demande en détail..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gold-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gold-600 transition-colors duration-200 flex items-center justify-center"
              >
                <Send className="h-5 w-5 mr-2" />
                Envoyer le message
              </button>
            </form>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-16 bg-navy-900 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Restez informé de nos offres</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Inscrivez-vous à notre newsletter pour recevoir en exclusivité nos meilleures offres, 
            nos bons plans et nos conseils voyage.
          </p>
          
          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg text-navy-900 focus:ring-2 focus:ring-gold-500 focus:outline-none"
              placeholder="Votre adresse email"
            />
            <button
              type="submit"
              className="bg-gold-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gold-600 transition-colors duration-200"
            >
              S'inscrire
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;