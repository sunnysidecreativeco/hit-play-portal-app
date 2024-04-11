import { useState, useEffect } from 'preact/hooks'; // Import useEffect along with useState
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Import getAuth and onAuthStateChanged

function HostDashboardComponent() {
    const [email, setEmail] = useState('');

    useEffect(() => {
        const auth = getAuth(); // Initialize Firebase Auth
        const unsubscribe = onAuthStateChanged(auth, user => {
            if (user) {
                // User is signed in, you can get the email from the user object
                setEmail(user.email);
            } else {
                // No user is signed in, handle accordingly, maybe redirect to login page
                console.log("No user is currently signed in.");
            }
        });

        // Clean up the subscription when the component unmounts
        return () => unsubscribe();
    }, []); // The empty dependency array ensures this effect runs once when the component mounts

    return (
        <div>
            <p>Current User's Email: {email}</p>
            {/* Render the rest of your dashboard UI here */}
        </div>
    );
}

export default HostDashboardComponent;