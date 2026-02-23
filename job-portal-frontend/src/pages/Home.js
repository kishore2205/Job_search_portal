import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const PAGE_SIZE = 6;

const Home = ({ sidebarOpen }) => {
  const [jobs, setJobs] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // top search
  const [q, setQ] = useState("");

  // left filters
  const [location, setLocation] = useState("");
  const [company, setCompany] = useState("");
  const [jobType, setJobType] = useState("ALL");
  const [sort, setSort] = useState("NEW");

  // pagination state from backend
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const sentinelRef = useRef(null);
  const navigate = useNavigate();

  const chips = ["ALL", "Full-time", "Part-time", "Internship", "Contract"];

  const buildParams = (p) => ({
    page: p,
    limit: PAGE_SIZE,
    search: q,
    location,
    company,
    jobType,
    sort,
  });

  const fetchFirstPage = async () => {
    try {
      setErr("");
      setLoading(true);
      setPage(1);

      const res = await api.get("/jobs", { params: buildParams(1) });
      setJobs(res.data.jobs || []);
      setHasMore(!!res.data.hasMore);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchNextPage = async () => {
    if (!hasMore || loadingMore) return;

    const next = page + 1;
    try {
      setLoadingMore(true);
      const res = await api.get("/jobs", { params: buildParams(next) });
      const newJobs = res.data.jobs || [];

      setJobs((prev) => [...prev, ...newJobs]);
      setHasMore(!!res.data.hasMore);
      setPage(next);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load more jobs");
    } finally {
      setLoadingMore(false);
    }
  };

  // load first time
  useEffect(() => {
    fetchFirstPage();
    // eslint-disable-next-line
  }, []);

  // when any filter changes -> reload page 1
  useEffect(() => {
    fetchFirstPage();
    // eslint-disable-next-line
  }, [q, location, company, jobType, sort]);

  // infinite scroll observer
  useEffect(() => {
    if (!sentinelRef.current) return;

    const node = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchNextPage();
      },
      { root: null, rootMargin: "250px", threshold: 0.01 }
    );

    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line
  }, [hasMore, loadingMore, page, q, location, company, jobType, sort]);

  return (
    <div
      className="app-shell"
      style={{
        gridTemplateColumns: sidebarOpen ? "270px 1fr" : "0px 1fr",
      }}
    >
      {/* LEFT SIDEBAR */}
      {sidebarOpen && (
        <div className="sidebar">
          <div className="side-title">Filters</div>

          <input
            className="side-input"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <input
            className="side-input"
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />

          <div className="side-title">Sort</div>
          <div
            className={`side-item ${sort === "NEW" ? "active" : ""}`}
            onClick={() => setSort("NEW")}
          >
            Newest First
          </div>
          <div
            className={`side-item ${sort === "OLD" ? "active" : ""}`}
            onClick={() => setSort("OLD")}
          >
            Oldest First
          </div>

          <div style={{ marginTop: 10 }} className="row-right">
            <button
              className="btn btn-outline"
              onClick={() => {
                setLocation("");
                setCompany("");
                setJobType("ALL");
                setSort("NEW");
                setQ("");
              }}
            >
              Clear
            </button>
            <button className="btn btn-primary" onClick={fetchFirstPage}>
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* CENTER */}
      <div className="main-area">
        {/* TOP SEARCH */}
        <div className="top-search">
          <input
            className="search-input"
            placeholder="Search jobs (role, skills, company...)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="search-btn btn btn-primary">Search</button>
        </div>

        {/* CHIPS */}
        <div className="chip-row">
          {chips.map((c) => (
            <button
              key={c}
              className={`chip ${jobType === c ? "chip-active" : ""}`}
              onClick={() => setJobType(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {err && <div className="error" style={{ marginTop: 14 }}>{err}</div>}
        {loading && <div className="card" style={{ marginTop: 14 }}>Loading jobs...</div>}

        {!loading && !err && jobs.length === 0 && (
          <div className="card" style={{ marginTop: 14 }}>
            <h3 className="card-title">No jobs found</h3>
            <p className="muted">Try changing filters or search keyword.</p>
          </div>
        )}

        {/* JOB LIST */}
        {!loading && !err && jobs.map((job) => (
          <div key={job._id} className="card" style={{ marginTop: 14 }}>
            <h3 className="card-title">{job.title}</h3>
            <p className="muted">
              <b>{job.company}</b> • {job.location || "N/A"}{" "}
              {job.jobType ? `• ${job.jobType}` : ""}
            </p>
            <div className="hr"></div>
            <p className="muted">{job.description}</p>

            <div className="row-right">
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/jobs/${job._id}`)}
              >
                View & Apply →
              </button>

            </div>
          </div>
        ))}

        {/* infinite scroll sentinel */}
        {!loading && !err && <div ref={sentinelRef} style={{ height: 1 }} />}

        {/* loading more */}
        {!loading && !err && loadingMore && (
          <div className="card" style={{ marginTop: 14 }}>
            Loading more jobs...
          </div>
        )}

        {/* end */}
        {!loading && !err && !hasMore && jobs.length > 0 && (
          <div className="card" style={{ marginTop: 14 }}>
            You have reached the end ✅
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
