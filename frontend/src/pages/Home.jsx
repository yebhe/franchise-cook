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
import './Home.css'
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

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
    </div>
  );
};

export default Home;