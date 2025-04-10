// src/components/home/NewsSection.jsx
import React from 'react';
import '../../style/NewsSection.css';

const NewsSection = ({ articles }) => {
  return (
    <div className="news-section">
      <h3 className="news-title">🏈 Fantasy Football News & Updates</h3>
      <ul className="news-list">
        {articles.map((article) => (
          <li key={article.id} className="news-item">
            <h4 className="news-article-title">{article.title}</h4>
            <p className="news-article-category">
              <strong>Category:</strong> {article.category}
            </p>
            <p className="news-article-date">{article.date}</p>
            <p className="news-article-content">{article.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewsSection;
