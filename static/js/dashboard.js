document.addEventListener('DOMContentLoaded', async () => {
    const dashboardContent = document.getElementById('dashboard-content');
    if (!dashboardContent) return;

    if (!localStorage.getItem('access_token')) {
        window.location.href = '/login/';
        return;
    }

    try {
        const userRes = await ApiClient.get('/auth/me/');
        const user = await userRes.json();

        if (user.role === 'gov_employee') {
            await renderGovDashboard(dashboardContent);
        } else {
            await renderCitizenDashboard(dashboardContent);
        }
    } catch (e) {
        dashboardContent.innerHTML = '<p class="text-danger">Failed to load dashboard secure logic.</p>';
    }
});

async function renderCitizenDashboard(container) {
    container.innerHTML = `
        <div style="margin-bottom: 40px; padding: 30px; border: 1px solid var(--border-glass); border-radius: 12px; text-align: center; background: rgba(255, 255, 255, 0.03);">
            <h3 style="margin-bottom: 10px;">Have a Public Issue to Report?</h3>
            <p style="color: var(--text-secondary); margin-bottom: 20px;">Your reports help the government prioritize repairs and maintenance in your area.</p>
            <a href="/report-issue/" class="btn-primary" style="display: inline-block; text-decoration: none; padding: 12px 30px;">Report New Public Issue</a>
        </div>
        <h3>My Reported Issues</h3>
        <div id="my-issues-list" style="margin-top: 20px; display: grid; gap: 15px;"></div>
    `;

    const list = document.getElementById('my-issues-list');
    const res = await ApiClient.get('/issues/');
    const issues = await res.json();
    // In a real app we would have an endpoint filtering by author natively
    const myIssues = issues.results || issues;
    
    if(myIssues.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary)">No issues generated yet.</p>';
    }

    myIssues.forEach(i => {
        const d = document.createElement('div');
        d.className = 'glass-panel';
        d.style.padding = '15px';
        d.innerHTML = `<strong>${i.title}</strong> - Status: <span style="color: var(--warning)">${i.status.toUpperCase()}</span>`;
        list.appendChild(d);
    });
}

async function renderGovDashboard(container) {
    container.innerHTML = `
        <h3>Government Management Console</h3>
        <p style="color: var(--success); margin-bottom: 20px;">Authenticated as Gov Employee. You have universal override clearance.</p>
        <div id="unified-issues-list" style="display: grid; gap: 15px;"></div>
    `;

    const list = document.getElementById('unified-issues-list');
    const res = await ApiClient.get('/issues/');
    const issues = await res.json();
    const all = issues.results || issues;

    all.forEach(i => {
        const d = document.createElement('div');
        d.className = 'glass-panel';
        d.style.padding = '15px';
        d.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${i.title}</strong>
                    <p style="font-size: 0.85em; color: var(--text-secondary);">${i.location} | Urgency: ${i.urgency}</p>
                </div>
                <select class="form-input" style="width: 150px;" onchange="updateStatus(${i.id}, this.value)">
                    <option value="pending" ${i.status==='pending'?'selected':''}>Pending</option>
                    <option value="in_progress" ${i.status==='in_progress'?'selected':''}>In Progress</option>
                    <option value="done" ${i.status==='done'?'selected':''}>Done</option>
                </select>
            </div>
        `;
        list.appendChild(d);
    });
}

async function updateStatus(issueId, newStatus) {
    try {
        await ApiClient.request(`/issues/${issueId}/`, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus })
        });
        alert("Status updated universally!");
    } catch(e) {
        alert("Failed to update priority levels.");
    }
}
