/*
 * Script for login button to hit /login endpoint and create a user session
 */
window.onload = () => {
  document.getElementById('login_button').onclick = async function() {
    const username = login_username.value;
    const password = login_password.value;

    // Hit the /login endpoint with the user's information
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login_username: username, login_password: password }),
    });
    const responseBody = await response.json();

    // If endpoint responds with success, redirect user to the account page
    if (responseBody.success) { location.href = '/account'; }
    else {
      // Else if the response errors, set the appropriate error_label text
      document.getElementById('error_label').textContent = responseBody.error;

    }
  }
}
