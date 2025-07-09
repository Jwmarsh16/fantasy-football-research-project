// src/components/home/NewsSection.jsx
import React from 'react';
import '../../style/NewsSection.css';

const NewsSection = ({ articles }) => {
  return (
    <div className="news-section shadow rounded transition container">
      <h3 className="news-title">Fantasy Football News & Updates</h3>
      <ul className="news-list">
        {articles.map((article) => (
          <li key={article.id} className="news-item shadow rounded transition">
            <h4 className="news-article-title">{article.title}</h4>
            <p className="news-article-meta">
              <span className="news-article-category">
                <strong>Category:</strong> {article.category}
              </span>
              <span className="news-article-date">{article.date}</span>
            </p>
            <p className="news-article-content">{article.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewsSection;
