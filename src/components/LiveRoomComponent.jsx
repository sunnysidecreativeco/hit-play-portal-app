import { useState, useEffect } from 'preact/hooks';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { db } from '../../firebase-config';
import { doc, onSnapshot } from 'firebase/firestore';
import '../styles/styles.css';

function LiveRoomComponent() {
    const [roomName, setRoomName] = useState(''); // Added state for roomName
    const [showModal, setShowModal] = useState(false); // State to control modal visibility

    useEffect(() => {
        const auth = getAuth();

        const unsubscribeAuth = onAuthStateChanged(auth, user => {
            if (user) {
                setEmail(user.email);
                setEmailLoading(false);


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
                <p>Room Name: {roomName}</p> {/* Display the room name */}
            </div>
            
        </div>
    );
}

export default LiveRoomComponent;