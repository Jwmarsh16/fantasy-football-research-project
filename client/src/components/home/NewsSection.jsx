import '../../style/NewsSection.css';

const NewsSection = ({ articles }) => {
  return (
    <section className="news-section" aria-labelledby="home-news-title">
      <h2 className="news-title" id="home-news-title">Fantasy Football News & Updates</h2>
      <ul className="news-list">
        {articles.map((article) => (
          <li key={article.id} className="news-item">
            <h3 className="news-article-title">{article.title}</h3>
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
    </section>
  );
};

export default NewsSection;
