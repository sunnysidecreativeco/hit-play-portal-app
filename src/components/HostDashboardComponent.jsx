import { useState, useEffect } from 'preact/hooks';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { db } from '../../firebase-config';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import '../styles/styles.css';

function HostDashboardComponent() {
    const [email, setEmail] = useState('');
    const [roomName, setRoomName] = useState(''); // Added state for roomName
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

                // Fetch user data
                const userDocRef = doc(db, "users", user.uid);
                const unsubscribeUserDoc = onSnapshot(userDocRef, docSnap => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setEarnings(userData.earnings);
                        setEarningsLoading(false);
                        setEarningsTotal(userData.earningsTotal);
                        setEarningsTotalLoading(false);
                    } else {
                        console.log("No such user document!");
                    }
                });

                // Fetch room name from liveRooms collection
                const roomDocRef = doc(db, "liveRooms", user.uid);
                const unsubscribeRoomDoc = onSnapshot(roomDocRef, docSnap => {
                    if (docSnap.exists()) {
                        const roomData = docSnap.data();
                        setRoomName(roomData.roomName); // Assuming the field is named 'roomName'
                    } else {
                        console.log("No such room document!");
                    }
                });

                // Return the unsubscribe function for the document listener
                return () => {
                    unsubscribeUserDoc();
                    unsubscribeRoomDoc();
                };
            } else {
                setShowModal(true); // Show modal if not logged in
            }
        });

        return () => {
            unsubscribeAuth();
        };
    }, []);



    function handleGoLive() {
        const auth = getAuth();
        const user = auth.currentUser;
      
        if (user) {
          const userId = user.uid;
          const liveRoomRef = doc(db, "liveRooms", userId);
      
          // Update the onAir and lineOpen fields
          updateDoc(liveRoomRef, {
            onAir: true,
            lineOpen: true, // Assuming the field name for open line is 'lineOpen'
          })
            .then(() => {
              console.log("Live room is now active!");
              window.location.href = '/liveRoom';
            })
            .catch((error) => {
              console.error("Error updating live room:", error);
            });
        } else {
          console.error("User is not logged in!");
        }
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
                <p>Room Name: {roomName}</p> {/* Display the room name */}
                <p>Earnings: {earnings !== null ? earnings : earningsLoading && <img src="/images/loading.gif" width="20px" alt="Loading..."/>}</p>
                <p>Total Earnings: {earningsTotal !== null ? earningsTotal : earningsTotalLoading && <img src="/images/loading.gif" width="20px" alt="Loading..."/>}</p>
                <button style="margin-bottom: 15px;" class="standardGreenButton" onClick={handleGoLive}><p>Go Live</p></button>
            </div>
            <div>
                <button class="standardGreenButton" onClick={handleSignOut}><p>Sign Out</p></button>
            </div>
        </div>
    );
}

export default HostDashboardComponent;