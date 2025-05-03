// Check Authorization
async function isLoggedIn() {
  const response = await fetch('api/fullname');
  if (response.status === 403) {
    window.location.href = '/error.html';
  }
}

// Welcome message
async function loadWelcome() {
    const response = await fetch('api/fullname');
    console.log(response);
    if (!response.ok) {
        console.error('Failed to fetch full name');
        return;
    }

    const name = await response.json();
    document.getElementById('welcomeMsg').innerHTML = "Welcome, " + name + "!";
}


async function loadGoals() {
    console.log("LOADING COALS\n")
    const goals = await fetch('/api/goals').then(response => response.json());

    console.log("GOALS", goals);

    if (Object.keys(goals).length === 0) {
        document.getElementById('goals-container').innerHTML = '<p>No goals set! Set an eating goal';
        return;
    }

    const todaysTotals = await fetch('/api/todays-totals').then(response => response.json())

    document.getElementById('calories-bar').style.width = `${100 * todaysTotals.calories / goals.calories}%`;
    document.getElementById('calories-count').innerHTML = `${todaysTotals.calories}/${goals.calories}`;
    
    document.getElementById('protein-bar').style.width = `${100 * todaysTotals.protein / goals.protein}%`;
    document.getElementById('protein-count').innerHTML = `${todaysTotals.protein}/${goals.protein}`;
    
    document.getElementById('carbs-bar').style.width = `${100 * todaysTotals.carbs / goals.carbs}%`;
    document.getElementById('carbs-count').innerHTML = `${todaysTotals.carbs}/${goals.carbs}`;
    
    document.getElementById('fat-bar').style.width = `${100 * todaysTotals.fat / goals.fat}%`;
    document.getElementById('fat-count').innerHTML = `${todaysTotals.fat}/${goals.fat}`;
}


async function loadPFP() {
  // pull pfp image *(does not work yet)
  fetch('/api/profile-photo-bytes')
      .then(response => {
          console.log("Response: ");
          console.log(response);
          return response.blob();
      })
      .then(blob => {
          if (!blob || blob.size === 0) {
              console.log("Empty image data")
          }
          const url = URL.createObjectURL(blob);
          console.log("URL found:");
          console.log(url);
          document.getElementById('profile-picture').src = url;
      })
      .catch((error) => {
          console.log(error);
          console.log('Using default profile image');
      }
      );
}


// logout button event handler
document.getElementById('logout_button').onclick = async function() {
    try {
        const response = await fetch('/api/logout', { method: 'POST' });
        if (response.ok) {
            window.location.href = '/landingPage.html';
        } else {
            alert('Logout failed. Please try again.');
        }
    } catch (err) {
        alert('Logout failed. Please try again.');
    }
};

// toggle update profile message
document.getElementById('profile-picture').onclick = function() {
  const element = document.getElementById('update_profile');
  if (element.style.display === 'none') {
    element.style.display = 'flex';
  } else {
    element.style.display = 'none';
  }
}

document.getElementById('submitButton').onclick = async function() {
  const fileInput = document.getElementById('newPhoto');
  const file = fileInput.files[0];
  if (!file) {
    alert('Please select a photo first');
    return;
  }

  try {
    console.log("HI\n");
    // read image file to bytes
    const base64Data = await readFileAsBase64(file);
    console.log("Base64:", base64Data.slice(0, 30));

    // Send to server
    const response = await fetch('/api/profilephoto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPhoto: base64Data })
    });

    console.log('image');
    console.log(response);
    if (response.ok) {
      console.log('Profile photo updated!');
      location.reload();
    } else {
      // Show error if server failed
      const error = await response.json();
      alert('Profile update failed: ' + (error.error || 'Unknown error'));
    }
    
    
  } catch (err) {
    console.log(err);
    alert('Profile update failed.');
  }
}

// Helper to read file as base64
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64Data = reader.result.split(',')[1];
      resolve(base64Data);
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

window.onload = () => {
    isLoggedIn();
    loadWelcome();
    loadGoals();
    loadPFP();
    document.getElementById('update_profile').style.display = 'none';
}
