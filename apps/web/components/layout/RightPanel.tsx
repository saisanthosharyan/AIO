export default function RightPanel() {
  return (
    <aside className="aio-right-panel">
      <div className="aio-search-box">
        <span>⌕</span>
        <input placeholder="Search AIO" />
      </div>

      <section className="aio-panel-card">
        <h3>Trending on AIO</h3>

        <div className="aio-trend">
          <span>01</span>
          <div>
            <strong>AI & Technology</strong>
            <small>12.4K posts</small>
          </div>
        </div>

        <div className="aio-trend">
          <span>02</span>
          <div>
            <strong>Creators</strong>
            <small>8.7K posts</small>
          </div>
        </div>

        <div className="aio-trend">
          <span>03</span>
          <div>
            <strong>Future of Work</strong>
            <small>6.2K posts</small>
          </div>
        </div>
      </section>

      <section className="aio-panel-card">
        <h3>People you may know</h3>

        <div className="aio-person">
          <div className="aio-avatar">A</div>

          <div className="aio-person-info">
            <strong>Alex Morgan</strong>
            <small>@alexm</small>
          </div>

          <button>Follow</button>
        </div>

        <div className="aio-person">
          <div className="aio-avatar">S</div>

          <div className="aio-person-info">
            <strong>Sarah Kim</strong>
            <small>@sarahk</small>
          </div>

          <button>Follow</button>
        </div>
      </section>
    </aside>
  );
}