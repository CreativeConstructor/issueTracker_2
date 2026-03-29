document.addEventListener('DOMContentLoaded', async () => {
    const issueList = document.getElementById('issue-list');
    
    if (issueList) {
        await renderIssues();
    }
});

let currentFeedTab = 'pending';

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
        </div>
    `;
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
    const filtered = issues.filter(i => i.status === currentFeedTab);
    
    content.innerHTML = '';
    if (filtered.length === 0) {
        content.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No issues found in this category.</p>';
    } else {
        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gap = '20px';
        filtered.forEach(issue => grid.appendChild(createIssueCard(issue)));
        content.appendChild(grid);
    }
}

async function renderIssues() {
    const issueList = document.getElementById('issue-list');
    issueList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Loading civic issues...</p>';
    
    try {
        const response = await ApiClient.get('/issues/');
        const data = await response.json();
        const issues = data.results || data;
        
        issueList.innerHTML = `
            <div style="display: flex; gap: 10px; margin-bottom: 25px; justify-content: center;">
                <button class="btn-primary tab-btn" data-target="pending" style="background: var(--bg-glass); border: 1px solid var(--border-glass);">🚨 Pending</button>
                <button class="btn-primary tab-btn" data-target="in_progress" style="background: var(--bg-glass); border: 1px solid var(--border-glass);">🚧 In Progress</button>
                <button class="btn-primary tab-btn" data-target="done" style="background: var(--bg-glass); border: 1px solid var(--border-glass);">✅ Resolved</button>
            </div>
            <div id="tab-content"></div>
        `;

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                currentFeedTab = e.target.dataset.target;
                updateTabsUI(issues);
            });
        });

        updateTabsUI(issues);

    } catch (error) {
        console.error('Failed to parse issues:', error);
        issueList.innerHTML = '<p style="text-align: center; color: var(--danger);">Error loading issues.</p>';
    }
}

async function toggleUpvote(issueId) {
    if (!localStorage.getItem('access_token')) {
        alert("Please login to upvote issues!");
        return window.location.href = '/login/';
    }
    await ApiClient.post(`/issues/${issueId}/upvote/`, {});
    renderIssues(); 
}
