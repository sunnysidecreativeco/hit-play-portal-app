import { useState, useEffect } from 'preact/hooks'; // Import useEffect along with useState
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Import getAuth and onAuthStateChanged
import { db, auth, storage } from '../../firebase-config';
import { doc, getDoc } from 'firebase/firestore';

function HostDashboardComponent() {
    const [email, setEmail] = useState('');
    const [emailLoading, setEmailLoading] = useState(true); // Loading state for email
    const [earnings, setEarnings] = useState(0);
    const [earningsLoading, setEarningsLoading] = useState(true); // Loading state for earnings
    const [earningsTotal, setEarningsTotal] = useState(0);
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
                    setEarnings(userData.earnings || 0);
                    setEarningsLoading(false); // Set loading to false once earnings are fetched
                    setEarningsTotal(userData.earningsTotal || 0);
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
            <p>Current User's Email: {email} {emailLoading && <img src="/images/loading.gif" alt="Loading..."/>}</p>
            <p>Earnings: {earnings} {earningsLoading && <img src="/images/loading.gif" alt="Loading..."/>}</p>
            <p>Total Earnings: {earningsTotal} {earningsTotalLoading && <img src="/images/loading.gif" alt="Loading..."/>}</p>
        </div>
    );
}

export default HostDashboardComponent;