import { useState, useEffect } from 'preact/hooks';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { db } from '../../firebase-config';
import { doc, onSnapshot } from 'firebase/firestore';
import '../styles/styles.css';

function HostDashboardComponent() {
    const [email, setEmail] = useState('');
    const [emailLoading, setEmailLoading] = useState(true);
    const [earnings, setEarnings] = useState(null);
    const [earningsLoading, setEarningsLoading] = useState(true);
    const [earningsTotal, setEarningsTotal] = useState(null);
    const [earningsTotalLoading, setEarningsTotalLoading] = useState(true);
    const [showModal, setShowModal] = useState(false); // State to control modal visibility

    useEffect(() => {
        const auth = getAuth();

        const unsubscribeAuth = onAuthStateChanged(auth, user => {
            if (user) {
                setEmail(user.email);
                setEmailLoading(false);
                const docRef = doc(db, "users", user.uid);

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
                return unsubscribeDoc;
            } else {
                setShowModal(true); // Show modal if not logged in
            }
        });

        return () => {
            unsubscribeAuth();
        };
    }, []);

    function handleEnterRoom() {
        window.location.href = '/liveRoom';
    }

    function handleSignOut() {
        const auth = getAuth();
        signOut(auth).then(() => {
            window.location.href = '/';
        }).catch((error) => {
            console.error("Sign out error:", error);
        });
    }

    function handleModalOk() {
        window.location.href = '/'; // Redirect to home page when "OK" is clicked
    }

    return (
        <div>
            {showModal && (
                <div class="modal">
                    <div class="modal-content">
                        <p>You need to be logged in to access this page.</p>
                        <button onClick={handleModalOk}>OK</button>
                    </div>
                </div>
            )}
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