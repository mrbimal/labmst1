const loginForm = document.querySelector('#login-form');
const usernameInput = document.querySelector('#username');
const sessionPanel = document.querySelector('#session-panel');
const welcomeMessage = document.querySelector('#welcome-message');
const roleSummary = document.querySelector('#role-summary');
const postList = document.querySelector('#post-list');
const createPostButton = document.querySelector('#create-post');
const postCount = document.querySelector('#post-count');
const publishedCount = document.querySelector('#published-count');
const draftCount = document.querySelector('#draft-count');
const logoutButton = document.querySelector('#logout-button');
const demoNotice = document.querySelector('#demo-notice');

const posts = [
  { id: 1, title: 'JWTs, without the jargon', status: 'Published', description: 'A JSON Web Token carries claims in a signed package. Its signature helps verify integrity, but the payload is not automatically secret.' },
  { id: 2, title: 'Authentication is not authorization', status: 'Draft', description: 'Authentication checks identity. Authorization checks which actions that identity is allowed to perform.' },
];
let nextPostId = 3;
let activeRole = '';

function createAction(label, action, className = 'button button-small') {
  const button = document.createElement('button');
  button.className = className;
  button.type = 'button';
  button.dataset.action = action;
  button.textContent = label;
  return button;
}

function renderDashboard() {
  const isAdmin = activeRole === 'Admin';
  postList.replaceChildren();
  postCount.textContent = String(posts.length).padStart(2, '0');
  publishedCount.textContent = String(posts.filter((post) => post.status === 'Published').length).padStart(2, '0');
  draftCount.textContent = String(posts.filter((post) => post.status === 'Draft').length).padStart(2, '0');

  posts.forEach((post) => {
    const card = document.createElement('article');
    card.className = 'post-card';
    card.dataset.postId = String(post.id);

    const postInfo = document.createElement('div');
    postInfo.className = 'post-info';
    const status = document.createElement('span');
    status.className = `post-status ${post.status.toLowerCase()}`;
    status.textContent = post.status;
    const title = document.createElement('h5');
    title.textContent = post.title;
    postInfo.append(status, title);

    const details = document.createElement('p');
    details.className = 'post-details';
    details.hidden = true;
    details.textContent = post.description;

    const actions = document.createElement('div');
    actions.className = 'post-actions';
    actions.append(createAction('Read post', 'read', 'button button-read'));
    if (isAdmin) {
      actions.append(
        createAction('Edit', 'edit'),
        createAction(post.status === 'Published' ? 'Unpublish' : 'Publish', 'publish'),
        createAction('Delete', 'delete', 'button button-delete-small'),
      );
    } else {
      const permission = document.createElement('span');
      permission.className = 'permission-note';
      permission.textContent = 'READ ONLY';
      const editButton = createAction('Edit', 'edit');
      const publishButton = createAction(post.status === 'Published' ? 'Unpublish' : 'Publish', 'publish');
      const deleteButton = createAction('Delete', 'delete', 'button button-delete-small');
      [editButton, publishButton, deleteButton].forEach((button) => {
        button.disabled = true;
        button.title = 'Admin access required';
      });
      actions.append(permission, editButton, publishButton, deleteButton);
    }

    card.append(postInfo, actions, details);
    postList.append(card);
  });
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!loginForm.reportValidity()) return;

  const role = event.submitter.dataset.role;
  const username = usernameInput.value.trim();
  if (!username || !role) return;

  activeRole = role;
  welcomeMessage.textContent = `Welcome, ${username} (${role})`;
  roleSummary.textContent = role === 'Admin'
    ? 'Full access: manage posts, publishing, and content.'
    : 'Viewer access: read posts and explore the library.';
  createPostButton.disabled = role !== 'Admin';
  createPostButton.title = role === 'Admin' ? '' : 'Admin access required';
  renderDashboard();
  demoNotice.textContent = '';

  loginForm.hidden = true;
  sessionPanel.hidden = false;
});

createPostButton.addEventListener('click', () => {
  const post = {
    id: nextPostId++,
    title: 'New security note',
    status: 'Draft',
    description: 'A new draft is ready for editing and publishing.',
  };
  posts.unshift(post);
  renderDashboard();
  demoNotice.textContent = 'New draft added to the library.';
});

postList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const card = button.closest('.post-card');
  const postId = Number(card.dataset.postId);
  const post = posts.find((item) => item.id === postId);
  if (!post) return;

  if (button.dataset.action === 'read') {
    const details = card.querySelector('.post-details');
    details.hidden = !details.hidden;
    button.textContent = details.hidden ? 'Read post' : 'Close post';
    return;
  }

  if (activeRole !== 'Admin') return;
  demoNotice.textContent = '';

  if (button.dataset.action === 'publish') {
    post.status = post.status === 'Published' ? 'Draft' : 'Published';
    demoNotice.textContent = `Post ${post.status.toLowerCase()}.`;
    renderDashboard();
  } else if (button.dataset.action === 'delete') {
    posts.splice(posts.indexOf(post), 1);
    demoNotice.textContent = 'Post deleted from the demo library.';
    renderDashboard();
  } else if (button.dataset.action === 'edit') {
    const title = card.querySelector('h5');
    const input = document.createElement('input');
    input.className = 'edit-title-input';
    input.value = post.title;
    input.setAttribute('aria-label', 'Edit post title');
    const saveButton = createAction('Save', 'save', 'button button-small');
    const cancelButton = createAction('Cancel', 'cancel', 'button button-small');
    const editForm = document.createElement('form');
    editForm.className = 'edit-form';
    editForm.append(input, saveButton, cancelButton);
    title.replaceWith(editForm);
    input.focus();
    input.select();
  } else if (button.dataset.action === 'save') {
    const newTitle = card.querySelector('.edit-title-input').value.trim();
    if (!newTitle) return;
    post.title = newTitle;
    demoNotice.textContent = 'Post title updated.';
    renderDashboard();
  } else if (button.dataset.action === 'cancel') {
    renderDashboard();
  }
});

postList.addEventListener('submit', (event) => {
  if (event.target.matches('.edit-form')) event.preventDefault();
});

logoutButton.addEventListener('click', () => {
  sessionPanel.hidden = true;
  loginForm.hidden = false;
  loginForm.reset();
  activeRole = '';
  demoNotice.textContent = '';
  usernameInput.focus();
});