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
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showModal, setShowModal] = useState(false);


    const h2 = {
        fontFamily: "'ChicagoFLF', serif",
        fontSize: 30,
        marginTop: 10,
    };

    const p = {
        textAlign: 'center',
        fontFamily: '"IBMPlexSerif", serif',
        fontSize: 16,
        paddingLeft: 10,
        marginBottom: 0,
        marginTop: 0,
    };

    const emailListContainer = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    };

    const emailTable = {
        margin: 20,
        borderCollapse: 'collapse',
        textAlign: 'center',
    };

    const td = {
        border: '1px solid black',
        padding: '8px',
        fontFamily: '"IBMPlexSerif", serif',
    };

    const th = {
        border: '1px solid black',
        padding: '8px',
        fontFamily: '"IBMPlexSerif", serif',
    };

    const dateButtons = {
        fontFamily: "'ChicagoFLF', serif",
        marginTop: 15,
        marginRight: 25,
        marginLeft: 25,
        paddingTop: 3,
        paddingBottom: 3,
        paddingLeft: 25,
        paddingRight: 25,
        borderRadius: 5,
        boxShadow: '3px 3px 0px 0px #1b1b1b',  // Proper CSS shadow syntax
        border: '2px solid #1b1b1b'  // Proper CSS border syntax
    };

    const calendarContainer = {
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    };

    const calendarGrid = {
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '5px',
    };

    const dayButton = {
        padding: '10px',
        cursor: 'pointer',
        textAlign: 'center',
        border: '1px solid #ccc',
        backgroundColor: '#fff',
        borderRadius: 3,
        boxShadow: '3px 3px 0px 0px #1b1b1b',  // Proper CSS shadow syntax
        border: '2px solid #1b1b1b'
    };

    const highlightedDay = {
        backgroundColor: '#1B1B1B', // Light blue
        borderRadius: 3,
        boxShadow: '3px 3px 0px 0px #1b1b1b',  // Proper CSS shadow syntax
        border: '2px solid #FFFFFF'

    };

    const selectedDay = {
        backgroundColor: '#add8e6', // Darker blue
    };

    const monthSelector = {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
    };

    const buttonStyle = {
        fontFamily: "'ChicagoFLF', serif",
        marginTop: 15,
        paddingTop: 3,
        paddingBottom: 3,
        paddingLeft: 125,
        paddingRight: 125,
        borderRadius: 5,
        boxShadow: '3px 3px 0px 0px #1b1b1b',  // Proper CSS shadow syntax
        border: '2px solid #1b1b1b'  // Proper CSS border syntax
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
        setSelectedDate(date.toDateString());
    };

    const handlePreviousMonth = () => {
        setSelectedMonth(prev => prev === 0 ? 11 : prev - 1);
        setSelectedYear(prev => selectedMonth === 0 ? prev - 1 : prev);
    };

    const handleNextMonth = () => {
        setSelectedMonth(prev => prev === 11 ? 0 : prev + 1);
        setSelectedYear(prev => selectedMonth === 11 ? prev + 1 : prev);
    };

    const generateCalendar = () => {
        const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
        const lastDateOfMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

        const daysInMonth = [];
        for (let i = 1; i <= lastDateOfMonth; i++) {
            daysInMonth.push(i);
        }

        const calendarDays = Array(firstDayOfMonth).fill(null).concat(daysInMonth);

        return calendarDays.map((day, index) => {
            if (day === null) {
                return <div key={index} style={{ visibility: 'hidden' }}>0</div>;
            }

            const date = new Date(selectedYear, selectedMonth, day);
            const dateString = date.toDateString();
            const isHighlighted = dates.includes(dateString);
            const isSelected = selectedDate === dateString;

            return (
                <button
                    key={index}
                    style={{
                        ...dayButton,
                        ...(isHighlighted ? highlightedDay : {}),
                        ...(isSelected ? selectedDay : {}),
                    }}
                    onClick={() => handleDateClick(date)}
                >
                    {day}
                </button>
            );
        });
    };

    const filteredEmails = selectedDate ? emails.filter(email => {
        const emailDate = new Date(email.date.seconds * 1000).toDateString();
        return emailDate === selectedDate;
    }) : [];

    return (
        <div style={emailListContainer}>
            <h2 style={h2}>Select the date you'd like to view.</h2>
            <p style={p}>Download the emails as a CSV by selecting the download button in the top right of the calendar.</p>
            <div style={calendarContainer}>
                <div style={monthSelector}>
                    <button style={dateButtons} onClick={handlePreviousMonth}>Previous</button>
                    <h3 style={h2}>{new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                    <button style={dateButtons} onClick={handleNextMonth}>Next</button>
                </div>
                <div style={calendarGrid}>
                    {generateCalendar()}
                </div>
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
