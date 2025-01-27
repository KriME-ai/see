const signInBtn = document.getElementById("signIn");
const signUpBtn = document.getElementById("signUp");
const firstForm = document.getElementById("form1"); // Fixed typo: changed "fistForm" to "firstForm"
const secondForm = document.getElementById("form2");
const container = document.querySelector(".container");

// Toggle between Sign In and Sign Up
signInBtn.addEventListener("click", () => {
    console.log('Switching to Sign In form...');
    container.classList.remove("right-panel-active");
});

signUpBtn.addEventListener("click", () => {
    console.log('Switching to Sign Up form...');
    container.classList.add("right-panel-active");
});

// Handle Sign Up Form Submission
firstForm.addEventListener("submit", async (e) => { // Fixed typo: used "firstForm" instead of "fistForm"
    e.preventDefault();

    // Gather Sign Up Form Data
    const username = firstForm.querySelector('input[placeholder="User"]').value; // Fixed typo: used "firstForm"
    const email = firstForm.querySelector('input[placeholder="Email"]').value; // Fixed typo: used "firstForm"
    const password = firstForm.querySelector('input[placeholder="Password"]').value; // Fixed typo: used "firstForm"

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
    const email = secondForm.querySelector('input[placeholder="Email"]').value;
    const password = secondForm.querySelector('input[placeholder="Password"]').value;

    console.log(`Attempting to sign in with email: ${email}`);

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const { token } = await response.json();
            localStorage.setItem('authToken', token); // Store the token for further requests
            alert('Sign In Successful!');
            window.location.href = '/admin.html'; // Redirect to the homepage or dashboard
        } else {
            const error = await response.text();
            alert(`Sign In Failed: ${error}`);
        }
    } catch (err) {
        console.error('Error during sign in:', err);
        alert('An error occurred. Please try again.');
    }
});
