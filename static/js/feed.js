document.addEventListener('DOMContentLoaded', async () => {
    const issueList = document.getElementById('issue-list');
    
    if (issueList) {
        await renderIssues();
    }
});

let currentFeedTab = 'all';
let cachedIssues = [];

function createIssueCard(issue) {
    const upvoteColor = issue.has_upvoted ? 'var(--brand-primary)' : 'var(--text-secondary)';
    const card = document.createElement('div');
    card.className = 'glass-panel';
    card.style.padding = '25px';
    
    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
                <h3 style="margin-bottom: 5px;">${issue.title}</h3>
                <span style="font-size: 0.8em; color: var(--text-secondary);">${issue.category} • Urgency: ${issue.urgency}/3</span>
                <p style="color: var(--text-secondary); margin-top: 15px; line-height: 1.5;">${issue.description}</p>
                <p style="font-size: 0.9em; margin-top: 15px; color: var(--text-primary);">📍 ${issue.location}</p>
            </div>
            <div style="text-align: center; cursor: pointer;" onclick="toggleUpvote(${issue.id})">
                <div style="font-size: 24px; color: ${upvoteColor};">⬆</div>
                <strong style="color: ${upvoteColor};">${issue.upvote_count}</strong>
            </div>
        <div class="comments-section" id="comments-section-${issue.id}">
            <div class="comment-list" id="comment-list-${issue.id}">
                <p style="font-size: 0.8em; color: var(--text-secondary);">Loading comments...</p>
            </div>
            <div class="comment-form">
                <input type="text" id="comment-input-${issue.id}" class="comment-input" placeholder="Add a comment...">
                <button class="comment-submit" onclick="postComment(${issue.id})">Post</button>
            </div>
        </div>
    `;
    
    // Asynchronously load comments for this issue
    loadComments(issue.id);
    
    return card;
}

function updateTabsUI(issues) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if(btn.dataset.target === currentFeedTab) {
            btn.style.background = 'var(--brand-primary)';
            btn.style.boxShadow = '0 0 10px var(--brand-glow)';
        } else {
            btn.style.background = 'var(--bg-glass)';
            btn.style.boxShadow = 'none';
        }
    });

    const content = document.getElementById('tab-content');
    const filtered = currentFeedTab === 'all' ? issues : issues.filter(i => i.status === currentFeedTab);
    
    content.innerHTML = '';
    if (filtered.length === 0) {
        content.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">No issues found in this category.</p>';
    } else {
        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gap = '20px';
        filtered.forEach(issue => grid.appendChild(createIssueCard(issue)));
        content.appendChild(grid);
    }
}

window.changeTab = function(target) {
    currentFeedTab = target;
    updateTabsUI(cachedIssues);
}

async function renderIssues() {
    const content = document.getElementById('tab-content');
    content.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">Loading issues feed...</p>';
    
    try {
        const response = await ApiClient.get('/issues/');
        const data = await response.json();
        cachedIssues = data.results || data;
        
        updateTabsUI(cachedIssues);
    } catch (error) {
        console.error('Failed to parse issues:', error);
        content.innerHTML = '<p style="text-align: center; color: var(--danger); padding: 40px;">Error loading issues list.</p>';
    }
}

async function toggleUpvote(issueId) {
    if (!localStorage.getItem('access_token')) {
        alert("Please login to upvote issues!");
        return window.location.href = '/login/';
    }
    
    await ApiClient.post(`/issues/${issueId}/upvote/`, {});
    renderIssues(); // Refresh feed safely
}

async function loadComments(issueId) {
    try {
        const response = await ApiClient.get(`/issues/${issueId}/comments/`);
        const comments = await response.json();
        const list = document.getElementById(`comment-list-${issueId}`);
        if (!list) return;
        
        list.innerHTML = '';
        if (comments.length === 0) {
            list.innerHTML = '<p style="font-size: 0.8em; color: var(--text-secondary);">No comments yet. Be the first!</p>';
            return;
        }
        
        comments.forEach(c => {
            const item = document.createElement('div');
            item.className = 'comment-item';
            item.innerHTML = `
                <div class="comment-author">${c.user ? c.user.username : 'Anonymous'}</div>
                <div class="comment-text">${c.text}</div>
            `;
            list.appendChild(item);
        });
    } catch(err) {
        console.error('Failed to load comments:', err);
    }
}

window.postComment = async function(issueId) {
    if (!localStorage.getItem('access_token')) {
        alert("Please login to comment!");
        return window.location.href = '/login/';
    }
    
    const input = document.getElementById(`comment-input-${issueId}`);
    if (!input || !input.value.trim()) return;
    
    try {
        const response = await ApiClient.post('/comments/', {
            issue: issueId,
            text: input.value.trim()
        });
        
        if (response.ok) {
            input.value = '';
            loadComments(issueId);
        } else {
            alert("Failed to post comment.");
        }
    } catch(err) {
        console.error(err);
    }
}
