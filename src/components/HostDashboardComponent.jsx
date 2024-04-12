import { useState, useEffect } from 'preact/hooks'; // Import useEffect along with useState
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'; // Import getAuth and onAuthStateChanged
import { db, auth, storage } from '../../firebase-config';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import '../styles/styles.css';

function HostDashboardComponent() {
    const [email, setEmail] = useState('');
    const [emailLoading, setEmailLoading] = useState(true); // Loading state for email
    const [earnings, setEarnings] = useState(null);
    const [earningsLoading, setEarningsLoading] = useState(true); // Loading state for earnings
    const [earningsTotal, setEarningsTotal] = useState(null);
    const [earningsTotalLoading, setEarningsTotalLoading] = useState(true); // Loading state for earningsTotal

    useEffect(() => {
        const auth = getAuth();

        const unsubscribeAuth = onAuthStateChanged(auth, user => {
            if (user) {
                setEmail(user.email);
                setEmailLoading(false);

                const docRef = doc(db, "users", user.uid);

                // Subscribe to document changes
                const unsubscribeDoc = onSnapshot(docRef, docSnap => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setEarnings(userData.earnings);
                        setEarningsLoading(false);
                        setEarningsTotal(userData.earningsTotal);
                        setEarningsTotalLoading(false);
                    } else {
                        console.log("No such document!");
                    }
                });

                // Return the unsubscribe function for the document listener
                return () => {
                    unsubscribeDoc();
                };
            } else {
                console.log("No user is currently signed in.");
                window.location.href = '/'; // Redirect to home page if not logged in
            }
        });

        // Clean up the authentication subscription when the component unmounts
        return () => {
            unsubscribeAuth();
        };
    }, []);


    function handleEnterRoom() {
        window.location.href = '/liveRoom'; // Redirect to the liveRoom page
    }

    function handleSignOut() {
        const auth = getAuth();
        signOut(auth).then(() => {
            console.log("User signed out successfully");
            window.location.href = '/'; // Optionally redirect to home or login page
        }).catch((error) => {
            console.error("Sign out error:", error);
        });
    }

    return (
        <div>
            <div>
                <p>Current User's Email: {email} {emailLoading && <img src="/images/loading.gif" width="20px" alt="Loading..."/>}</p>
                <p>Earnings: {earnings !== null ? earnings : earningsLoading && <img src="/images/loading.gif" width="20px" alt="Loading..."/>}</p>
                <p>Total Earnings: {earningsTotal !== null ? earningsTotal : earningsTotalLoading && <img src="/images/loading.gif" width="20px" alt="Loading..."/>}</p>
                <button class="roomButton" onClick={handleEnterRoom}><p>Enter Your Room</p></button>
                
            </div>
            <div>
                <button class="roomButton" onClick={handleSignOut}><p>Sign Out</p></button>
            </div>
        </div>
    );
}

export default HostDashboardComponent;