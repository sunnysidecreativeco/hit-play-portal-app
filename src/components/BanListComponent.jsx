import { useState, useEffect } from 'preact/hooks';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../firebase-config';
import { doc, getDoc, collection, query, orderBy, getDocs, deleteDoc } from "firebase/firestore";
import '../styles/styles.css';

function BanListComponent() {
    const [bannedUsers, setBannedUsers] = useState([]);
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
        boxShadow: '3px 3px 0px 0px #1b1b1b',
        border: '2px solid #1b1b1b',
        width: '30%',
    };

    const td = {
        padding: '8px',
        fontFamily: '"IBMPlexSerif", serif',
        textAlign: 'left',
        borderBottom: '2px solid #1b1b1b',
    };

    const trash = {
        width: 30,
        cursor: 'pointer',
    };

    const dashboardButtonStyle = {
        fontFamily: "'ChicagoFLF', serif",
        marginTop: 5,
        marginBottom: 5,
        marginRight: 25,
        marginLeft: 25,
        paddingTop: 3,
        paddingBottom: 3,
        height: 40,
        paddingLeft: 25,
        paddingRight: 25,
        borderRadius: 5,
        boxShadow: '3px 3px 0px 0px #1b1b1b',
        border: '2px solid #1b1b1b',
        position: 'absolute',
        top: '20px',
        left: '0px',
    };

    useEffect(() => {
        const authInstance = getAuth();

        const unsubscribeAuth = onAuthStateChanged(authInstance, user => {
            if (user) {
                const fetchBannedUsers = async () => {
                    try {
                        const bansCollectionRef = collection(db, "liveRooms", user.uid, "bans");
                        const bansQuery = query(bansCollectionRef, orderBy("timeBanned", "desc"));
                        const bansDocsSnap = await getDocs(bansQuery);

                        const bansData = bansDocsSnap.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }));
                        setBannedUsers(bansData);
                    } catch (error) {
                        console.error("Error fetching banned users:", error);
                    }
                };

                fetchBannedUsers();
            } else {
                setShowModal(true); // Show modal if not logged in
            }
        });

        return () => {
            unsubscribeAuth();
        };
    }, []);

    const handleRemoveBan = async (userId) => {
        const authInstance = getAuth();
        const user = authInstance.currentUser;
        if (user) {
            try {
                const userBanDocRef = doc(db, "liveRooms", user.uid, "bans", userId);
                await deleteDoc(userBanDocRef);
                setBannedUsers(prev => prev.filter(user => user.id !== userId));
            } catch (error) {
                console.error("Error removing ban:", error);
            }
        }
    };

    return (
        <div style={emailListContainer}>
            <button style={dashboardButtonStyle} onClick={() => window.location.href = '/dashboard'}>Dashboard</button> {/* Dashboard Button */}
            <h2 style={h2}>Ban List</h2>
            <p style={p}>You can remove users from the ban list by using the trash can to the right of their name.</p>
            
            {showModal && (
                <div className="modal">
                    <p>Please log in to view the content.</p>
                </div>
            )}

            {!showModal && (
                <table style={emailTable}>
                    <tbody>
                        {bannedUsers.map(user => (
                            <tr key={user.id}>
                                <td style={td}>
                                    <div>{user.artistName}</div>
                                    <div>{user.email}</div>
                                    <div>{new Date(user.timeBanned.seconds * 1000).toLocaleString()}</div>
                                </td>
                                <td style={{ ...td, textAlign: 'center' }}>
                                    <img 
                                        src="../../images/Trash-Icon-1.0.png" 
                                        alt="Remove Ban" 
                                        style={trash}
                                        onClick={() => handleRemoveBan(user.id)} 
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default BanListComponent;
