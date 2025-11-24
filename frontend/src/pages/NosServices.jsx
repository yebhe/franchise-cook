import React from 'react';
import './NosServices.css'
import { 
  Truck, 
  Store, 
  Package, 
  Users, 
  TrendingUp, 
  Shield, 
  MapPin, 
  Clock,
  CheckCircle,
  Target,
  Cog,
  BarChart3,
  FileText,
  ShoppingCart,
  Building2
} from 'lucide-react';
import Navigation from '../components/Navigation';

const NosServices = () => {
  const objectifs = [
    {
      icon: Target,
      title: "Modernisation du SI",
      description: "Migration d'un système vétuste (Excel) vers une solution web moderne et performante"
    },
    {
      icon: Users,
      title: "Gestion Centralisée",
      description: "Centraliser la gestion de plus de 30 franchisés à travers l'Île-de-France"
    },
    {
      icon: TrendingUp,
      title: "Croissance Maîtrisée",
      description: "Accompagner la croissance à deux chiffres avec des outils adaptés"
    },
    {
      icon: Shield,
      title: "Contrôle Qualité",
      description: "Garantir le respect de la règle 80/20 dans l'approvisionnement"
    }
  ];

  const specificites = [
    {
      icon: Building2,
      title: "Système de Franchise",
      features: [
        "Droit d'entrée de 50 000€",
        "4% du CA reversé à la société mère",
        "Contrats et obligations franchisés",
        "Suivi des performances par franchise"
      ]
    },
    {
      icon: Package,
      title: "Gestion Multi-Entrepôts",
      features: [
        "4 entrepôts stratégiques en Île-de-France",
        "Règle 80/20 : 80% stock imposé, 20% libre",
        "Cuisine intégrée dans chaque entrepôt",
        "Traçabilité complète des produits"
      ]
    },
    {
      icon: Truck,
      title: "Parc de Véhicules",
      features: [
        "Gestion complète du parc de food trucks",
        "Maintenance et carnet d'entretien",
        "Géolocalisation et planning",
        "Suivi des pannes et réparations"
      ]
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      features: [
        "Analyses des ventes en temps réel",
        "Historique des performances",
        "Génération automatique de rapports PDF",
        "Tableaux de bord personnalisés"
      ]
    }
  ];

  const modules = [
    {
      icon: Store,
      title: "Back-Office Administrateur",
      description: "Interface complète pour la gestion centralisée de toutes les franchises",
      fonctionnalites: [
        "Gestion des franchisés et contrats",
        "Administration des entrepôts",
        "Contrôle des stocks et commandes",
        "Suivi financier et reporting"
      ]
    },
    {
      icon: Users,
      title: "Front-Office Franchisé",
      description: "Espace personnel pour chaque franchisé avec outils de gestion autonome",
      fonctionnalites: [
        "Gestion du profil et des données",
        "Commandes et approvisionnement",
        "Suivi des ventes et statistiques",
        "Planning et géolocalisation"
      ]
    },
    {
      icon: ShoppingCart,
      title: "Système de Commandes",
      description: "Workflow complet de commande multi-entrepôts avec contrôle 80/20",
      fonctionnalites: [
        "Commandes par entrepôt",
        "Vérification automatique de la règle 80/20",
        "Gestion des stocks disponibles",
        "Validation et suivi des livraisons"
      ]
    }
  ];

  return (
    <div>
      <Navigation />
      
      <div className="services-container">
        {/* Hero Section */}
        <section className="services-hero">
          <div className="services-hero__content">
            <h1 className="services-hero__title">
              Nos Services
            </h1>
            <p className="services-hero__subtitle">
              Une solution complète pour la gestion moderne des franchises food truck
            </p>
            <div className="services-hero__stats">
              <div className="services-stat">
                <span className="services-stat__number">30+</span>
                <span className="services-stat__label">Franchisés</span>
              </div>
              <div className="services-stat">
                <span className="services-stat__number">4</span>
                <span className="services-stat__label">Entrepôts</span>
              </div>
              <div className="services-stat">
                <span className="services-stat__number">2013</span>
                <span className="services-stat__label">Depuis</span>
              </div>
            </div>
          </div>
        </section>

        {/* Objectifs Section */}
        <section className="services-section">
          <div className="services-container__inner">
            <div className="services-section__header">
              <h2 className="services-section__title">Objectifs de l'Application</h2>
              <p className="services-section__description">
                Moderniser et optimiser la gestion des franchises DRIV'N COOK
              </p>
            </div>

            <div className="services-grid services-grid--4">
              {objectifs.map((objectif, index) => {
                const Icon = objectif.icon;
                return (
                  <div key={index} className="services-card">
                    <div className="services-card__icon services-card__icon--primary">
                      <Icon size={32} />
                    </div>
                    <h3 className="services-card__title">{objectif.title}</h3>
                    <p className="services-card__description">{objectif.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Spécificités Section */}
        <section className="services-section services-section--alt">
          <div className="services-container__inner">
            <div className="services-section__header">
              <h2 className="services-section__title">Spécificités Métier</h2>
              <p className="services-section__description">
                Des fonctionnalités adaptées aux contraintes spécifiques du modèle DRIV'N COOK
              </p>
            </div>

            <div className="services-grid services-grid--2">
              {specificites.map((spec, index) => {
                const Icon = spec.icon;
                return (
                  <div key={index} className="services-feature-card">
                    <div className="services-feature-card__header">
                      <div className="services-feature-card__icon">
                        <Icon size={28} />
                      </div>
                      <h3 className="services-feature-card__title">{spec.title}</h3>
                    </div>
                    <ul className="services-feature-list">
                      {spec.features.map((feature, idx) => (
                        <li key={idx} className="services-feature-item">
                          <CheckCircle size={16} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Modules Section */}
        <section className="services-section">
          <div className="services-container__inner">
            <div className="services-section__header">
              <h2 className="services-section__title">Modules de l'Application</h2>
              <p className="services-section__description">
                Une architecture modulaire pour répondre aux besoins de tous les utilisateurs
              </p>
            </div>

            <div className="services-modules">
              {modules.map((module, index) => {
                const Icon = module.icon;
                return (
                  <div key={index} className="services-module">
                    <div className="services-module__header">
                      <div className="services-module__icon">
                        <Icon size={40} />
                      </div>
                      <div className="services-module__info">
                        <h3 className="services-module__title">{module.title}</h3>
                        <p className="services-module__description">{module.description}</p>
                      </div>
                    </div>
                    <div className="services-module__content">
                      <h4 className="services-module__subtitle">Fonctionnalités principales :</h4>
                      <ul className="services-module__list">
                        {module.fonctionnalites.map((func, idx) => (
                          <li key={idx} className="services-module__item">
                            <Cog size={14} />
                            <span>{func}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Innovation Section */}
        <section className="services-section services-section--highlight">
          <div className="services-container__inner">
            <div className="services-innovation">
              <div className="services-innovation__content">
                <h2 className="services-innovation__title">
                  Innovation & Contrôle Qualité
                </h2>
                <p className="services-innovation__description">
                  Notre solution intègre des contrôles automatiques pour garantir le respect 
                  des standards DRIV'N COOK, notamment la règle fondamentale des 80/20 dans 
                  l'approvisionnement.
                </p>
                <div className="services-innovation__features">
                  <div className="services-innovation__feature">
                    <Shield size={20} />
                    <span>Contrôle automatique de la règle 80/20</span>
                  </div>
                  <div className="services-innovation__feature">
                    <FileText size={20} />
                    <span>Génération automatique de rapports PDF</span>
                  </div>
                  <div className="services-innovation__feature">
                    <MapPin size={20} />
                    <span>Géolocalisation et planning optimisé</span>
                  </div>
                  <div className="services-innovation__feature">
                    <Clock size={20} />
                    <span>Suivi en temps réel des performances</span>
                  </div>
                </div>
              </div>
              <div className="services-innovation__visual">
                <div className="services-innovation__metric">
                  <span className="services-innovation__number">80%</span>
                  <span className="services-innovation__label">Stock imposé</span>
                </div>
                <div className="services-innovation__separator">+</div>
                <div className="services-innovation__metric">
                  <span className="services-innovation__number">20%</span>
                  <span className="services-innovation__label">Stock libre</span>
                </div>
                <div className="services-innovation__result">
                  = Contrôle Qualité Garanti
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default NosServices;