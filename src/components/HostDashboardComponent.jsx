import { useState, useEffect } from 'preact/hooks';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { db, storage } from '../../firebase-config';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';
import '../styles/styles.css';

function HostDashboardComponent() {
    const [email, setEmail] = useState('');
    const [roomName, setRoomName] = useState(''); // Added state for roomName
    const [emailLoading, setEmailLoading] = useState(true);
    const [avatarUrl, setAvatarUrl] = useState('');
    const [earnings, setEarnings] = useState(null);
    const [earningsLoading, setEarningsLoading] = useState(true);
    const [earningsTotal, setEarningsTotal] = useState(null);
    const [earningsTotalLoading, setEarningsTotalLoading] = useState(true);
    const [songsReviewedTotal, setSongsReviewedTotal] = useState(null);
    const [songsReviewedLoading, setSongsReviewedLoading] = useState(null);
    const [showModal, setShowModal] = useState(false); // State to control modal visibility

    
    
    const labels = {
        fontFamily: '"IBMPlexSerif", serif',
        textAlign: 'center',
        fontSize: 18,
        marginBottom: -15,
    };
    const labelInfo = {
        fontFamily: '"IBMPlexSerif", serif',
        textAlign: 'center',
        fontSize: 24,
    }
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
    const buttonStyleSignOut = {
        fontFamily: "'ChicagoFLF', serif",
        marginTop: 15,
        paddingTop: 3,
        paddingBottom: 3,
        paddingLeft: 121,
        paddingRight: 121,
        borderRadius: 5,
        boxShadow: '3px 3px 0px 0px #1b1b1b',  // Proper CSS shadow syntax
        border: '2px solid #1b1b1b'  // Proper CSS border syntax
    };
    

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
                        setSongsReviewedTotal(userData.songsReviewed);
                        setSongsReviewedLoading(false);
                        //Get room image
                        const avatarPath = `avatars/${user.uid}/profile-image`;
                        const avatarRef = storageRef(storage, avatarPath);
                        getDownloadURL(avatarRef)
                            .then(url => {
                                setAvatarUrl(url);
                            })
                            .catch(error => {
                                console.error('Error fetching avatar:', error);
                            });
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
                {avatarUrl && <img src={avatarUrl} alt="Host Avatar" 
                    style={{ width: '150px', 
                    height: '150px', 
                    borderRadius: '7%', 
                    boxShadow: '3px 3px 0px 0px #1b1b1b',
                    border: '2px solid #1b1b1b',
                    objectFit: 'cover', 
                    display: 'block', 
                    marginLeft: 'auto', 
                    marginRight: 'auto' }} 
                />}
                <div>
                    <p style={labels}>Show Name:</p> 
                    <p style={labelInfo}>{roomName}</p> {/* Display the room name */}
                </div>
                <div>
                    <p style={labels}>Earnings: ${earnings !== null ? earnings : earningsLoading && <img src="/images/loading.gif" width="20px" alt="Loading..."/>}</p>
                    <p style={labels}>Total Earnings: ${earningsTotal !== null ? earningsTotal : earningsTotalLoading && <img src="/images/loading.gif" width="20px" alt="Loading..."/>}</p>
                    <p style={labels}>Songs Reviewed: {songsReviewedTotal !== null ? songsReviewedTotal : songsReviewedLoading && <img src="/images/loading.gif" width="20px" alt="Loading..."/>}</p>
                </div>
                <div style="margin-top: 20px">
                    <button style={buttonStyle} onClick={handleGoLive}><p>GO LIVE</p></button>
                </div>
            </div>
            <div>
                <button style={buttonStyleSignOut} onClick={handleSignOut}><p>SIGN OUT</p></button>
            </div>
        </div>
    );
}

export default HostDashboardComponent;