import React, { useState, useEffect } from 'react';
import { 
  ChefHat,
  Truck, 
  MapPin, 
  Users, 
  TrendingUp, 
  Star,
  Shield,
  ArrowRight,
  Play,
  CheckCircle,
  Building2,
  BarChart3
} from 'lucide-react';
import Navigation from '../components/Navigation';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { icon: Users, number: "30+", label: "Franchisés Actifs", color: "#3b82f6" },
    { icon: MapPin, number: "4", label: "Entrepôts Stratégiques", color: "#10b981" },
    { icon: TrendingUp, number: "2013", label: "Depuis", color: "#f59e0b" },
    { icon: Truck, number: "100%", label: "Croissance Maîtrisée", color: "#ef4444" }
  ];

  const features = [
    {
      icon: Shield,
      title: "Qualité Garantie",
      description: "Produits frais, bruts et majoritairement locaux avec contrôle qualité rigoureux",
      highlight: "80/20"
    },
    {
      icon: Building2,
      title: "Réseau Structuré",
      description: "4 entrepôts équipés de cuisines professionnelles à travers l'Île-de-France",
      highlight: "4 Sites"
    },
    {
      icon: BarChart3,
      title: "Croissance Soutenue",
      description: "Croissance à deux chiffres depuis 2013 avec expansion programmée",
      highlight: "+30%/an"
    }
  ];

  const testimonials = [
    {
      name: "Marie Dubois",
      role: "Franchisée Paris 15e",
      content: "Rejoindre DRIV'N COOK a transformé ma vie professionnelle. Le soutien et la qualité des produits sont exceptionnels.",
      rating: 5,
      avatar: "MD"
    },
    {
      name: "Pierre Martin",
      role: "Franchisé Vincennes",
      content: "La formation et l'accompagnement DRIV'N COOK m'ont permis de développer rapidement mon chiffre d'affaires.",
      rating: 5,
      avatar: "PM"
    },
    {
      name: "Sophie Chen",
      role: "Franchisée Neuilly",
      content: "L'innovation constante et la qualité des produits fidélisent ma clientèle jour après jour.",
      rating: 5,
      avatar: "SC"
    }
  ];

  const processSteps = [
    {
      step: "01",
      title: "Candidature",
      description: "Déposez votre dossier et rencontrez nos équipes pour évaluer votre projet"
    },
    {
      step: "02", 
      title: "Formation",
      description: "Bénéficiez d'une formation complète sur nos méthodes et notre savoir-faire"
    },
    {
      step: "03",
      title: "Installation",
      description: "Recevez votre food truck équipé et installez-vous sur votre zone d'activité"
    },
    {
      step: "04",
      title: "Lancement",
      description: "Démarrez votre activité avec notre accompagnement et support continu"
    }
  ];

  return (
    <div className="home-page">
      <Navigation />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__background">
          <div className="hero__overlay"></div>
        </div>
        <div className="hero__content">
          <div className="hero__text">
            <h1 className={`hero__title ${isVisible ? 'hero__title--visible' : ''}`}>
              DRIV'N COOK
            </h1>
            <p className={`hero__subtitle ${isVisible ? 'hero__subtitle--visible' : ''}`}>
              Food Trucks de Qualité depuis 2013
            </p>
            <p className={`hero__description ${isVisible ? 'hero__description--visible' : ''}`}>
              Rejoignez le réseau de franchises food truck le plus innovant d'Île-de-France. 
              Des plats de qualité, des produits frais et un accompagnement professionnel.
            </p>
            <div className={`hero__actions ${isVisible ? 'hero__actions--visible' : ''}`}>
              <button className="hero__cta hero__cta--primary" onClick={() => navigate('/register')}>
                <Users size={20} />
                S'incrire
              </button>
            </div>
          </div>
          <div className="hero__visual">
            <div className="hero__truck">
              <Truck size={120} />
            </div>
            <div className="hero__badge">
              <ChefHat size={24} />
              <span>Qualité Premium</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stats__container">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="stat" style={{ '--accent-color': stat.color }}>
                <div className="stat__icon">
                  <Icon size={32} />
                </div>
                <div className="stat__content">
                  <span className="stat__number">{stat.number}</span>
                  <span className="stat__label">{stat.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Pourquoi Choisir DRIV'N COOK ?</h2>
            <p className="section-description">
              Une franchise qui allie tradition culinaire et innovation technologique
            </p>
          </div>
          
          <div className="features__grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="feature-card">
                  <div className="feature-card__header">
                    <div className="feature-card__icon">
                      <Icon size={32} />
                    </div>
                    <div className="feature-card__highlight">
                      {feature.highlight}
                    </div>
                  </div>
                  <h3 className="feature-card__title">{feature.title}</h3>
                  <p className="feature-card__description">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="process">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Comment Rejoindre le Réseau ?</h2>
            <p className="section-description">
              Un processus simple et accompagné pour devenir franchisé DRIV'N COOK
            </p>
          </div>
          
          <div className="process__steps">
            {processSteps.map((step, index) => (
              <div key={index} className="process-step">
                <div className="process-step__number">{step.step}</div>
                <div className="process-step__content">
                  <h3 className="process-step__title">{step.title}</h3>
                  <p className="process-step__description">{step.description}</p>
                </div>
                {index < processSteps.length - 1 && (
                  <div className="process-step__connector">
                    <ArrowRight size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Témoignages Franchisés</h2>
            <p className="section-description">
              Découvrez l'expérience de nos franchisés à travers l'Île-de-France
            </p>
          </div>
          
          <div className="testimonials__grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-card__header">
                  <div className="testimonial-card__avatar">
                    {testimonial.avatar}
                  </div>
                  <div className="testimonial-card__info">
                    <h4 className="testimonial-card__name">{testimonial.name}</h4>
                    <p className="testimonial-card__role">{testimonial.role}</p>
                  </div>
                  <div className="testimonial-card__rating">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                </div>
                <p className="testimonial-card__content">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta__content">
            <h2 className="cta__title">Prêt à Nous Rejoindre ?</h2>
            <p className="cta__description">
              Lancez votre activité avec le leader des food trucks de qualité en Île-de-France
            </p>
            <div className="cta__features">
              <div className="cta__feature">
                <CheckCircle size={20} />
                <span>Investissement initial : 50 000€</span>
              </div>
              <div className="cta__feature">
                <CheckCircle size={20} />
                <span>Formation complète incluse</span>
              </div>
              <div className="cta__feature">
                <CheckCircle size={20} />
                <span>Accompagnement personnalisé</span>
              </div>
            </div>
            <div className="cta__actions">
              <button className="cta__button cta__button--primary" onClick={() => navigate('/register')}>
                S'inscrire Maintenant
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .home-page {
          min-height: 100vh;
          background: #ffffff;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 1rem 0;
        }

        .section-description {
          font-size: 1.125rem;
          color: #64748b;
          max-width: 600px;
          margin: 0 auto;
        }

        /* Hero Section */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .hero__background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        }

        .hero__overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
        }

        .hero__content {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          min-height: 80vh;
        }

        .hero__text {
          color: white;
        }

        .hero__title {
          font-size: 4rem;
          font-weight: 700;
          margin: 0 0 1rem 0;
          background: linear-gradient(135deg, #ffffff 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease;
        }

        .hero__title--visible {
          opacity: 1;
          transform: translateY(0);
        }

        .hero__subtitle {
          font-size: 1.5rem;
          margin: 0 0 1.5rem 0;
          opacity: 0.9;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease 0.2s;
        }

        .hero__subtitle--visible {
          opacity: 0.9;
          transform: translateY(0);
        }

        .hero__description {
          font-size: 1.125rem;
          line-height: 1.6;
          margin: 0 0 2rem 0;
          opacity: 0.8;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease 0.4s;
        }

        .hero__description--visible {
          opacity: 0.8;
          transform: translateY(0);
        }

        .hero__actions {
          display: flex;
          gap: 1rem;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease 0.6s;
        }

        .hero__actions--visible {
          opacity: 1;
          transform: translateY(0);
        }

        .hero__cta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .hero__cta--primary {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
        }

        .hero__cta--primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.4);
        }

        .hero__cta--secondary {
          background: transparent;
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .hero__cta--secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .hero__visual {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hero__truck {
          color: #3b82f6;
          opacity: 0.8;
          animation: float 6s ease-in-out infinite;
        }

        .hero__badge {
          position: absolute;
          top: -20px;
          right: -20px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 1rem;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 0.875rem;
          box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.4);
          animation: bounce 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        /* Stats Section */
        .stats {
          padding: 4rem 0;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }

        .stats__container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .stat {
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }

        .stat:hover {
          transform: translateY(-4px);
        }

        .stat__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 4rem;
          height: 4rem;
          border-radius: 1rem;
          background: var(--accent-color);
          color: white;
        }

        .stat__content {
          display: flex;
          flex-direction: column;
        }

        .stat__number {
          font-size: 2rem;
          font-weight: 700;
          color: #1e293b;
        }

        .stat__label {
          font-size: 0.875rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Features Section */
        .features {
          padding: 6rem 0;
        }

        .features__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          background: white;
          padding: 2.5rem;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border-top: 4px solid #3b82f6;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .feature-card__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .feature-card__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 4rem;
          height: 4rem;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border-radius: 1rem;
        }

        .feature-card__highlight {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .feature-card__title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 1rem 0;
        }

        .feature-card__description {
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }

        /* Process Section */
        .process {
          padding: 6rem 0;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }

        .process__steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          position: relative;
        }

        .process-step {
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          text-align: center;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        .process-step__number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 3rem;
          height: 3rem;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border-radius: 50%;
          font-weight: 700;
          font-size: 1.125rem;
          margin-bottom: 1rem;
        }

        .process-step__title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 1rem 0;
        }

        .process-step__description {
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }

        /* Testimonials Section */
        .testimonials {
          padding: 6rem 0;
        }

        .testimonials__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }

        .testimonial-card {
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #3b82f6;
        }

        .testimonial-card__header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .testimonial-card__avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 3rem;
          height: 3rem;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border-radius: 50%;
          font-weight: 600;
        }

        .testimonial-card__info {
          flex: 1;
        }

        .testimonial-card__name {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .testimonial-card__role {
          font-size: 0.875rem;
          color: #64748b;
          margin: 0;
        }

        .testimonial-card__rating {
          display: flex;
          gap: 0.25rem;
          color: #f59e0b;
        }

        .testimonial-card__content {
          color: #64748b;
          line-height: 1.6;
          font-style: italic;
          margin: 0;
        }

        /* CTA Section */
        .cta {
          padding: 6rem 0;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: white;
        }

        .cta__content {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .cta__title {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 1rem 0;
        }

        .cta__description {
          font-size: 1.125rem;
          opacity: 0.9;
          margin: 0 0 2rem 0;
        }

        .cta__features {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .cta__feature {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #10b981;
        }

        .cta__actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .cta__button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cta__button--primary {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
        }

        .cta__button--primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.4);
        }

        .cta__button--secondary {
          background: transparent;
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .cta__button--secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.5);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero__content {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 2rem;
          }

          .hero__title {
            font-size: 2.5rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .stats__container {
            grid-template-columns: 1fr;
          }

          .features__grid {
            grid-template-columns: 1fr;
          }

          .process__steps {
            grid-template-columns: 1fr;
          }

          .testimonials__grid {
            grid-template-columns: 1fr;
          }

          .cta__features {
            flex-direction: column;
            align-items: center;
          }

          .cta__actions {
            flex-direction: column;
            align-items: center;
          }

          .hero__actions {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;