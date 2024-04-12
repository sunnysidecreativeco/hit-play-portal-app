import { useState, useEffect } from 'preact/hooks';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../firebase-config';
import '../styles/styles.css';
import {
    doc as firestoreDoc,
    doc,
    getDoc,
    addDoc,
    setDoc,
    onSnapshot,
    updateDoc,
    collection,
    getDocs,
    deleteDoc,
    query,
    orderBy,
    where,
    serverTimestamp,
    limit,
} from "firebase/firestore";

function LiveRoomComponent() {
    const [roomName, setRoomName] = useState('');
    const [roomLoading, setRoomLoading] = useState(true); // State for tracking room name loading
    const [showModal, setShowModal] = useState(false);
    const [refresh, setRefresh] = useState(true);
    const [credits, setCredits] = useState("");
    const [songsList, setSongsList] = useState([]);
    const [userId, setUserId] = useState("");
    const [artistName, setArtistName] = useState("");
    const [songName, setSongName] = useState("");
    // const [instagramLink, setInstagramLink] = useState("");
    // const [instagramIcon, setInstagramIcon] = useState(null)
    // const [tiktokLink, setTiktokLink] = useState("");
    // const [tiktokIcon, setTiktokIcon] = useState(null);
    // const [twitchLink, setTwitchLink] = useState("");
    // const [twitchIcon, setTwitchIcon] = useState(null);
    const [roomSkips, setRoomSkips] = useState("");
    const [loginButton, setLoginButton] = useState("");
    const [loginButtonNote, setLoginButtonNote] = useState("");
    const [lineButton, setLineButton] = useState("");
    const [lineButtonNote, setLineButtonNote] = useState("");
    const [yourSongsTitle, setYourSongsTitle] = useState("");
    const [onAirButton, setOnAirButton] = useState("");
    const [songs, setSongs] = useState([]);
    const [songsSkip, setSongsSkip] = useState([]);
    const [songsSkipPlus, setSongsSkipPlus] = useState([]);
    const [nowPlayingControls, setNowPlayingControls] = useState("")
    const [songsInLine, setSongsInLine] = useState(0);
    const [skipStatus, setSkipStatus] = useState(false)
    const [artistIdNow, setArtistIdNow] = useState("");
    const [songFile, setSongFile] = useState("");
    const [songFileName, setSongFileName] = useState("");
    const [songFileNameNow, setSongFileNameNow] = useState("");
    const [songLink, setSongLink] = useState("");
    const [roomId, setRoomId] = useState("");
    const [lineOpen, setLineOpen] = useState(null)
    //const [genres, setGenres] = useState("");
    const [skipRate, setSkipRate] = useState(0);
    const [skipPlusRate, setSkipPlusRate] = useState(0);
    const [trigger, setTrigger] = useState(0);
    const [creditsEarnedText, setCreditsEarnedText] = useState(null);
    const [creditsEarnedLive, setCreditsEarnedLive] = useState(0);
    const [liveControlButton, setLiveControlButton] = useState("");
    const [modal, setModal] = useState('');
    const user = auth.currentUser;

    const B = (props) => <Text style={{color: '#3045bf'}}>{props.children}</Text>;
    const C = (props) => <Text style={{color: '#b33110'}}>{props.children}</Text>;

    const navigation = useNavigation();

    


    useEffect(() => {
        const auth = getAuth();
        const unsubscribeAuth = onAuthStateChanged(auth, user => {
            if (user) {
                // Fetch the room name
                const roomDocRef = doc(db, "liveRooms", user.uid);
                const unsubscribeRoomDoc = onSnapshot(roomDocRef, docSnap => {
                    if (docSnap.exists()) {
                        const roomData = docSnap.data();
                        setRoomName(roomData.roomName);
                        setRoomLoading(false);
                    } else {
                        console.log("No such room document!");
                        setRoomName('');
                        setRoomLoading(false);
                    }
                });

                // Fetch songs by the user's UID
                const songsRef = collection(db, `liveRooms/${user.uid}/upNext`);
                fetchSongs(songsRef, 'true', 'true', setSongsSkipPlus);
                fetchSongs(songsRef, 'true', 'false', setSongsSkip);
                fetchSongs(songsRef, 'false', 'false', setSongs);

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

    const fetchSongs = async (ref, skip, skipPlus, setState) => {
        const q = query(
            ref,
            where('skip', '==', skip),
            where('skipPlus', '==', skipPlus),
            orderBy('timeEntered', 'asc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedSongs = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setState(fetchedSongs);
    };

    function handleModalOk() {
        window.location.href = '/';
    }

    return (
        <div>
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <p>You need to be logged in to access this page.</p>
                        <button onClick={handleModalOk}>OK</button>
                    </div>
                </div>
            )}
            <div>
                <p>Room Name: {roomLoading ? "Loading..." : roomName || "No room assigned"}</p>
                <div>
                    <h2>Skip Plus Songs</h2>
                    {songsSkipPlus.map(song => (
                        <div key={song.id} className="song-item">
                            <p>{song.songName} by {song.artistName}</p>
                            <button onClick={() => console.log('Play song', song.link)}>Play</button>
                        </div>
                    ))}
                    <h2>Skip Songs</h2>
                    {songsSkip.map(song => (
                        <div key={song.id} className="song-item">
                            <p>{song.songName} by {song.artistName}</p>
                            <button onClick={() => console.log('Play song', song.link)}>Play</button>
                        </div>
                    ))}
                    <h2>Regular Songs</h2>
                    {songs.map(song => (
                        <div key={song.id} className="song-item">
                            <p>{song.songName} by {song.artistName}</p>
                            <button onClick={() => console.log('Play song', song.link)}>Play</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default LiveRoomComponent;