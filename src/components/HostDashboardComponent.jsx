import { useState, useEffect } from 'preact/hooks'; // Import useEffect along with useState
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Import getAuth and onAuthStateChanged
import { db, auth, storage } from '../../firebase-config';
import { doc, getDoc } from 'firebase/firestore';
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

        const unsubscribe = onAuthStateChanged(auth, async user => {
            if (user) {
                setEmail(user.email);
                setEmailLoading(false); // Set loading to false once email is fetched

                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setEarnings(userData.earnings);
                    setEarningsLoading(false); // Set loading to false once earnings are fetched
                    setEarningsTotal(userData.earningsTotal);
                    setEarningsTotalLoading(false); // Set loading to false once earningsTotal is fetched
                } else {
                    console.log("No such document!");
                    // Handle no document found, possibly set loading to false here as well
                }
            } else {
                console.log("No user is currently signed in.");
                // Handle no user signed in, possibly redirect or set loading to false
            }
        });

        return () => unsubscribe();
    }, []);


    return (
        <div>
            <p>Current User's Email: {email} {emailLoading && <img src="/images/loading.gif" width="20px" alt="Loading..."/>}</p>
            <p>Earnings: {earnings} {earningsLoading && <img src="/images/loading.gif" width="20px" alt="Loading..."/>}</p>
            <p>Total Earnings: {earningsTotal} {earningsTotalLoading && <img src="/images/loading.gif" width="20px" alt="Loading..."/>}</p>
            <button class="roomButton"><p>Enter Your Room</p></button>
        </div>
    );
}

export default HostDashboardComponent;