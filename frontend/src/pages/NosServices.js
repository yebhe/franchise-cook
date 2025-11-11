import React from 'react';
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

      <style jsx>{`
        .services-container {
          min-height: 100vh;
          background: #f8fafc;
        }

        .services-hero {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          padding: 80px 0;
          color: white;
          text-align: center;
        }

        .services-hero__content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .services-hero__title {
          font-size: 3.5rem;
          font-weight: 700;
          margin: 0 0 1rem 0;
          background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .services-hero__subtitle {
          font-size: 1.25rem;
          opacity: 0.9;
          margin: 0 0 3rem 0;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .services-hero__stats {
          display: flex;
          justify-content: center;
          gap: 4rem;
          flex-wrap: wrap;
        }

        .services-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .services-stat__number {
          font-size: 2.5rem;
          font-weight: 700;
          color: #3b82f6;
        }

        .services-stat__label {
          font-size: 0.875rem;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .services-section {
          padding: 80px 0;
        }

        .services-section--alt {
          background: white;
        }

        .services-section--highlight {
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
        }

        .services-container__inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .services-section__header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .services-section__title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 1rem 0;
        }

        .services-section__description {
          font-size: 1.125rem;
          color: #64748b;
          max-width: 600px;
          margin: 0 auto;
        }

        .services-grid {
          display: grid;
          gap: 2rem;
        }

        .services-grid--4 {
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }

        .services-grid--2 {
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        }

        .services-card {
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          text-align: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .services-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .services-card__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 4rem;
          height: 4rem;
          border-radius: 50%;
          margin-bottom: 1.5rem;
        }

        .services-card__icon--primary {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
        }

        .services-card__title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 1rem 0;
        }

        .services-card__description {
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }

        .services-feature-card {
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #3b82f6;
        }

        .services-feature-card__header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .services-feature-card__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 3rem;
          height: 3rem;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border-radius: 0.5rem;
        }

        .services-feature-card__title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .services-feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .services-feature-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0;
          color: #64748b;
        }

        .services-feature-item svg {
          color: #10b981;
          flex-shrink: 0;
        }

        .services-modules {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .services-module {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .services-module__header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .services-module__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 4rem;
          height: 4rem;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border-radius: 1rem;
        }

        .services-module__info {
          flex: 1;
        }

        .services-module__title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
        }

        .services-module__description {
          color: #64748b;
          margin: 0;
        }

        .services-module__content {
          padding: 2rem;
        }

        .services-module__subtitle {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 1rem 0;
        }

        .services-module__list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 0.75rem;
        }

        .services-module__item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
        }

        .services-module__item svg {
          color: #3b82f6;
          flex-shrink: 0;
        }

        .services-innovation {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .services-innovation__title {
          font-size: 2rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 1rem 0;
        }

        .services-innovation__description {
          color: #64748b;
          line-height: 1.6;
          margin: 0 0 2rem 0;
        }

        .services-innovation__features {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .services-innovation__feature {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #1e293b;
          font-weight: 500;
        }

        .services-innovation__feature svg {
          color: #3b82f6;
        }

        .services-innovation__visual {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .services-innovation__metric {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .services-innovation__number {
          font-size: 3rem;
          font-weight: 700;
          color: #3b82f6;
        }

        .services-innovation__label {
          font-size: 0.875rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .services-innovation__separator {
          font-size: 2rem;
          font-weight: 700;
          color: #94a3b8;
        }

        .services-innovation__result {
          font-size: 1.125rem;
          font-weight: 600;
          color: #10b981;
          text-align: center;
          padding: 1rem;
          background: #f0fdf4;
          border-radius: 0.5rem;
          width: 100%;
        }

        @media (max-width: 768px) {
          .services-hero__title {
            font-size: 2.5rem;
          }

          .services-hero__stats {
            gap: 2rem;
          }

          .services-section {
            padding: 60px 0;
          }

          .services-section__title {
            font-size: 2rem;
          }

          .services-grid--2 {
            grid-template-columns: 1fr;
          }

          .services-module__header {
            flex-direction: column;
            text-align: center;
          }

          .services-innovation {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .services-module__list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default NosServices;