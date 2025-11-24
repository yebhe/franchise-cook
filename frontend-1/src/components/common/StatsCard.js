// components/common/StatsCard.jsx
import React from 'react';
import './StatsCard.css';

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue', 
  trend, 
  isLoading = false 
}) => {
  return (
    <div className="stats-card">
      <div className="stats-card__content">
        <div className={`stats-card__icon stats-card__icon--${color}`}>
          <Icon className="stats-card__icon-svg" size={24} />
        </div>
        <div className="stats-card__info">
          <h3 className="stats-card__title">{title}</h3>
          {isLoading ? (
            <div className="stats-card__loading">
              <div className="stats-card__skeleton"></div>
            </div>
          ) : (
            <p className="stats-card__value">{value}</p>
          )}
          {trend && !isLoading && (
            <p className={`stats-card__trend ${
              trend.positive 
                ? 'stats-card__trend--positive' 
                : 'stats-card__trend--negative'
            }`}>
              <span className="stats-card__trend-indicator">
                {trend.positive ? '↗' : '↘'}
                <span className="stats-card__trend-value">{trend.value}</span>
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;