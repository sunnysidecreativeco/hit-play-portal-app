import { useState, useEffect } from 'preact/hooks';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { db, storage } from '../../firebase-config';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';
import '../styles/styles.css';

function EmailListComponent() {
    const [roomName, setRoomName] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const authInstance = getAuth();

        const unsubscribeAuth = onAuthStateChanged(authInstance, user => {
            if (user) {
                const fetchRoomData = async () => {
                    try {
                        const userDocRef = doc(db, "users", user.uid);
                        const unsubscribeUserDoc = onSnapshot(userDocRef, async docSnap => {
                            if (docSnap.exists()) {
                                const roomDocRef = doc(db, "liveRooms", user.uid);
                                const roomDocSnap = await getDoc(roomDocRef);
                                console.log('the room doc is', roomDocSnap.data().roomCode);
                            } else {
                                console.log("No such user document!");
                            }
                        });

                        const roomDocRef = doc(db, "liveRooms", user.uid);
                        const unsubscribeRoomDoc = onSnapshot(roomDocRef, docSnap => {
                            if (docSnap.exists()) {
                                const roomData = docSnap.data();
                                setRoomName(roomData.roomName);
                            } else {
                                console.log("No such room document!");
                            }
                        });

                        return () => {
                            unsubscribeUserDoc();
                            unsubscribeRoomDoc();
                        };
                    } catch (error) {
                        console.error("Error fetching room data:", error);
                    }
                };

                fetchRoomData();
            } else {
                setShowModal(true); // Show modal if not logged in
            }
        });

        return () => {
            unsubscribeAuth();
        };
    }, []);

    return (
        <div>
            <p>On this page you'll find the email and artist name of every entry to your room.</p>
            <p>{roomName}</p>
            
        </div>
    );
}

export default EmailListComponent;