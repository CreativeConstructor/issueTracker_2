document.addEventListener('DOMContentLoaded', async () => {
    const issueList = document.getElementById('issue-list');
    
    if (issueList) {
        await renderIssues();
    }
});

async function renderIssues() {
    const issueList = document.getElementById('issue-list');
    issueList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Loading issues...</p>';
    
    try {
        const response = await ApiClient.get('/issues/');
        const data = await response.json();
        const issues = data.results || data;
        
        issueList.innerHTML = '';
        
        if (issues.length === 0) {
            issueList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No issues reported yet.</p>';
            return;
        }

        issues.forEach(issue => {
            const upvoteColor = issue.has_upvoted ? 'var(--brand-primary)' : 'var(--text-secondary)';
            const card = document.createElement('div');
            card.className = 'glass-panel';
            card.style.padding = '25px';
            
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h3 style="margin-bottom: 5px;">${issue.title}</h3>
                        <span style="font-size: 0.8em; color: var(--warning); border: 1px solid var(--border-glass); padding: 3px 8px; border-radius: 12px;">${issue.status.toUpperCase()}</span>
                        <span style="font-size: 0.8em; color: var(--text-secondary); margin-left: 10px;">${issue.category} • Urgency: ${issue.urgency}/3</span>
                        <p style="color: var(--text-secondary); margin-top: 15px; line-height: 1.5;">${issue.description}</p>
                        <p style="font-size: 0.9em; margin-top: 15px; color: var(--text-primary);">📍 ${issue.location}</p>
                    </div>
                    <div style="text-align: center; cursor: pointer;" onclick="toggleUpvote(${issue.id})">
                        <div style="font-size: 24px; color: ${upvoteColor};">⬆</div>
                        <strong style="color: ${upvoteColor};">${issue.upvote_count}</strong>
                    </div>
                </div>
            `;
            issueList.appendChild(card);
        });
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
    renderIssues(); // Refresh feed safely
}
