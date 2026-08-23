import AioShell from "@/components/layout/AioShell";

export default function HomePage() {
  return (
    <AioShell>
      <div className="aio-page-header">
        <div>
          <h1>Stream</h1>
          <p>What&apos;s happening in your world?</p>
        </div>
      </div>

      <section className="aio-feed">
        <div className="aio-create-post">
          <div className="aio-avatar large">S</div>

          <div className="aio-create-content">
            <input placeholder="Share something with your world..." />

            <div className="aio-create-actions">
              <button>Photo</button>
              <button>Video</button>
              <button>Poll</button>

              <button className="aio-post-button">
                Post
              </button>
            </div>
          </div>
        </div>

        <article className="aio-post">
          <div className="aio-post-header">
            <div className="aio-avatar">A</div>

            <div>
              <strong>Alex Morgan</strong>
              <span>@alexm · 2h</span>
            </div>
          </div>

          <div className="aio-post-content">
            <p>
              Building something new today. The future of social
              platforms should feel more connected, not more
              complicated.
            </p>
          </div>

          <div className="aio-post-actions">
            <button>♡ 124</button>
            <button>◌ 18</button>
            <button>↗ 7</button>
            <button>⌁</button>
          </div>
        </article>

        <article className="aio-post">
          <div className="aio-post-header">
            <div className="aio-avatar">S</div>

            <div>
              <strong>Sarah Kim</strong>
              <span>@sarahk · 4h</span>
            </div>
          </div>

          <div className="aio-post-content">
            <p>
              Just discovered an amazing new idea around AI,
              creativity and communities. What are you all
              working on?
            </p>
          </div>

          <div className="aio-post-actions">
            <button>♡ 89</button>
            <button>◌ 12</button>
            <button>↗ 4</button>
            <button>⌁</button>
          </div>
        </article>
      </section>
    </AioShell>
  );
}