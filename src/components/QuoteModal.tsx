import React, { useState } from 'react';
import { X, Calendar, Users, MapPin, Package } from 'lucide-react';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuoteModal: React.FC<QuoteModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    serviceType: '',
    destination: '',
    departure: '',
    travelDates: '',
    duration: '',
    participants: '1',
    budget: '',
    accommodation: '',
    activities: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Quote request submitted:', formData);
    alert('Votre demande de devis a été envoyée ! Nous vous répondrons dans les 24h.');
    onClose();
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      serviceType: '',
      destination: '',
      departure: '',
      travelDates: '',
      duration: '',
      participants: '1',
      budget: '',
      accommodation: '',
      activities: '',
      description: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-navy-900 flex items-center">
            <Package className="h-6 w-6 mr-2 text-gold-500" />
            Demande de devis
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Informations de contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-2">Prénom *</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-2">Nom *</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-2">Téléphone *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Service Type */}
          <div>
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Type de service souhaité</h3>
            <select
              name="serviceType"
              required
              value={formData.serviceType}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            >
              <option value="">Sélectionnez un service</option>
              <option value="package">Package touristique complet</option>
              <option value="flight">Billets d'avion uniquement</option>
              <option value="circuit">Circuit découverte</option>
              <option value="business">Voyage d'affaires</option>
              <option value="group">Voyage de groupe</option>
              <option value="custom">Voyage sur mesure</option>
            </select>
          </div>

          {/* Travel Details */}
          <div>
            <h3 className="text-lg font-semibold text-navy-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-gold-500" />
              Détails du voyage
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-2">Destination souhaitée *</label>
                <input
                  type="text"
                  name="destination"
                  required
                  value={formData.destination}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="Ville ou pays de destination"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-2">Départ depuis</label>
                <input
                  type="text"
                  name="departure"
                  value={formData.departure}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="Dakar par défaut"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Période souhaitée
                </label>
                <input
                  type="text"
                  name="travelDates"
                  value={formData.travelDates}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="Ex: Mars 2024, Flexible"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-2">Durée du voyage</label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                >
                  <option value="">Sélectionnez la durée</option>
                  <option value="1-3">1 à 3 jours</option>
                  <option value="4-7">4 à 7 jours</option>
                  <option value="8-14">1 à 2 semaines</option>
                  <option value="15-21">2 à 3 semaines</option>
                  <option value="22+">Plus de 3 semaines</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-2 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Nombre de participants
                </label>
                <select
                  name="participants"
                  value={formData.participants}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, '10+'].map((num, index) => (
                    <option key={index} value={num}>{num} personne{num !== 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-2">Budget approximatif (FCFA)</label>
                <select
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                >
                  <option value="">Sélectionnez votre budget</option>
                  <option value="0-500000">Moins de 500 000 FCFA</option>
                  <option value="500000-1000000">500 000 - 1 000 000 FCFA</option>
                  <option value="1000000-2000000">1 000 000 - 2 000 000 FCFA</option>
                  <option value="2000000-5000000">2 000 000 - 5 000 000 FCFA</option>
                  <option value="5000000+">Plus de 5 000 000 FCFA</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Préférences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-2">Type d'hébergement</label>
                <select
                  name="accommodation"
                  value={formData.accommodation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                >
                  <option value="">Pas de préférence</option>
                  <option value="hotel-3">Hôtel 3 étoiles</option>
                  <option value="hotel-4">Hôtel 4 étoiles</option>
                  <option value="hotel-5">Hôtel 5 étoiles</option>
                  <option value="boutique">Hôtel boutique</option>
                  <option value="resort">Resort</option>
                  <option value="aparthotel">Aparthotel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-2">Type d'activités</label>
                <select
                  name="activities"
                  value={formData.activities}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                >
                  <option value="">Sélectionnez le type</option>
                  <option value="culture">Culturel et historique</option>
                  <option value="beach">Plage et détente</option>
                  <option value="adventure">Aventure et sport</option>
                  <option value="nature">Nature et écotourisme</option>
                  <option value="city">Découverte urbaine</option>
                  <option value="mixed">Mixte</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Description */}
          <div>
            <label className="block text-sm font-medium text-navy-900 mb-2">
              Décrivez votre voyage idéal
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              placeholder="Partagez-nous vos envies, vos attentes particulières, ou toute information qui nous aiderait à personnaliser votre voyage..."
            />
          </div>

          <div className="bg-gold-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Notre engagement :</strong> Vous recevrez une réponse personnalisée dans les 24h avec un devis détaillé et transparent, sans aucun engagement de votre part.
            </p>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-gold-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gold-600 transition-colors duration-200"
            >
              Demander un devis gratuit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuoteModal;