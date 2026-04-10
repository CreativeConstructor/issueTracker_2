document.addEventListener('DOMContentLoaded', async () => {
    const issueForm = document.getElementById('issue-form');
    if (!issueForm) return;

    if (!localStorage.getItem('access_token')) {
        window.location.href = '/login/';
        return;
    }

    issueForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = issueForm.querySelector('button[type="submit"]');
        const originalText = btn.innerText;
        btn.innerText = 'Submitting...';
        btn.disabled = true;

        const data = {
            title: document.getElementById('i-title').value,
            description: document.getElementById('i-desc').value,
            category: document.getElementById('i-cat').value,
            urgency: parseInt(document.getElementById('i-urg').value),
            location: document.getElementById('i-loc').value,
        };

        try {
            const res = await ApiClient.post('/issues/', data);
            if (res.ok) {
                alert("Issue successfully submitted!");
                window.location.href = '/dashboard/';
            } else {
                const err = await res.json();
                alert("Error: " + JSON.stringify(err));
                btn.innerText = originalText;
                btn.disabled = false;
            }
        } catch (e) {
            alert("Failed to submit issue. Please check your connection.");
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
});
