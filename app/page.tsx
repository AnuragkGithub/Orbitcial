/* eslint-disable @next/next/no-img-element */
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

export type Comment = {
  id: string;
  author: string;
  text: string;
  createdAt: number;
};

export type Post = {
  id: string;
  community: string;
  author: string;
  createdAt: number;
  title: string;
  body: string;
  votes: number;
  comments: Comment[];
  image?: string;
};

const initialCommunities = [
  { name: "technology", icon: "⌘", color: "violet", members: "2.4m" },
  { name: "design", icon: "✳", color: "coral", members: "840k" },
  { name: "science", icon: "⚛", color: "mint", members: "1.2m" },
  { name: "photography", icon: "▧", color: "blue", members: "690k" },
  { name: "books", icon: "▤", color: "gold", members: "510k" },
  { name: "startups", icon: "↗", color: "pink", members: "320k" },
];

const SEED_TIME = Date.now();

const seedPosts: Post[] = [
  {
    id: "p1",
    community: "technology",
    author: "Mira Chen",
    createdAt: SEED_TIME - 720000,
    title: "What is one small tool that genuinely improved your daily workflow?",
    body: "Not looking for another list of fifty apps. I mean the one thing you tried that actually stuck. For me, it is a tiny script that cleans up meeting notes before I send them. What is yours?",
    votes: 248,
    comments: [
      { id: "c1", author: "devon", text: "A text expander. I use it for all the repetitive messages I write.", createdAt: SEED_TIME - 400000 },
      { id: "c2", author: "pixelpilot", text: "A keyboard launcher changed how I use my laptop completely.", createdAt: SEED_TIME - 300000 },
    ],
  },
  {
    id: "p2",
    community: "design",
    author: "Leo Martinez",
    createdAt: SEED_TIME - 2280000,
    title: "Good design is often about what you leave out.",
    body: "Spent the morning removing half the UI from a side project. The result feels calmer, clearer, and much closer to what I wanted. More features do not always make a better product.",
    votes: 176,
    comments: [
      { id: "c3", author: "formandfunction", text: "Editing is a design skill. Great reminder.", createdAt: SEED_TIME - 1000000 },
    ],
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p3",
    community: "science",
    author: "Sam Okafor",
    createdAt: SEED_TIME - 4500000,
    title: "The night sky is a time machine.",
    body: "Some of the light reaching our eyes tonight began its journey before human civilization existed. Every clear night is a chance to look into the past.",
    votes: 132,
    comments: [],
    image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p4",
    community: "photography",
    author: "Asha Williams",
    createdAt: SEED_TIME - 8400000,
    title: "A quiet morning, an empty street, and nowhere to be.",
    body: "Took the long way home and found this little moment. Sometimes the best camera setting is simply slowing down.",
    votes: 98,
    comments: [],
    image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p5",
    community: "technology",
    author: "Noah Patel",
    createdAt: SEED_TIME - 13200000,
    title: "Learning in public: week four of building my first full-stack app",
    body: "This week I finally understood why database relationships matter. Make the data model clear before building five screens on top of it. What helped concepts click for you?",
    votes: 84,
    comments: [],
  },
];

const seedPostsById = new Map(seedPosts.map((post) => [post.id, post]));
const STORAGE_KEY = "orbit-social-v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isComment(value: unknown): value is Comment {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.author === "string" &&
    typeof value.text === "string" &&
    typeof value.createdAt === "number"
  );
}

function isPost(value: unknown): value is Post {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.community === "string" &&
    typeof value.author === "string" &&
    typeof value.createdAt === "number" &&
    typeof value.title === "string" &&
    typeof value.body === "string" &&
    typeof value.votes === "number" &&
    Array.isArray(value.comments) &&
    value.comments.every(isComment) &&
    (value.image === undefined || typeof value.image === "string")
  );
}

function currentTimestamp(): number {
  return Date.now();
}

function createId(prefix: string): string {
  return `${prefix}${currentTimestamp()}-${Math.random().toString(36).slice(2, 8)}`;
}

function timeAgo(timestamp: number): string {
  const minutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>(seedPosts);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState<string[]>([]);
  const [joined, setJoined] = useState<string[]>(["technology", "design", "science", "photography"]);
  const [search, setSearch] = useState("");
  const [community, setCommunity] = useState("all");
  const [sort, setSort] = useState<"For you" | "Latest" | "Top">("For you");
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Modals & UI state
  const [createOpen, setCreateOpen] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notice, setNotice] = useState("");

  // Post form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [postCommunity, setPostCommunity] = useState("technology");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageUrlInput, setImageUrlInput] = useState<string>("");

  // Comment draft
  const [commentDraft, setCommentDraft] = useState("");

  const searchInputRef = useRef<HTMLInputElement>(null);
  const communityStripRef = useRef<HTMLDivElement>(null);
  const noticeTimeoutRef = useRef<number | null>(null);

  // Hydrating browser persistence is an intentional client-only state update.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data: unknown = JSON.parse(raw);
        if (!isRecord(data)) throw new Error("Saved Orbit data has an invalid format.");

        if (Array.isArray(data.posts)) {
          const validPosts = data.posts.filter(isPost);
          if (validPosts.length !== data.posts.length) {
            console.error("Some saved Orbit posts were invalid and were skipped.");
          }
          const refreshedPosts = validPosts.map((post) => {
            const seed = seedPostsById.get(post.id);
            if (!seed || post.title !== seed.title || post.author !== seed.author) {
              return post;
            }
            return {
              ...post,
              createdAt: seed.createdAt,
              comments: post.comments.map((comment) => {
                const seedComment = seed.comments.find(
                  (item) =>
                    item.id === comment.id &&
                    item.author === comment.author &&
                    item.text === comment.text
                );
                return seedComment
                  ? { ...comment, createdAt: seedComment.createdAt }
                  : comment;
              }),
            };
          });
          if (refreshedPosts.length > 0) setPosts(refreshedPosts);
        }
        if (isRecord(data.votes)) {
          const validVotes: Record<string, number> = {};
          for (const [id, value] of Object.entries(data.votes)) {
            if (value === -1 || value === 0 || value === 1) validVotes[id] = value;
          }
          setVotes(validVotes);
        }
        if (Array.isArray(data.saved)) {
          setSaved(data.saved.filter((id): id is string => typeof id === "string"));
        }
        if (Array.isArray(data.joined)) {
          const knownCommunities = new Set(initialCommunities.map((item) => item.name));
          setJoined(
            data.joined.filter(
              (name): name is string =>
                typeof name === "string" && knownCommunities.has(name)
            )
          );
        }
        if (typeof data.dark === "boolean") setDark(data.dark);
      }
    } catch (error) {
      console.error("Unable to load saved Orbit data.", error);
      setNotice("Saved data could not be loaded. A fresh feed is ready.");
    }
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ posts, votes, saved, joined, dark })
      );
    } catch (error) {
      console.error("Unable to save Orbit data in this browser.", error);
      // Persistence failures need immediate user feedback from this synchronization effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotice("Orbit could not save changes. Browser storage may be full.");
    }
  }, [posts, votes, saved, joined, dark, mounted]);

  const modalOpen = createOpen || commentPostId !== null || profileOpen;

  useEffect(() => {
    if (!modalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [modalOpen]);

  useEffect(
    () => () => {
      if (noticeTimeoutRef.current !== null) {
        window.clearTimeout(noticeTimeoutRef.current);
      }
    },
    []
  );

  // Keyboard shortcut listener (Cmd+K / Ctrl+K and Escape)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        if (createOpen) setCreateOpen(false);
        if (commentPostId) setCommentPostId(null);
        if (profileOpen) setProfileOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [createOpen, commentPostId, profileOpen]);

  // Toast notification
  function showToast(msg: string) {
    setNotice(msg);
    if (noticeTimeoutRef.current !== null) {
      window.clearTimeout(noticeTimeoutRef.current);
    }
    noticeTimeoutRef.current = window.setTimeout(() => setNotice(""), 3200);
  }

  // Filter & sort feed
  const filteredPosts = useMemo(() => {
    let list = [...posts];

    if (community === "all" && sort === "For you") {
      list = list.filter((post) => joined.includes(post.community));
    }

    // Community filter
    if (community === "saved") {
      list = list.filter((p) => saved.includes(p.id));
    } else if (community !== "all") {
      list = list.filter((p) => p.community.toLowerCase() === community.toLowerCase());
    }

    // Search query filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.body.toLowerCase().includes(q) ||
          p.community.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q)
      );
    }

    // Sort order
    if (sort === "Top") {
      list.sort((a, b) => {
        const scoreA = a.votes + (votes[a.id] || 0);
        const scoreB = b.votes + (votes[b.id] || 0);
        return scoreB - scoreA;
      });
    } else if (sort === "Latest") {
      list.sort((a, b) => b.createdAt - a.createdAt);
    }

    return list;
  }, [posts, community, joined, saved, search, sort, votes]);

  // Current post selected for comments
  const activeCommentPost = posts.find((p) => p.id === commentPostId) || null;

  // Voting handler
  function handleVote(postId: string, delta: 1 | -1) {
    setVotes((prev) => {
      const current = prev[postId] || 0;
      const next = current === delta ? 0 : delta;
      return { ...prev, [postId]: next };
    });
  }

  // Save / Bookmark toggle
  function toggleSave(postId: string) {
    setSaved((prev) => {
      const isSaved = prev.includes(postId);
      const next = isSaved ? prev.filter((id) => id !== postId) : [...prev, postId];
      showToast(isSaved ? "Removed from saved posts." : "Post saved to your collection.");
      return next;
    });
  }

  // Delete post handler
  function handleDeletePost(postId: string) {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setSaved((prev) => prev.filter((id) => id !== postId));
    setVotes((prev) => {
      const next = { ...prev };
      delete next[postId];
      return next;
    });
    showToast("Post deleted.");
  }

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.currentTarget.value = "";
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size must be under 5MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      showToast("Choose a valid image file.");
      return;
    }

    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 1440 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable.");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();

      const compressed = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.8)
      );
      if (!compressed) throw new Error("Image compression failed.");

      const preview = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") resolve(reader.result);
          else reject(new Error("Image preview could not be read."));
        };
        reader.onerror = () => reject(reader.error ?? new Error("Image read failed."));
        reader.readAsDataURL(compressed);
      });

      setImagePreview(preview);
      setImageUrlInput("");
    } catch (error) {
      console.error("Unable to prepare the selected image.", error);
      showToast("This image could not be prepared. Try another image.");
    }
  }

  // Create post
  function handleCreatePost(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) return;

    const finalImage = imagePreview.trim() || imageUrlInput.trim() || undefined;

    const createdAt = currentTimestamp();
    const newPost: Post = {
      id: createId("p"),
      community: postCommunity,
      author: "Anurag K.",
      createdAt,
      title: title.trim(),
      body: body.trim(),
      votes: 1,
      comments: [],
      image: finalImage,
    };

    setPosts((prev) => [newPost, ...prev]);
    setCommunity("all");
    setSort("Latest");
    setTitle("");
    setBody("");
    setImagePreview("");
    setImageUrlInput("");
    setCreateOpen(false);
    showToast("Post published to Orbit!");
  }

  // Add comment
  function handleAddComment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!activeCommentPost || !commentDraft.trim()) return;

    const newComment: Comment = {
      id: createId("c"),
      author: "Anurag K.",
      text: commentDraft.trim(),
      createdAt: currentTimestamp(),
    };

    setPosts((prev) =>
      prev.map((p) =>
        p.id === activeCommentPost.id
          ? { ...p, comments: [...p.comments, newComment] }
          : p
      )
    );

    setCommentDraft("");
    showToast("Comment added.");
  }

  // Reset feed filters
  function handleReset() {
    setCommunity("all");
    setSearch("");
    setSort("For you");
  }

  function handleExploreCommunities() {
    setCommunity("all");
    setSearch("");
    communityStripRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "center",
    });
  }

  // Share post link
  async function handleShare(postId: string) {
    const url = new URL(window.location.href);
    url.hash = postId;
    try {
      await navigator.clipboard.writeText(url.toString());
      showToast("Post link copied to clipboard.");
    } catch (error) {
      console.error("Clipboard access failed while sharing a post.", error);
      const field = document.createElement("textarea");
      field.value = url.toString();
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      const copied = document.execCommand("copy");
      field.remove();
      showToast(copied ? "Post link copied to clipboard." : `Copy this link: ${url.toString()}`);
    }
  }

  function toggleCommunity(name: string) {
    const isJoined = joined.includes(name);
    setJoined((previous) =>
      isJoined ? previous.filter((item) => item !== name) : [...previous, name]
    );
    if (isJoined && community === name) setCommunity("all");
    showToast(isJoined ? `Left c/${name}.` : `Joined c/${name}.`);
  }

  return (
    <main className={`orbit ${dark ? "theme-dark" : ""}`} suppressHydrationWarning>
      {/* Sticky Main Top Navigation Bar */}
      <header className="topbar">
        <a className="brand" href="#" onClick={handleReset} aria-label="Orbit Home">
          <div className="brand-mark-wrapper">
            <div className="brand-mark">o</div>
            <div className="brand-orbit-ring" />
          </div>
          <span>orbit</span>
          <small>BETA</small>
        </a>

        {/* Global Search Bar */}
        <label className="searchbar">
          <span className="search-icon">⌕</span>
          <input
            ref={searchInputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search communities, posts, and topics…"
            aria-label="Search Orbit"
          />
          {search ? (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          ) : (
            <kbd>⌘ K</kbd>
          )}
        </label>

        {/* Header Right Actions */}
        <div className="top-actions">
          <button
            type="button"
            className="theme-btn"
            onClick={() => setDark((prev) => !prev)}
            aria-label="Toggle theme"
            title={dark ? "Switch to light theme" : "Switch to dark theme"}
          >
            {dark ? "☀" : "☾"}
          </button>

          <button
            type="button"
            className="create-btn"
            onClick={() => setCreateOpen(true)}
          >
            <span>＋</span> Create post
          </button>

          <button
            type="button"
            className="avatar avatar-top"
            onClick={() => setProfileOpen(true)}
            aria-label="Open profile modal"
          >
            AK
          </button>
        </div>
      </header>

      {/* Main App Layout */}
      <div className="app-shell">
        {/* Left Sidebar Rail */}
        <aside className="left-rail">
          <div className="rail-label">Navigation</div>
          <button
            type="button"
            className={`rail-link ${community === "all" && !search ? "active" : ""}`}
            onClick={handleReset}
          >
            <span>⌂</span> Home
          </button>
          <button
            type="button"
            className={`rail-link ${sort === "Top" ? "active" : ""}`}
            onClick={() => setSort("Top")}
          >
            <span>↗</span> Popular
          </button>
          <button
            type="button"
            className="rail-link"
            onClick={() => {
              setCommunity("all");
              setSearch("");
              searchInputRef.current?.focus();
            }}
          >
            <span>⌕</span> Discover
          </button>
          <button
            type="button"
            className="rail-link"
            onClick={() =>
              showToast("Notifications will be available when Orbit has an account backend.")
            }
          >
            <span>♧</span> Notifications
          </button>
          <button
            type="button"
            className={`rail-link ${community === "saved" ? "active" : ""}`}
            onClick={() => setCommunity("saved")}
          >
            <span>▱</span> Saved posts ({saved.length})
          </button>

          <div className="rail-heading">
            <span className="rail-label">Your Communities</span>
            <span>＋</span>
          </div>

          {initialCommunities
            .filter((c) => joined.includes(c.name))
            .map((c) => (
              <button
                type="button"
                className={`community-link ${community === c.name ? "selected" : ""}`}
                key={c.name}
                onClick={() => setCommunity(c.name)}
              >
                <i className={`community-symbol ${c.color}`}>{c.icon}</i>
                <span>c/{c.name}</span>
              </button>
            ))}

          <button
            type="button"
            className="see-all"
            onClick={handleExploreCommunities}
          >
            Explore all communities →
          </button>

          <div className="rail-promo">
            <strong>Your corner of the internet.</strong>
            <p>Find your people. Share what matters without the algorithm noise.</p>
            <button type="button" onClick={handleExploreCommunities}>
              Explore directory ↗
            </button>
          </div>

          <div className="rail-footer">
            About · Guidelines · Privacy · API
            <br />
            © 2026 Orbit Social Platform
          </div>
        </aside>

        {/* Center Feed Column */}
        <section className="feed-column">
          {/* Welcome Card Banner */}
          <div className="welcome-hero">
            <div className="welcome-info">
              <div className="eyebrow">YOUR COMMUNITY, YOUR WORLD</div>
              <h1>
                Your daily orbit <span>✦</span>
              </h1>
              <p>Fresh conversations and ideas from the communities you care about.</p>
              <div className="online-pill">
                <span className="online-dot" />
                Community is active
              </div>
            </div>

            {/* 3D Celestial Orbit Portal */}
            <div className="orbit-3d-portal" aria-hidden="true">
              <div className="orbit-3d-system">
                <div className="orbit-3d-core" />
                <div className="orbit-3d-ring ring-1">
                  <div className="orbit-3d-planet planet-1" />
                </div>
                <div className="orbit-3d-ring ring-2">
                  <div className="orbit-3d-planet planet-2" />
                </div>
                <div className="orbit-3d-ring ring-3">
                  <div className="orbit-3d-planet planet-3" />
                </div>
              </div>
            </div>
          </div>

          {/* Horizontal Community Carousel */}
          <div
            ref={communityStripRef}
            className="community-strip"
            role="region"
            aria-label="Communities carousel"
          >
            {/* Quick Create Tile */}
            <button
              type="button"
              className="community-tile"
              onClick={() => setCreateOpen(true)}
              title="Create a new post"
            >
              <i className="tile-icon plus-tile">＋</i>
              <span>Create</span>
            </button>

            {/* All Tile */}
            <button
              type="button"
              className={`community-tile ${community === "all" ? "selected" : ""}`}
              onClick={handleReset}
            >
              <i className="tile-icon all-tile">✦</i>
              <span>All</span>
            </button>

            {/* Saved Posts Tile */}
            <button
              type="button"
              className={`community-tile ${community === "saved" ? "selected" : ""}`}
              onClick={() => setCommunity("saved")}
            >
              <i className="tile-icon gold">▱</i>
              <span>Saved ({saved.length})</span>
            </button>

            {/* Communities */}
            {initialCommunities.map((c) => (
              <button
                type="button"
                className={`community-tile ${community === c.name ? "selected" : ""}`}
                key={c.name}
                onClick={() => setCommunity(c.name)}
              >
                <i className={`tile-icon ${c.color}`}>{c.icon}</i>
                <span>{c.name}</span>
              </button>
            ))}
          </div>

          {/* ================================================================
              STICKY TOP FEED FUNCTIONALITIES (ALWAYS VISIBLE WHILE SCROLLING)
              ================================================================ */}
          <div className="sticky-feed-bar">
            <div className="feed-toolbar">
              <div className="feed-tabs">
                {(["For you", "Latest", "Top"] as const).map((s) => (
                  <button
                    type="button"
                    key={s}
                    className={`feed-tab ${sort === s ? "selected" : ""}`}
                    onClick={() => setSort(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="feed-right-tools">
                <span className="feed-count">
                  {filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"}
                </span>

                <button
                  type="button"
                  className="feed-quick-create"
                  onClick={() => setCreateOpen(true)}
                >
                  <span>＋</span> New
                </button>
              </div>
            </div>

            {/* Active Filter Banner */}
            {community !== "all" && (
              <div className="filter-banner">
                <span>
                  Showing {community === "saved" ? "Saved posts" : `c/${community}`}
                </span>
                <button type="button" onClick={() => setCommunity("all")}>
                  Clear filter ✕
                </button>
              </div>
            )}
          </div>

          {/* Fast, Crisp, Butter-Smooth Posts List */}
          <div className="post-list" aria-live="polite" aria-busy={!mounted}>
            {filteredPosts.map((post) => {
              const comm = initialCommunities.find((x) => x.name === post.community);
              const voteStatus = votes[post.id] || 0;
              const isSaved = saved.includes(post.id);
              const totalScore = post.votes + voteStatus;
              const isAuthor = post.author === "Anurag K.";

              return (
                <article className="post-card" id={post.id} key={post.id}>
                  {/* Post Top Header */}
                  <div className="post-top">
                    <i className={`post-icon ${comm?.color || "violet"}`}>
                      {comm?.icon || "✦"}
                    </i>
                    <div className="post-meta">
                      <button
                        type="button"
                        onClick={() => setCommunity(post.community)}
                      >
                        c/{post.community}
                      </button>
                      <span suppressHydrationWarning>
                        · Posted by {post.author} · {mounted ? timeAgo(post.createdAt) : "recently"}
                      </span>
                    </div>

                    <div className="post-top-actions">
                      {isAuthor && (
                        <button
                          type="button"
                          className="post-delete-btn"
                          title="Delete this post"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Post Title & Content */}
                  <h2>{post.title}</h2>
                  {post.body && <p className="post-body">{post.body}</p>}

                  {/* Optional Image */}
                  {post.image && (
                    <div className="post-image-wrap">
                      <img
                        className="post-image"
                        src={post.image}
                        alt={post.title}
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Post Action Buttons */}
                  <div className="post-actions">
                    {/* Voting */}
                    <div className="votes">
                      <button
                        type="button"
                        className={`vote-btn ${voteStatus === 1 ? "vote-up" : ""}`}
                        onClick={() => handleVote(post.id, 1)}
                        aria-label="Upvote"
                        aria-pressed={voteStatus === 1}
                      >
                        ▲
                      </button>
                      <b className="vote-count">{totalScore}</b>
                      <button
                        type="button"
                        className={`vote-btn ${voteStatus === -1 ? "vote-down" : ""}`}
                        onClick={() => handleVote(post.id, -1)}
                        aria-label="Downvote"
                        aria-pressed={voteStatus === -1}
                      >
                        ▼
                      </button>
                    </div>

                    {/* Comments */}
                    <button
                      type="button"
                      className="action-btn"
                      onClick={() => setCommentPostId(post.id)}
                    >
                      <span>▤</span>
                      <span className="action-text">
                        {post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}
                      </span>
                    </button>

                    {/* Share */}
                    <button
                      type="button"
                      className="action-btn"
                      onClick={() => handleShare(post.id)}
                    >
                      <span>↗</span>
                      <span className="action-text">Share</span>
                    </button>

                    {/* Save */}
                    <button
                      type="button"
                      className={`action-btn save-btn ${isSaved ? "saved" : ""}`}
                      onClick={() => toggleSave(post.id)}
                      aria-pressed={isSaved}
                    >
                      <span>{isSaved ? "▣" : "▱"}</span>
                      <span className="action-text">{isSaved ? "Saved" : "Save"}</span>
                    </button>
                  </div>
                </article>
              );
            })}

            {/* Empty State */}
            {filteredPosts.length === 0 && (
              <div className="empty-feed">
                <span className="empty-icon">⌕</span>
                <h2>No posts found</h2>
                <p>
                  {community === "saved"
                    ? "You haven't saved any posts yet. Click the bookmark icon on any post to save it for later."
                    : "No posts match your current search or community filter."}
                </p>
                <button
                  type="button"
                  className="create-btn"
                  onClick={handleReset}
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>

          <div className="feed-end">
            You’re all caught up with your Orbit <span>✦</span>
          </div>
        </section>

        {/* Right Sidebar Rail */}
        <aside className="right-rail">
          {/* User Profile Preview Card */}
          <section className="panel profile-card">
            <div className="cover">✦</div>
            <div className="profile-card-body">
              <button
                type="button"
                className="avatar profile-avatar-badge"
                onClick={() => setProfileOpen(true)}
              >
                AK
              </button>
              <h3 className="profile-name">
                Anurag K. <span>✓</span>
              </h3>
              <small className="profile-handle">@anurag · Builder</small>
              <p className="profile-bio">
                Curious mind. Building modern applications, designing interfaces, and learning in public.
              </p>

              <div className="profile-stats">
                <div className="profile-stat">
                  <b>{posts.filter((p) => p.author === "Anurag K.").length}</b>
                  <small>Posts</small>
                </div>
                <div className="profile-stat">
                  <b>{joined.length}</b>
                  <small>Joined</small>
                </div>
                <div className="profile-stat">
                  <b>{saved.length}</b>
                  <small>Saved</small>
                </div>
              </div>

              <button
                type="button"
                className="profile-view-btn"
                onClick={() => setProfileOpen(true)}
              >
                View profile details
              </button>
            </div>
          </section>

          {/* Trending Discussions */}
          <section className="panel side-panel">
            <h3>Trending discussions</h3>
            {[
              ["01", "Artificial intelligence workflows", "2.4k conversations", "technology"],
              ["02", "Next.js 16 & React 19 architecture", "1.8k conversations", "technology"],
              ["03", "Minimalist Design Systems", "956 conversations", "design"],
              ["04", "Deep space telescope observations", "742 conversations", "science"],
            ].map(([num, topicName, convCount, targetComm]) => (
              <button
                type="button"
                className="trend-item"
                key={num}
                onClick={() => setCommunity(targetComm)}
              >
                <small>{num} · TRENDING</small>
                <b>{topicName}</b>
                <span>{convCount}</span>
              </button>
            ))}
          </section>

          {/* Discover More Communities */}
          <section className="panel side-panel">
            <h3>Discover communities</h3>
            {initialCommunities
              .filter((c) => !joined.includes(c.name))
              .map((c) => (
                <div className="suggest-item" key={c.name}>
                  <i className={`community-symbol ${c.color}`}>{c.icon}</i>
                  <div className="suggest-info">
                    <b>c/{c.name}</b>
                    <small>{c.members} members</small>
                  </div>
                  <button
                    type="button"
                    className="suggest-join-btn"
                    onClick={() => toggleCommunity(c.name)}
                  >
                    ＋ Join
                  </button>
                </div>
              ))}
            {initialCommunities.every((c) => joined.includes(c.name)) && (
              <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                You have joined all featured communities!
              </p>
            )}
          </section>

          <div className="right-footer">
            Built with Next.js & React
            <br />
            Terms · Privacy · Status · Guidelines
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-nav" aria-label="Mobile Navigation">
        <button
          type="button"
          className={`mobile-nav-btn ${community === "all" && sort !== "Top" ? "active" : ""}`}
          onClick={handleReset}
        >
          <span>⌂</span>
          <span>Home</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-btn ${sort === "Top" ? "active" : ""}`}
          onClick={() => {
            setSort("Top");
            setCommunity("all");
          }}
        >
          <span>↗</span>
          <span>Popular</span>
        </button>

        <button
          type="button"
          className="mobile-nav-btn"
          onClick={() => setCreateOpen(true)}
          aria-label="Create a post"
        >
          <span className="mobile-create-pill">＋</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-btn ${community === "saved" ? "active" : ""}`}
          onClick={() => setCommunity("saved")}
        >
          <span>▱</span>
          <span>Saved</span>
        </button>

        <button
          type="button"
          className="mobile-nav-btn"
          onClick={() => setProfileOpen(true)}
        >
          <span>◉</span>
          <span>Profile</span>
        </button>
      </nav>

      {/* Modal: Create Post */}
      {createOpen && (
        <div
          className="backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCreateOpen(false);
          }}
        >
          <form
            className="modal"
            onSubmit={handleCreatePost}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-post-heading"
          >
            <div className="modal-head">
              <div>
                <small>SHARE WITH YOUR ORBIT</small>
                <h2 id="create-post-heading">Create a post</h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setCreateOpen(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="post-community-select">Community</label>
              <select
                id="post-community-select"
                value={postCommunity}
                onChange={(e) => setPostCommunity(e.target.value)}
              >
                {initialCommunities.map((c) => (
                  <option key={c.name} value={c.name}>
                    c/{c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="post-title-input">Post Title</label>
              <input
                id="post-title-input"
                required
                maxLength={160}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your post an interesting, concise title"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="post-body-input">Your Thoughts</label>
              <textarea
                id="post-body-input"
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="What would you like to share, ask, or discuss?"
              />
            </div>

            <div className="form-group">
              <label>Attach Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                aria-label="Upload image from device"
              />

              {!imagePreview && (
                <input
                  type="url"
                  style={{ marginTop: "6px" }}
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Or paste an image URL (https://...)"
                />
              )}

              {imagePreview && (
                <div className="file-input-preview">
                  <img src={imagePreview} alt="Upload preview" />
                  <button
                    type="button"
                    className="file-input-remove"
                    onClick={() => setImagePreview("")}
                    title="Remove image"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div className="modal-bottom">
              <span>{title.length}/160 characters</span>
              <button type="submit" className="create-btn">
                Publish post ↗
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Comments Drawer */}
      {activeCommentPost && (
        <div
          className="backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCommentPostId(null);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="comments-heading"
            tabIndex={-1}
          >
            <div className="modal-head">
              <div>
                <small>COMMUNITY CONVERSATION</small>
                <h2 id="comments-heading">Comments ({activeCommentPost.comments.length})</h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setCommentPostId(null)}
                aria-label="Close comments"
              >
                ✕
              </button>
            </div>

            <h3 className="comment-title">{activeCommentPost.title}</h3>

            <div className="comment-list">
              {activeCommentPost.comments.length > 0 ? (
                activeCommentPost.comments.map((c) => (
                  <div className="comment-item" key={c.id}>
                    <div className="comment-avatar">{getInitials(c.author)}</div>
                    <div className="comment-content">
                      <div className="comment-author-row">
                        <b className="comment-author">{c.author}</b>
                        <small className="comment-time" suppressHydrationWarning>
                          {mounted ? timeAgo(c.createdAt) : "recently"}
                        </small>
                      </div>
                      <p className="comment-text">{c.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>
                  No comments yet. Start the conversation!
                </p>
              )}
            </div>

            <form className="comment-form" onSubmit={handleAddComment}>
              <input
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                required
                placeholder="Add your thoughts to the conversation…"
              />
              <button type="submit" className="create-btn">
                Reply
              </button>
            </form>
          </section>
        </div>
      )}

      {/* Modal: User Profile */}
      {profileOpen && (
        <div
          className="backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setProfileOpen(false);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-heading"
            tabIndex={-1}
          >
            <div className="modal-head">
              <div>
                <small>YOUR ORBIT PROFILE</small>
                <h2 id="profile-heading">Profile Details</h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setProfileOpen(false)}
                aria-label="Close profile"
              >
                ✕
              </button>
            </div>

            <div className="profile-modal-user">
              <div className="avatar profile-modal-avatar">AK</div>
              <div className="profile-modal-details">
                <b>Anurag K.</b>
                <small>@anurag · Active Member</small>
              </div>
            </div>

            <p style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: "1.6" }}>
              Curious mind. Building modern applications, designing interfaces, and learning in public.
            </p>

            {/* Theme Toggle option inside Profile Modal */}
            <div className="theme-toggle-row">
              <span>Theme Appearance</span>
              <button
                type="button"
                className="theme-btn"
                onClick={() => setDark((prev) => !prev)}
                title="Toggle appearance"
              >
                {dark ? "☀ Light" : "☾ Dark"}
              </button>
            </div>

            {/* Quick Stats in Profile Modal */}
            <div className="profile-stats">
              <div className="profile-stat">
                <b>{posts.filter((p) => p.author === "Anurag K.").length}</b>
                <small>Your Posts</small>
              </div>
              <div className="profile-stat">
                <b>{joined.length}</b>
                <small>Communities</small>
              </div>
              <div className="profile-stat">
                <b>{saved.length}</b>
                <small>Saved Posts</small>
              </div>
            </div>

            <section className="profile-community-manager" aria-label="Manage communities">
              <h3>Your communities</h3>
              {initialCommunities.map((item) => {
                const isJoined = joined.includes(item.name);
                return (
                  <div className="profile-community-row" key={item.name}>
                    <i className={`community-symbol ${item.color}`}>{item.icon}</i>
                    <span>c/{item.name}</span>
                    <button
                      type="button"
                      className={isJoined ? "community-leave-btn" : "community-join-btn"}
                      aria-pressed={isJoined}
                      onClick={() => toggleCommunity(item.name)}
                    >
                      {isJoined ? "Leave" : "Join"}
                    </button>
                  </div>
                );
              })}
            </section>

            <p className="local-note">
              This demo profile is active on this device. Connect a database (e.g. Supabase) to enable accounts across devices and shared communities.
            </p>
          </section>
        </div>
      )}

      {/* Toast Alert */}
      {notice && (
        <div className="toast" role="status" aria-live="polite">
          {notice}
        </div>
      )}
    </main>
  );
}
