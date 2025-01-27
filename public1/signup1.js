// Get form elements
const signInBtn = document.getElementById("signIn");
const signUpBtn = document.getElementById("signUp");
const firstForm = document.getElementById("form1"); // Signup form
const secondForm = document.getElementById("form2"); // Login form
const container = document.querySelector(".container");

// Toggle between Sign In and Sign Up panels
signInBtn.addEventListener("click", () => {
    console.log('Switching to Sign In form...');
    container.classList.remove("right-panel-active");
});

signUpBtn.addEventListener("click", () => {
    console.log('Switching to Sign Up form...');
    container.classList.add("right-panel-active");
});

// Handle Sign Up Form Submission
firstForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Gather Sign Up Form Data
    const username = document.getElementById('username').value;
    const email = document.getElementById('email-signup').value;
    const password = document.getElementById('password-signup').value;

    console.log(`Attempting to sign up with username: ${username}, email: ${email}`);

    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });

        if (response.ok) {
            alert('Sign Up Successful!');
            container.classList.remove("right-panel-active"); // Switch to Sign In panel
        } else {
            const error = await response.text();
            alert(`Sign Up Failed: ${error}`);
        }
    } catch (err) {
        console.error('Error during sign up:', err);
        alert('An error occurred. Please try again.');
    }
});

// Handle Sign In Form Submission
secondForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Gather Sign In Form Data
    const email = document.getElementById('email-signin').value;
    const password = document.getElementById('password-signin').value;

    console.log(`Attempting to sign in with email: ${email}`);

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const { token } = await response.json();

            // Store the token in localStorage for future requests
            localStorage.setItem('authToken', token);

            // Redirect all users to the admin page
            
            window.location.href = '/admin1.html';
        } else {
            const error = await response.text();
            alert(`Sign In Failed: ${error}`);
        }
    } catch (err) {
        console.error('Error during sign in:', err);
        alert('An error occurred. Please try again.');
    }
});
