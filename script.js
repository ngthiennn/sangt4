const API = "http://localhost:3000/posts";
const COMMENT_API = "http://localhost:3000/comments";
let currentPostId = null;

async function loadPosts() {
  const res = await fetch(API);
  const posts = await res.json();

  const ul = document.getElementById("postList");
  ul.innerHTML = "";

  posts.forEach(p => {
    const li = document.createElement("li");

    if (p.isDeleted) {
      li.style.textDecoration = "line-through";
      li.style.color = "gray";
    }

    li.innerHTML = `
    <span onclick="showComments('${p.id}', '${p.title}')"
            style="cursor:pointer;color:blue">
            ${p.title}
    </span>
    <button onclick="deletePost('${p.id}')">Xóa</button>
    `;

    ul.appendChild(li);
  });
}

async function addPost() {
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;

  const res = await fetch(API);
  const posts = await res.json();

  let maxId = 0;
  posts.forEach(p => {
    const num = parseInt(p.id);
    if (num > maxId) maxId = num;
  });

  const newPost = {
    id: (maxId + 1).toString(),
    title,
    content,
    isDeleted: false
  };

  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newPost)
  });

  loadPosts();
}

async function deletePost(id) {
  const res = await fetch(`${API}/${id}`);
  const post = await res.json();

  post.isDeleted = true;

  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post)
  });

  loadPosts();
}

async function showComments(postId, title) {
  currentPostId = postId;
  document.getElementById("commentSection").style.display = "block";
  document.getElementById("commentTitle").innerText = "Post: " + title;

  const res = await fetch(`${COMMENT_API}?postId=${postId}`);
  const comments = await res.json();

  const ul = document.getElementById("commentList");
  ul.innerHTML = "";

  comments.forEach(c => {
    if (c.isDeleted) return;

    const li = document.createElement("li");
    li.innerHTML = `
      ${c.content}
      <button onclick="deleteComment('${c.id}')">Xóa</button>
    `;
    ul.appendChild(li);
  });
}

async function addComment() {
  const content = document.getElementById("commentInput").value;

  const res = await fetch(COMMENT_API);
  const comments = await res.json();

  let maxId = 0;
  comments.forEach(c => {
    const num = parseInt(c.id);
    if (num > maxId) maxId = num;
  });

  const newComment = {
    id: (maxId + 1).toString(),
    postId: currentPostId,
    content,
    isDeleted: false
  };

  await fetch(COMMENT_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newComment)
  });

  showComments(currentPostId, document.getElementById("commentTitle").innerText.replace("Post: ",""));
}

async function deleteComment(id) {
  const res = await fetch(`${COMMENT_API}/${id}`);
  const cmt = await res.json();

  cmt.isDeleted = true;

  await fetch(`${COMMENT_API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cmt)
  });

  showComments(currentPostId, document.getElementById("commentTitle").innerText.replace("Post: ",""));
}


loadPosts();
