import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const signinBtns = document.querySelectorAll('.nav-signin');

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in
            const displayName = user.displayName || "User";

            signinBtns.forEach(btn => {
                // Update icon to user icon
                btn.innerHTML = `
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                    ${displayName}
                `;
                // Change href to avoid going to login page again
                btn.href = "#";
                btn.title = "Click to Sign Out";
                
                // Add click listener for sign out
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if(confirm("Do you want to sign out?")) {
                        signOut(auth).then(() => {
                            window.location.reload();
                        });
                    }
                });
            });
        }
    });
});
