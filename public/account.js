

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

document.getElementById('logout_button').onclick = async function() {
    try {
      const response = await fetch('/api/logout', { method: 'POST' });
      if (response.ok) {
        window.location.href = '/landingPage.html';
      } else {
        console.log("5");
        console.log(response);
        alert('Logout failed. Please try again.');
      }
    } catch (err) {
        console.log("6");
        console.log(err);
      alert('Logout failed. Please try again.');
    }
  };