import { useState, useEffect } from 'preact/hooks';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../firebase-config';
import { doc, getDoc, onSnapshot, collection, query, orderBy, getDocs } from "firebase/firestore";
import '../styles/styles.css';

function EmailListComponent() {
    const [roomName, setRoomName] = useState('');
    const [emails, setEmails] = useState([]);
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

                                // Fetch emails collection
                                const emailsCollectionRef = collection(db, "liveRooms", user.uid, "emails");
                                const emailsQuery = query(emailsCollectionRef, orderBy("date", "desc"));
                                const emailDocsSnap = await getDocs(emailsQuery);
                                
                                const emailData = emailDocsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                                setEmails(emailData);
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
            {emails.map(email => (
                <div key={email.id}>
                    <p>Email: {email.email}</p>
                    <p>Artist: {email.artistName}</p>
                    <p>Date: {new Date(email.date.seconds * 1000).toLocaleString()}</p>
                </div>
            ))}
            {showModal && (
                <div className="modal">
                    <p>Please log in to view the content.</p>
                </div>
            )}
        </div>
    );
}

export default EmailListComponent;