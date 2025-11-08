document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Fetch and display activities
  async function loadActivities() {
    try {
        const response = await fetch('/activities');
        const activities = await response.json();
        const activitiesList = document.getElementById('activities-list');
        const activitySelect = document.getElementById('activity');
        
        // Clear loading message and activity options
        activitiesList.innerHTML = '';
        activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';
        
    // Create activity cards
    Object.entries(activities).forEach(([name, details]) => {
      const card = document.createElement('div');
      card.className = 'activity-card';
      card.innerHTML = `
        <h4>${name}</h4>
        <p><strong>Description:</strong> ${details.description}</p>
        <p><strong>Schedule:</strong> ${details.schedule}</p>
        <p><strong>Available Spots:</strong> ${details.max_participants - details.participants.length} of ${details.max_participants}</p>
        <div class="participants-list-title">Current Participants:</div>
        <ul class="participants-list">
          ${details.participants.map(email => `
            <li style="display: flex; align-items: center; justify-content: space-between;">
              <span>${email}</span>
              <span class="delete-participant" title="Remove participant" data-activity="${name}" data-email="${email}" style="cursor:pointer;color:#c62828;font-size:1.2em;margin-left:10px;">&#10006;</span>
            </li>
          `).join('')}
        </ul>
      `;
      activitiesList.appendChild(card);
      // Add option to select dropdown
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      activitySelect.appendChild(option);
    });
    // Add event listeners for delete icons
    document.querySelectorAll('.delete-participant').forEach(icon => {
      icon.addEventListener('click', async (e) => {
        const activity = e.target.getAttribute('data-activity');
        const email = e.target.getAttribute('data-email');
        if (confirm(`Remove ${email} from ${activity}?`)) {
          try {
            const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email })
            });
            const result = await response.json();
            messageDiv.textContent = response.ok ? result.message : result.detail;
            messageDiv.className = response.ok ? 'message success' : 'message error';
            messageDiv.classList.remove('hidden');
            if (response.ok) {
              loadActivities();
            }
          } catch (error) {
            messageDiv.textContent = 'An error occurred. Please try again.';
            messageDiv.className = 'message error';
            messageDiv.classList.remove('hidden');
          }
        }
      });
    });
    } catch (error) {
        console.error('Error loading activities:', error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;
    const messageDiv = document.getElementById("message");

    try {
        const response = await fetch(`/activities/${encodeURIComponent(activity)}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const result = await response.json();
        messageDiv.textContent = response.ok ? result.message : result.detail;
        messageDiv.className = response.ok ? 'message success' : 'message error';
        messageDiv.classList.remove('hidden');

        if (response.ok) {
            // Reload activities to show updated participants
            loadActivities();
            // Reset form
            document.getElementById('signup-form').reset();
        }
    } catch (error) {
        messageDiv.textContent = 'An error occurred. Please try again.';
        messageDiv.className = 'message error';
        messageDiv.classList.remove('hidden');
    }
  });

  // Load activities when page loads
  loadActivities();
});
