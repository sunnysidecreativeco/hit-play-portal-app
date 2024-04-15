import { useState, useEffect, useRef } from 'preact/hooks';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db, auth, storage } from '../../firebase-config';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';
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
    const [onAirStatus, setOnAirStatus] = useState(false);
    const [creditsEarned, setCreditsEarned] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [nowPlaying, setNowPlaying] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(null);
    const [songs, setSongs] = useState([]);
    const [songsSkip, setSongsSkip] = useState([]);
    const [songsSkipPlus, setSongsSkipPlus] = useState([]);

    
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
                const roomDocRef = doc(db, "liveRooms", user.uid);
                onSnapshot(roomDocRef, docSnap => {
                    if (docSnap.exists()) {
                        const roomData = docSnap.data();
                        setRoomName(roomData.roomName);
                        setOnAirStatus(roomData.onAir ? "On Air" : "Off Air");
                        setCreditsEarned(roomData.creditsEarned || 0);
                    } else {
                        console.log("No such room document!");
                    }
                });

                // Fetch songs in each category
                fetchSongs(user.uid, 'upNext', setSongs);
                fetchSongs(user.uid, 'upNextSkip', setSongsSkip);
                fetchSongs(user.uid, 'upNextSkipPlus', setSongsSkipPlus);
                fetchNowPlaying(user.uid);
            } else {
                setShowModal(true);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    function fetchSongs(userId, collectionName, setState) {
        const songsRef = collection(db, `liveRooms/${userId}/${collectionName}`);
        onSnapshot(songsRef, (querySnapshot) => {
            const fetchedSongs = querySnapshot.docs.map(doc => doc.data());
            console.log(`Fetched ${collectionName}:`, fetchedSongs); // Debugging log
            setState(fetchedSongs);
        }, error => console.log(`Error fetching ${collectionName}:`, error));
    }

    function fetchNowPlaying(userId) {
        const nowPlayingRef = collection(db, `liveRooms/${userId}/nowPlaying`);
        onSnapshot(nowPlayingRef, (querySnapshot) => {
            const updatedSongs = querySnapshot.docs.map(doc => doc.data());
            console.log("Now Playing Data:", updatedSongs); // Debugging log
            setNowPlaying(updatedSongs);
            if (updatedSongs.length > 0 && updatedSongs[0].artistId) {
                fetchSongUrl(updatedSongs[0].artistId, updatedSongs[0].songFileName);
            }
        });
    }

    const fetchSongUrl = (artistId, fileName) => {
        const songPath = `songs/${artistId}/${fileName}`;
        const songRef = storageRef(storage, songPath);
        getDownloadURL(songRef)
            .then(url => {
                audioRef.current.src = url;
                audioRef.current.load(); // Load the new audio file
            })
            .catch(error => {
                console.error('Error fetching song file:', error);
            });
    };

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
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
                            <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={() => setIsPlaying(false)} />
                            <div>
                                <button onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
                                <input type="range" min="0" max={duration || 1} value={currentTime} onChange={(e) => {
                                    audioRef.current.currentTime = e.target.value;
                                    setCurrentTime(e.target.value);
                                }} />
                                <div>
                                    <span>{Math.floor(currentTime / 60)}:{('0' + Math.floor(currentTime % 60)).slice(-2)}</span>
                                    <span> / </span>
                                    <span>{Math.floor(duration / 60)}:{('0' + Math.floor(duration % 60)).slice(-2)}</span>
                                </div>
                            </div>
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