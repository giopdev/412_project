// Welcome message
async function loadWelcome() {
    const response = await fetch('api/fullname');
    console.log(response);
    if (!response.ok) {
        console.error('Failed to fetch full name');
        return;
    }

    // i dont know
    const name = response.statusText;
    document.getElementById('welcomeMsg').innerHTML = "Welcome, " + name + "!";
}

// pull pfp image *(does not work yet)
fetch('/api/profile-photo-bytes')
    .then(response => {
        response.blob();
        console.log("Response: ");
        console.log(response);
    })
    .then(blob => {
        if (!blob || blob.size === 0) {
            console.log("Empty image data")
        }
        const url = URL.createObjectURL(blob);
        console.log("URL found:");
        console.log(url);
        document.getElementById('profile-photo').src = url;
    })
    .catch((error) => {
        console.log(error);
        console.log('Using default profile image');
    }
);

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


  window.onload = () => {
    loadWelcome();
  }