import { useState, useEffect } from 'preact/hooks';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../firebase-config';
import { doc, onSnapshot } from 'firebase/firestore';
import '../styles/styles.css';

function LiveRoomComponent() {
    const [roomName, setRoomName] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const auth = getAuth();

        const unsubscribeAuth = onAuthStateChanged(auth, user => {
            if (user) {
                const roomDocRef = doc(db, "liveRooms", user.uid);
                const unsubscribeRoomDoc = onSnapshot(roomDocRef, docSnap => {
                    if (docSnap.exists()) {
                        const roomData = docSnap.data();
                        setRoomName(roomData.roomName); // Confirm the field name is correct
                        console.log("Room data:", roomData); // Debugging line
                    } else {
                        console.log("No such room document!");
                        setRoomName(''); // Explicitly set roomName to empty if no document
                    }
                });

                return () => unsubscribeRoomDoc();
            } else {
                setShowModal(true);
                console.log("User is not logged in.");
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
                <p>Room Name: {roomName || "Loading room name..."}</p>
            </div>
        </div>
    );
}

export default LiveRoomComponent;