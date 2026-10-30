"use client";
import { useEffect, useMemo, useState, type FormEvent } from "react";

type Comment = { id: string; author: string; text: string; createdAt: number };
type Post = { id: string; community: string; author: string; createdAt: number; title: string; body: string; votes: number; comments: Comment[]; image?: string };
const communities = [
  {name:"technology",icon:"⌘",color:"violet",members:"2.4m"},
  {name:"design",icon:"✳",color:"coral",members:"840k"},
  {name:"science",icon:"⚛",color:"mint",members:"1.2m"},
  {name:"photography",icon:"▧",color:"blue",members:"690k"},
  {name:"books",icon:"▤",color:"gold",members:"510k"},
  {name:"startups",icon:"↗",color:"pink",members:"320k"}
];
const seed: Post[] = [
 {id:"p1",community:"technology",author:"Mira Chen",createdAt:Date.now()-720000,title:"What is one small tool that genuinely improved your daily workflow?",body:"Not looking for another list of fifty apps. I mean the one thing you tried that actually stuck. For me, it is a tiny script that cleans up meeting notes before I send them. What is yours?",votes:248,comments:[{id:"c1",author:"devon",text:"A text expander. I use it for all the repetitive messages I write.",createdAt:Date.now()-400000},{id:"c2",author:"pixelpilot",text:"A keyboard launcher changed how I use my laptop.",createdAt:Date.now()-300000}]},
 {id:"p2",community:"design",author:"Leo Martinez",createdAt:Date.now()-2280000,title:"Good design is often about what you leave out.",body:"Spent the morning removing half the UI from a side project. The result feels calmer, clearer, and much closer to what I wanted. More features do not always make a better product.",votes:176,comments:[{id:"c3",author:"formandfunction",text:"Editing is a design skill. Great reminder.",createdAt:Date.now()-1000000}],image:"https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80"},
 {id:"p3",community:"science",author:"Sam Okafor",createdAt:Date.now()-4500000,title:"The night sky is a time machine.",body:"Some of the light reaching our eyes tonight began its journey before human civilization existed. Every clear night is a chance to look into the past.",votes:132,comments:[],image:"https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80"},
 {id:"p4",community:"photography",author:"Asha Williams",createdAt:Date.now()-8400000,title:"A quiet morning, an empty street, and nowhere to be.",body:"Took the long way home and found this little moment. Sometimes the best camera setting is simply slowing down.",votes:98,comments:[],image:"https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200&q=80"},
 {id:"p5",community:"technology",author:"Noah Patel",createdAt:Date.now()-13200000,title:"Learning in public: week four of building my first full-stack app",body:"This week I finally understood why database relationships matter. Make the data model clear before building five screens on top of it. What helped concepts click for you?",votes:84,comments:[]}
];
const KEY="orbit-social-v1";
const ago=(t:number)=>{const m=Math.max(1,Math.floor((Date.now()-t)/60000));return m<60?`${m}m ago`:m<1440?`${Math.floor(m/60)}h ago`:`${Math.floor(m/1440)}d ago`};
const initials=(s:string)=>s.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase();

export default function Home(){
 const [posts,setPosts]=useState<Post[]>(seed),[votes,setVotes]=useState<Record<string,number>>({});
 const [saved,setSaved]=useState<string[]>([]),[joined,setJoined]=useState(["technology","design","science","photography"]);
 const [search,setSearch]=useState(""),[community,setCommunity]=useState("all"),[sort,setSort]=useState("For you");
 const [dark,setDark]=useState(false),[createOpen,setCreateOpen]=useState(false),[commentPost,setCommentPost]=useState<string|null>(null);
 const [profileOpen,setProfileOpen]=useState(false),[notice,setNotice]=useState("");
 const [title,setTitle]=useState(""),[body,setBody]=useState(""),[postCommunity,setPostCommunity]=useState("technology"),[commentDraft,setCommentDraft]=useState("");
 useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw){const d=JSON.parse(raw);if(d.posts)setPosts(d.posts);if(d.votes)setVotes(d.votes);if(d.saved)setSaved(d.saved);if(d.joined)setJoined(d.joined);if(typeof d.dark==="boolean")setDark(d.dark)}}catch{}},[]);
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify({posts,votes,saved,joined,dark}))}catch{}},[posts,votes,saved,joined,dark]);
 const shown=useMemo(()=>{let a=[...posts];if(community==="saved")a=a.filter(p=>saved.includes(p.id));else if(community!=="all")a=a.filter(p=>p.community===community);if(search.trim()){const q=search.toLowerCase();a=a.filter(p=>`${p.title} ${p.body} ${p.community} ${p.author}`.toLowerCase().includes(q))}if(sort==="Top")a.sort((x,y)=>(y.votes+(votes[y.id]||0))-(x.votes+(votes[x.id]||0)));if(sort==="Latest")a.sort((x,y)=>y.createdAt-x.createdAt);return a},[posts,community,saved,search,sort,votes]);
 const selected=posts.find(p=>p.id===commentPost)||null;
 function toast(s:string){setNotice(s);window.setTimeout(()=>setNotice(""),2500)}
 function create(e:FormEvent<HTMLFormElement>){e.preventDefault();if(!title.trim())return;const p:Post={id:`p${Date.now()}`,community:postCommunity,author:"Anurag K.",createdAt:Date.now(),title:title.trim(),body:body.trim(),votes:1,comments:[]};setPosts(x=>[p,...x]);setCommunity("all");setSort("Latest");setTitle("");setBody("");setCreateOpen(false);toast("Post published on this device.");}
 function comment(e:FormEvent<HTMLFormElement>){e.preventDefault();if(!selected||!commentDraft.trim())return;const c={id:`c${Date.now()}`,author:"Anurag K.",text:commentDraft.trim(),createdAt:Date.now()};setPosts(x=>x.map(p=>p.id===selected.id?{...p,comments:[...p.comments,c]}:p));setCommentDraft("");toast("Comment added.");}
 function reset(){setCommunity("all");setSearch("");setSort("For you")}
 function share(id:string){const url=`${location.origin}/#${id}`;if(navigator.clipboard){navigator.clipboard.writeText(url).then(()=>toast("Post link copied.")).catch(()=>toast(url))}else toast(url)}
 return <main className={`orbit ${dark?"theme-dark":""}`}>
  <header className="topbar"><a className="brand" href="#" onClick={reset}><span className="brand-mark">o</span>orbit <small>BETA</small></a>
   <label className="searchbar"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Orbit" aria-label="Search Orbit"/><kbd>⌘ K</kbd></label>
   <div className="top-actions"><button className="icon-btn" onClick={()=>setDark(x=>!x)} aria-label="Toggle theme">{dark?"☀":"☾"}</button><button className="create-btn" onClick={()=>setCreateOpen(true)}>＋ Create post</button><button className="avatar avatar-top" onClick={()=>setProfileOpen(true)}>AK</button></div>
  </header>
  <div className="app-shell">
   <aside className="left-rail">
    <div className="rail-label">MENU</div>
    <button className={`rail-link ${community==="all"?"active":""}`} onClick={reset}><span>⌂</span>Home</button>
    <button className="rail-link" onClick={()=>setSort("Top")}><span>↗</span>Popular</button>
    <button className="rail-link" onClick={()=>{setCommunity("all");setSearch("")}}><span>⌕</span>Discover</button>
    <button className="rail-link" onClick={()=>toast("You are all caught up.")}><span>♧</span>Notifications</button>
    <button className={`rail-link ${community==="saved"?"active":""}`} onClick={()=>setCommunity("saved")}><span>▱</span>Saved posts</button>
    <div className="rail-heading"><span className="rail-label">YOUR COMMUNITIES</span><span>＋</span></div>
    {communities.filter(c=>joined.includes(c.name)).map(c=><button className={`community-link ${community===c.name?"selected":""}`} key={c.name} onClick={()=>setCommunity(c.name)}><i className={`community-symbol ${c.color}`}>{c.icon}</i>c/{c.name}</button>)}
    <button className="see-all" onClick={()=>setCommunity("all")}>Explore all communities →</button>
    <div className="rail-promo"><b>✦</b><strong>Your corner of the internet.</strong><p>Find your people. Share what matters.</p><button onClick={()=>toast("Community discovery is coming soon.")}>Explore communities ↗</button></div>
    <div className="rail-footer">About · Guidelines · Privacy<br/>© 2026 Orbit Social</div>
   </aside>
   <section className="feed-column">
    <div className="welcome-row"><div><div className="eyebrow">YOUR COMMUNITY, YOUR WORLD</div><h1>Your daily orbit <span>✦</span></h1><p>Fresh conversations from communities you care about.</p></div><div className="online-pill"><i/>Community is active</div></div>
    <div className="community-strip"><button className="community-tile" onClick={()=>setCreateOpen(true)}><i className="tile-icon plus">＋</i>Create</button>{communities.map(c=><button className="community-tile" key={c.name} onClick={()=>setCommunity(c.name)}><i className={`tile-icon ${c.color}`}>{c.icon}</i>{c.name}</button>)}</div>
    <div className="feed-toolbar"><div className="feed-tabs">{["For you","Latest","Top"].map(s=><button key={s} className={sort===s?"selected":""} onClick={()=>setSort(s)}>{s}</button>)}</div><span>{shown.length} posts</span></div>
    {community!=="all"&&<div className="filter-banner">Showing {community==="saved"?"saved posts":`c/${community}`}<button onClick={()=>setCommunity("all")}>Clear ×</button></div>}
    <div className="post-list">{shown.map(p=>{const c=communities.find(x=>x.name===p.community);const v=votes[p.id]||0;return <article className="post-card" id={p.id} key={p.id}>
     <div className="post-top"><i className={`post-icon ${c?.color||"violet"}`}>{c?.icon||"✦"}</i><div className="post-meta"><button onClick={()=>setCommunity(p.community)}>c/{p.community}</button><span>· Posted by {p.author} · {ago(p.createdAt)}</span></div><button className="more" onClick={()=>setSaved(x=>x.includes(p.id)?x.filter(i=>i!==p.id):[...x,p.id])}>{saved.includes(p.id)?"▣":"···"}</button></div>
     <h2>{p.title}</h2>{p.body&&<p className="post-body">{p.body}</p>}{p.image&&<img className="post-image" src={p.image} alt="Community post"/>}
     <div className="post-actions"><div className="votes"><button className={v===1?"vote-on":""} onClick={()=>setVotes(x=>({...x,[p.id]:x[p.id]===1?0:1}))}>▲</button><b>{p.votes+v}</b><button className={v===-1?"vote-on":""} onClick={()=>setVotes(x=>({...x,[p.id]:x[p.id]===-1?0:-1}))}>▼</button></div><button className="action" onClick={()=>setCommentPost(p.id)}>▤ {p.comments.length} comments</button><button className="action" onClick={()=>share(p.id)}>↗ Share</button><button className={`action save ${saved.includes(p.id)?"saved":""}`} onClick={()=>setSaved(x=>x.includes(p.id)?x.filter(i=>i!==p.id):[...x,p.id])}>▱ Save</button></div>
    </article>})}{!shown.length&&<div className="empty"><b>⌕</b><h2>No posts found</h2><p>Try another search or clear your filters.</p><button className="create-btn" onClick={reset}>Clear filters</button></div>}</div>
    <div className="feed-end">You’re all caught up <span>✦</span></div>
   </section>
   <aside className="right-rail">
    <section className="panel profile-card"><div className="cover">✦</div><div className="profile-content"><button className="avatar profile-avatar" onClick={()=>setProfileOpen(true)}>AK</button><h3>Anurag K. <span>✓</span></h3><small>@anurag</small><p>Curious mind. Building things and learning in public.</p><div className="stats"><div><b>{posts.filter(p=>p.author==="Anurag K.").length}</b><small>Posts</small></div><div><b>{joined.length}</b><small>Communities</small></div><div><b>{saved.length}</b><small>Saved</small></div></div><button className="profile-button" onClick={()=>setProfileOpen(true)}>View profile</button></div></section>
    <section className="panel side-panel"><h3>Trending discussions</h3>{[["01","Artificial intelligence","2.4k conversations","technology"],["02","Next.js development","1.8k conversations","technology"],["03","Design systems","956 conversations","design"],["04","Space exploration","742 conversations","science"]].map(([n,t,count,target])=><button className="trend" key={n} onClick={()=>setCommunity(target)}><small>{n} · TRENDING</small><b>{t}</b><span>{count}</span></button>)}</section>
    <section className="panel side-panel"><h3>Discover communities</h3>{communities.filter(c=>!joined.includes(c.name)).map(c=><div className="suggest" key={c.name}><i className={`community-symbol ${c.color}`}>{c.icon}</i><div><b>c/{c.name}</b><small>{c.members} members</small></div><button onClick={()=>setJoined(x=>[...x,c.name])}>＋</button></div>)}</section>
    <div className="right-footer">Made for curious people ♥<br/>Terms · Privacy · Help</div>
   </aside>
  </div>
  <nav className="mobile-nav"><button onClick={reset}><span>⌂</span>Home</button><button onClick={()=>setSort("Top")}><span>↗</span>Popular</button><button onClick={()=>setCreateOpen(true)}><span className="mobile-plus">＋</span>Create</button><button onClick={()=>toast("You are all caught up.")}><span>♧</span>Alerts</button><button onClick={()=>setProfileOpen(true)}><span>◉</span>Profile</button></nav>
  {createOpen&&<div className="backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setCreateOpen(false)}}><form className="modal" onSubmit={create}><div className="modal-head"><div><small>SHARE WITH YOUR ORBIT</small><h2>Create a post</h2></div><button type="button" onClick={()=>setCreateOpen(false)}>×</button></div><label>Community</label><select value={postCommunity} onChange={e=>setPostCommunity(e.target.value)}>{communities.map(c=><option key={c.name}>{c.name}</option>)}</select><label>Post title</label><input required maxLength={160} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Give your post a clear title"/><label>Your thoughts</label><textarea rows={5} value={body} onChange={e=>setBody(e.target.value)} placeholder="What would you like to share?"/><div className="modal-bottom"><span>{title.length}/160</span><button className="create-btn">Publish post ↗</button></div></form></div>}
  {selected&&<div className="backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setCommentPost(null)}}><section className="modal"><div className="modal-head"><div><small>COMMUNITY CONVERSATION</small><h2>Comments ({selected.comments.length})</h2></div><button onClick={()=>setCommentPost(null)}>×</button></div><h3 className="comment-title">{selected.title}</h3><div className="comment-list">{selected.comments.length?selected.comments.map(c=><div className="comment" key={c.id}><i>{initials(c.author)}</i><div><b>{c.author}</b><small>{ago(c.createdAt)}</small><p>{c.text}</p></div></div>):<p className="empty-comments">No comments yet. Start the conversation.</p>}</div><form className="comment-form" onSubmit={comment}><input value={commentDraft} onChange={e=>setCommentDraft(e.target.value)} required placeholder="Add to the conversation…"/><button className="create-btn">Reply</button></form></section></div>}
  {profileOpen&&<div className="backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setProfileOpen(false)}}><section className="modal"><div className="modal-head"><div><small>YOUR ORBIT PROFILE</small><h2>Profile</h2></div><button onClick={()=>setProfileOpen(false)}>×</button></div><div className="profile-modal-user"><i className="avatar">AK</i><div><b>Anurag K.</b><small>@anurag · Member</small></div></div><p>Curious mind. Building things and learning in public.</p><p className="local-note">This is a local demo profile. Connect authentication and a shared database to make accounts available across devices.</p></section></div>}
  {notice&&<div className="toast">{notice}</div>}
 </main>
}
