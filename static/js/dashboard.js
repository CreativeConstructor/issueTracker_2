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

let currentDashTab = 'pending';

function createDashboardList(issuesArray, isGov) {
    if (issuesArray.length === 0) {
        return '<p style="color: var(--text-secondary); font-style: italic; margin-bottom: 20px;">No issues found in this category.</p>';
    }
    
    let html = `<div style="display: grid; gap: 15px;">`;
    issuesArray.forEach(i => {
        html += `
            <div class="glass-panel" style="padding: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${i.title}</strong>
                        <p style="font-size: 0.85em; color: var(--text-secondary); margin-top: 5px;">📍 ${i.location} | Urgency: ${i.urgency}/3</p>
                    </div>
        `;
        
        if (isGov) {
            html += `
                    <select class="form-input" style="width: 150px; padding: 8px;" onchange="updateStatus(${i.id}, this.value)">
                        <option value="pending" ${i.status==='pending'?'selected':''}>Pending</option>
                        <option value="in_progress" ${i.status==='in_progress'?'selected':''}>In Progress</option>
                        <option value="done" ${i.status==='done'?'selected':''}>Done</option>
                    </select>
            `;
        } else {
             html += `<span style="border: 1px solid var(--border-glass); padding: 5px; border-radius: 8px; color: var(--warning);">${i.status.toUpperCase()}</span>`;
        }
        html += `</div></div>`;
    });
    html += `</div>`;
    return html;
}

function updateDashTabsUI(issues, isGov) {
    document.querySelectorAll('.dash-tab-btn').forEach(btn => {
        if(btn.dataset.target === currentDashTab) {
            btn.style.background = 'var(--brand-primary)';
            btn.style.boxShadow = '0 0 10px var(--brand-glow)';
        } else {
            btn.style.background = 'var(--bg-glass)';
            btn.style.boxShadow = 'none';
        }
    });

    const content = document.getElementById('dash-tab-content');
    const filtered = issues.filter(i => i.status === currentDashTab);
    content.innerHTML = createDashboardList(filtered, isGov);
}

async function renderCitizenDashboard(container) {
    container.innerHTML = `
        <div style="margin-bottom: 40px; padding: 20px; border: 1px solid var(--border-glass); border-radius: 12px;">
            <h3 style="margin-bottom: 15px; color: var(--brand-primary);">Report New Public Issue</h3>
            <form id="issue-form" style="display: grid; gap: 15px;">
                <input class="form-input" id="i-title" placeholder="Issue Title" required>
                <textarea class="form-input" id="i-desc" placeholder="Issue Description" required></textarea>
                <div style="display: flex; gap: 15px;">
                    <select class="form-input" id="i-cat" required>
                        <option value="road">Road Breakage</option>
                        <option value="water">Water Problem</option>
                        <option value="electricity">Street Light / Electricity</option>
                        <option value="other">Other</option>
                    </select>
                    <select class="form-input" id="i-urg" required>
                        <option value="1">Low Urgency</option>
                        <option value="2">Medium Urgency</option>
                        <option value="3">High Urgency</option>
                    </select>
                </div>
                <input class="form-input" id="i-loc" placeholder="Specific Location" required>
                <button type="submit" class="btn-primary">Submit Report</button>
            </form>
        </div>
        <h3 style="margin-bottom: 20px;">My Reported Issues</h3>
        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
            <button class="btn-primary dash-tab-btn" data-target="pending" style="background: var(--bg-glass); border: 1px solid var(--border-glass);">🚨 Pending</button>
            <button class="btn-primary dash-tab-btn" data-target="in_progress" style="background: var(--bg-glass); border: 1px solid var(--border-glass);">🚧 In Progress</button>
            <button class="btn-primary dash-tab-btn" data-target="done" style="background: var(--bg-glass); border: 1px solid var(--border-glass);">✅ Done</button>
        </div>
        <div id="dash-tab-content">Loading...</div>
    `;

    document.getElementById('issue-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            title: document.getElementById('i-title').value,
            description: document.getElementById('i-desc').value,
            category: document.getElementById('i-cat').value,
            urgency: parseInt(document.getElementById('i-urg').value),
            location: document.getElementById('i-loc').value,
        };
        await ApiClient.post('/issues/', data);
        alert("Issue successfully submitted!");
        renderCitizenDashboard(container);
    });

    const res = await ApiClient.get('/issues/');
    const issues = await res.json();
    const myIssues = issues.results || issues;

    document.querySelectorAll('.dash-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentDashTab = e.target.dataset.target;
            updateDashTabsUI(myIssues, false);
        });
    });

    updateDashTabsUI(myIssues, false);
}

async function renderGovDashboard(container) {
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid var(--border-glass); padding-bottom: 10px;">
            <h3>Government Management Console</h3>
            <span style="background: var(--bg-glass); color: var(--success); padding: 5px 10px; border-radius: 6px; font-size: 0.8em;">Override Clearance Active</span>
        </div>
        
        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
            <button class="btn-primary dash-tab-btn" data-target="pending" style="background: var(--bg-glass); border: 1px solid var(--border-glass);">🚨 Pending</button>
            <button class="btn-primary dash-tab-btn" data-target="in_progress" style="background: var(--bg-glass); border: 1px solid var(--border-glass);">🚧 In Progress</button>
            <button class="btn-primary dash-tab-btn" data-target="done" style="background: var(--bg-glass); border: 1px solid var(--border-glass);">✅ Resolved</button>
        </div>
        
        <div id="dash-tab-content">Loading...</div>
    `;

    const res = await ApiClient.get('/issues/');
    const issues = await res.json();
    const all = issues.results || issues;

    document.querySelectorAll('.dash-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentDashTab = e.target.dataset.target;
            updateDashTabsUI(all, true);
        });
    });

    updateDashTabsUI(all, true);
}

async function updateStatus(issueId, newStatus) {
    try {
        await ApiClient.request(`/issues/${issueId}/`, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus })
        });
        const container = document.getElementById('dashboard-content');
        await renderGovDashboard(container);
    } catch(e) {
        alert("Failed to update priority levels.");
    }
}
