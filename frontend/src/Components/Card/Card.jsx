import React from 'react';
import PropTypes from 'prop-types';
import './Card.css';

const Card = ({ data }) => {
  return (
    <div className="license-card">
      <div className="card-header">
        <h2>Continuing Medical Education</h2>
      </div>
      <div className="card-body">
        <div className="card-row">
          <span className="card-label">Name:</span>
          <span className="card-value">{data.user}</span>
        </div>
        <div className="card-row">
          <span className="card-label">Course:</span>
          <span className="card-value">{data.course_name}</span>
        </div>
        <div className="card-row">
          <span className="card-label">Category:</span>
          <span className="card-value">{data.credit_category || 'N/A'}</span>
        </div>
        <div className="card-row">
          <span className="card-label">Credits:</span>
          <span className="card-value">{data.credits} {data.credit_category}</span>
        </div>
        <div className="card-row">
          <span className="card-label">Completion:</span>
          <span className="card-value">{data.completion_date}</span>
        </div>
      </div>
      <div className="card-footer">
        <span>Provider: {data.provider || 'N/A'}</span>
      </div>
    </div>
  );
};

Card.propTypes = {
  data: PropTypes.shape({
    user: PropTypes.string.isRequired,
    course_name: PropTypes.string.isRequired,
    credits: PropTypes.number.isRequired,
    credit_category: PropTypes.string.isRequired,
    completion_date: PropTypes.string.isRequired,
    provider: PropTypes.string,
  }).isRequired,
};

export default Card;
