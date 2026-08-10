import Sidebar from "@/components/navigation/Sidebar";
import TopBar from "@/components/navigation/TopBar";
import CreatePanel from "@/components/stream/CreatePanel";
import PostCard from "@/components/stream/PostCard";
import IntelligencePanel from "@/components/intelligence/IntelligencePanel";

export default function HomePage() {
  return (
    <main className="aio-shell">
      <Sidebar />

      <section className="aio-main">
        <TopBar />

        <div className="stream-container">
          <div className="stream-heading">
            <div>
              <span className="eyebrow">
                YOUR SPACE
              </span>

              <h1>
                Good morning, Santhosh.
              </h1>

              <p>
                Here&apos;s what&apos;s happening around you.
              </p>
            </div>

            <button className="filter-button">
              For you
            </button>
          </div>

          <CreatePanel />

          <div className="stream-label">
            <span>THE STREAM</span>
            <div />
          </div>

          <PostCard
            name="Arjun Rao"
            username="@arjun"
            time="18m"
            initials="AR"
            avatarClass="avatar-purple"
            content="Building something new feels different when you stop asking what already exists and start asking what should exist next."
            type="thought"
          />

          <PostCard
            name="Meera Kapoor"
            username="@meera"
            time="42m"
            initials="MK"
            avatarClass="avatar-green"
            content="Just opened a new Space for people building AI products. Designers, developers, founders and curious minds are welcome."
            type="space"
          />
        </div>
      </section>

      <IntelligencePanel />
    </main>
  );
}