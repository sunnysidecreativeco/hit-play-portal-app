import { useState, useEffect } from 'preact/hooks'; // Import useEffect along with useState
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Import getAuth and onAuthStateChanged
import { db, auth, storage } from '../../firebase-config';
import { doc, getDoc } from 'firebase/firestore';

function HostDashboardComponent() {
    const [email, setEmail] = useState('');
    const [earnings, setEarnings] = useState(0);
    const [earningsTotal, setEarningsTotal] = useState(0);

    useEffect(() => {
        const auth = getAuth(); // Initialize Firebase Auth

        const unsubscribe = onAuthStateChanged(auth, async user => {
            if (user) {
                // User is signed in, you can get the email from the user object
                setEmail(user.email);

                // Now fetch user data from Firestore
                const docRef = doc(db, "users", user.uid); // Reference to the user's document
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    // Document exists, set the state with data
                    const userData = docSnap.data();
                    setEarnings(userData.earnings || 0); // Assuming 'earnings' is a field in your document
                    setEarningsTotal(userData.earningsTotal || 0); // Assuming 'earningsTotal' is another field
                } else {
                    console.log("No such document!");
                }
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
            <p>Earnings: {earnings}</p>
            <p>Total Earnings: {earningsTotal}</p>
        </div>
    );
}

export default HostDashboardComponent;