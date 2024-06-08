import { useState, useEffect } from 'preact/hooks';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../firebase-config';
import { doc, getDoc, collection, query, orderBy, getDocs } from "firebase/firestore";
import '../styles/styles.css';

function EmailListComponent() {
    const [roomName, setRoomName] = useState('');
    const [emails, setEmails] = useState([]);
    const [dates, setDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [showModal, setShowModal] = useState(false);

    const emailListContainer = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    };

    const emailTable = {
        margin: 20,
        borderCollapse: 'collapse',
        //width: '50%',
        textAlign: 'center',
    };

    const td = {
        border: '1px solid black',
        padding: '8px',
    };

    const th = {
        border: '1px solid black',
        padding: '8px',
    };

    const dateButton = {
        margin: '5px',
        padding: '10px 20px',
        cursor: 'pointer',
    };

    const buttonContainer = {
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
    };

    useEffect(() => {
        const authInstance = getAuth();

        const unsubscribeAuth = onAuthStateChanged(authInstance, user => {
            if (user) {
                const fetchRoomData = async () => {
                    try {
                        const userDocRef = doc(db, "users", user.uid);

                        // Fetch user document
                        const userDocSnap = await getDoc(userDocRef);
                        if (userDocSnap.exists()) {
                            console.log("User document exists.");

                            // Fetch room document
                            const roomDocRef = doc(db, "liveRooms", user.uid);
                            const roomDocSnap = await getDoc(roomDocRef);
                            if (roomDocSnap.exists()) {
                                const roomData = roomDocSnap.data();
                                setRoomName(roomData.roomName || "No room name");

                                // Fetch emails collection
                                const emailsCollectionRef = collection(db, "liveRooms", user.uid, "emails");
                                const emailsQuery = query(emailsCollectionRef, orderBy("date", "desc"));
                                const emailDocsSnap = await getDocs(emailsQuery);

                                const emailData = emailDocsSnap.docs.map(doc => ({
                                    id: doc.id,
                                    ...doc.data()
                                }));
                                setEmails(emailData);

                                // Extract unique dates
                                const uniqueDates = [...new Set(emailData.map(email => {
                                    const date = new Date(email.date.seconds * 1000);
                                    return date.toDateString();
                                }))];
                                setDates(uniqueDates);
                            } else {
                                console.log("No such room document!");
                            }
                        } else {
                            console.log("No such user document!");
                        }
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

    const handleDateClick = (date) => {
        setSelectedDate(date);
    };

    const filteredEmails = selectedDate ? emails.filter(email => {
        const emailDate = new Date(email.date.seconds * 1000).toDateString();
        return emailDate === selectedDate;
    }) : [];

    return (
        <div style={emailListContainer}>
            <p>On this page you'll find the email and artist name of every entry to your room.</p>
            <p>{roomName}</p>
            <div style={buttonContainer}>
                {dates.map((date, index) => (
                    <button
                        key={index}
                        style={dateButton}
                        onClick={() => handleDateClick(date)}
                    >
                        {date}
                    </button>
                ))}
            </div>
            {selectedDate && (
                <div>
                    <h2>Entries for {selectedDate}</h2>
                    {filteredEmails.length > 0 ? (
                        <table style={emailTable}>
                            <thead>
                                <tr>
                                    <th style={th}>Artist Name</th>
                                    <th style={th}>Email</th>
                                    <th style={th}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmails.map(email => (
                                    <tr key={email.id}>
                                        <td style={td}>{email.artistName}</td>
                                        <td style={td}>{email.email}</td>
                                        <td style={td}>{new Date(email.date.seconds * 1000).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No entries found for {selectedDate}.</p>
                    )}
                </div>
            )}
            {showModal && (
                <div className="modal">
                    <p>Please log in to view the content.</p>
                </div>
            )}
        </div>
    );
}

export default EmailListComponent;
