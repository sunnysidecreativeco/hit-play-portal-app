import { useState, useEffect } from 'preact/hooks';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../firebase-config';
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
    const [onAirStatus, setOnAirStatus] = useState(false);
    const [onAirLoading, setOnAirLoading] = useState(true);
    const [creditsEarned, setCreditsEarned] = useState(false);
    const [creditsEarnedLoading, setCreditsEarnedLoading] = useState(true);
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
    const [nowPlaying, setNowPlaying] = useState([]);
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
    

    const B = (props) => <Text style={{color: '#3045bf'}}>{props.children}</Text>;
    const C = (props) => <Text style={{color: '#b33110'}}>{props.children}</Text>;



    useEffect(() => {
        const auth = getAuth();
        const unsubscribeAuth = onAuthStateChanged(auth, user => {
            if (user) {
                // Listener for room data
                const roomDocRef = doc(db, "liveRooms", user.uid);
                const unsubscribeRoomDoc = onSnapshot(roomDocRef, docSnap => {
                    if (docSnap.exists()) {
                        const roomData = docSnap.data();
                        setRoomName(roomData.roomName);
                        setOnAirStatus(roomData.onAir ? "On Air" : "Off Air");
                        setCreditsEarned(roomData.creditsEarned || 0);
                    } else {
                        console.log("No such room document!");
                        setRoomName('');
                        setOnAirStatus('Off Air');
                        setCreditsEarned(0);
                    }
                });

                // Listener for now playing songs
                const nowPlayingRef = collection(db, `liveRooms/${user.uid}/nowPlaying`);
                const unsubscribeNowPlaying = onSnapshot(nowPlayingRef, (querySnapshot) => {
                    const updatedSongs = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setNowPlaying(updatedSongs);
                });

                // Listeners for songs in upNext collection
                const songsRef = collection(db, `liveRooms/${user.uid}/upNext`);
                const unsubscribeSongsPlus = subscribeToSongs(songsRef, 'true', 'true', setSongsSkipPlus);
                const unsubscribeSongsSkip = subscribeToSongs(songsRef, 'true', 'false', setSongsSkip);
                const unsubscribeSongs = subscribeToSongs(songsRef, 'false', 'false', setSongs);

                return () => {
                    unsubscribeRoomDoc();
                    unsubscribeNowPlaying();
                    unsubscribeSongsPlus();
                    unsubscribeSongsSkip();
                    unsubscribeSongs();
                };
            } else {
                setShowModal(true);
                console.log("User is not logged in.");
            }
        });

        return () => unsubscribeAuth();
    }, []);

    const subscribeToSongs = (ref, skip, skipPlus, setState) => {
        const q = query(ref, where('skip', '==', skip), where('skipPlus', '==', skipPlus), orderBy('timeEntered', 'asc'));
        return onSnapshot(q, querySnapshot => {
            const fetchedSongs = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setState(fetchedSongs);
        });
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
            <p>Room Name: {roomName || "No room assigned"}</p>
                <p>Your room is: {onAirStatus || "No status available"}</p>
                <p>Credits this live: {creditsEarned}</p>
                <div>
                    <h2>Now Playing</h2>
                    {nowPlaying.length > 0 ? nowPlaying.map(song => (
                        <div key={song.id} className="song-item">
                            <p>{song.songName} by {song.artistName}</p>
                        </div>
                    )) : <p>No songs currently playing.</p>}

                    <h2>Skip Plus Songs</h2>
                    {songsSkipPlus.map(song => (
                        <div key={song.id} className="song-item">
                            <p>{song.songName} by {song.artistName}</p>
                        </div>
                    ))}
                    {songsSkipPlus.length === 0 && <p>No skip plus songs.</p>}

                    <h2>Skip Songs</h2>
                    {songsSkip.map(song => (
                        <div key={song.id} className="song-item">
                            <p>{song.songName} by {song.artistName}</p>
                        </div>
                    ))}
                    {songsSkip.length === 0 && <p>No skip songs.</p>}

                    <h2>Regular Songs</h2>
                    {songs.map(song => (
                        <div key={song.id} className="song-item">
                            <p>{song.songName} by {song.artistName}</p>
                        </div>
                    ))}
                    {songs.length === 0 && <p>No regular songs queued.</p>}
                </div>
            </div>
        </div>
    );
}

export default LiveRoomComponent;