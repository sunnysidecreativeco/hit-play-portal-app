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
    const [lineOpenStatus, setLineOpenStatus] = useState(false);
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
    const [avatarUrl, setAvatarUrl] = useState('');

    
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
    //const [lineOpen, setLineOpen] = useState(null)
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


    //Styles
    const buttonStyle = {
        fontFamily: "'ChicagoFLF', serif",
        marginTop: '15px',
        paddingTop: '3px',
        paddingBottom: '3px',
        paddingLeft: '125px',
        paddingRight: '125px',
        borderRadius: '5px',
        boxShadow: '3px 3px 0px 0px #1b1b1b',  
        border: '2px solid #1b1b1b' 
    };
    
    const avatarContainer = {
        float: 'left', 
    };
    
    const avatar = {
        display: 'inline-block', 
        verticalAlign: 'middle',
        paddingLeft: 50,
        paddingTop: 20,
    };
    
    const roomNameContainer = {
        verticalAlign: 'middle', 
        display: 'inline-block', 
        marginLeft: '20px',
        width: 150,
        textAlign: 'left',
    };

    const roomNameText = {
        fontFamily: '"IBMPlexSerif", serif',
        fontSize: 18,
    };



    useEffect(() => {
        const auth = getAuth();
        const unsubscribeAuth = onAuthStateChanged(auth, user => {
            if (user) {
                // Fetch user's avatar from Firebase Storage
                const avatarPath = `avatars/${user.uid}/profile-image`;
                const avatarRef = storageRef(storage, avatarPath);
                getDownloadURL(avatarRef)
                    .then(url => {
                        setAvatarUrl(url);
                    })
                    .catch(error => {
                        console.error('Error fetching avatar:', error);
                    });

                // Listener for room data
                const roomDocRef = doc(db, "liveRooms", user.uid);
                const unsubscribeRoomDoc = onSnapshot(roomDocRef, docSnap => {
                    if (docSnap.exists()) {
                        const roomData = docSnap.data();
                        setRoomName(roomData.roomName);
                        setOnAirStatus(roomData.onAir ? "On Air" : "Off Air");
                        setLineOpenStatus(roomData.lineOpen);
                        setCreditsEarned(roomData.creditsEarned || 0);
                    } else {
                        console.log("No such room document!");
                        setRoomName('');
                        setOnAirStatus('Off Air');
                        setLineOpenStatus(false);
                        setCreditsEarned(0);
                    }
                });
    
                // Listener for now playing songs
                const nowPlayingRef = collection(db, `liveRooms/${user.uid}/nowPlaying`);
                const unsubscribeNowPlaying = onSnapshot(nowPlayingRef, (querySnapshot) => {
                    const updatedSongs = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        // Added Spotify link to nowPlaying songs
                        songLink: doc.data().link || "" // Ensure links are handled correctly
                    }));
                    setNowPlaying(updatedSongs);
                    if (updatedSongs.length > 0 && updatedSongs[0].artistId) {
                        fetchSongUrl(updatedSongs[0].artistId, updatedSongs[0].songFileName);
                    }
                });
    
                // Fetch other songs
                const songsRef = collection(db, `liveRooms/${user.uid}/upNext`);
                const unsubscribeSongsPlus = subscribeToSongs(songsRef, 'true', 'true', setSongsSkipPlus);
                const unsubscribeSongsSkip = subscribeToSongs(songsRef, 'true', 'false', setSongsSkip);
                const unsubscribeSongs = subscribeToSongs(songsRef, 'false', 'false', setSongs);
    
                // Real-time update of total songs in upNext
                const unsubscribeUpNext = onSnapshot(songsRef, (querySnapshot) => {
                    setSongsInLine(querySnapshot.size); // Update the total count of songs in upNext in real-time
                });
    
                return () => {
                    unsubscribeRoomDoc();
                    unsubscribeNowPlaying();
                    unsubscribeSongsPlus();
                    unsubscribeSongsSkip();
                    unsubscribeSongs();
                    unsubscribeUpNext(); // Make sure to unsubscribe from this listener as well
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
                ...doc.data(),
                // Added Spotify link to upNext songs
                songLink: doc.data().link || "" // Ensure links are handled correctly
            }));
            setState(fetchedSongs);
        });
    };

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

    const moveNextSongToNowPlaying = async () => {
        const userUid = getAuth().currentUser?.uid;
        if (!userUid) {
            console.log("User not authenticated");
            return;
        }
    
        const roomDocRef = doc(db, `liveRooms/${userUid}`);
        const upNextRef = collection(db, `liveRooms/${userUid}/upNext`);
        const nowPlayingRef = collection(db, `liveRooms/${userUid}/nowPlaying`);
    
        try {
            // Clear the nowPlaying collection first
            const currentSongsSnapshot = await getDocs(nowPlayingRef);
            currentSongsSnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });
    
            // Fetch the current skip rate and user data
            const roomDoc = await getDoc(roomDocRef);
            const userRef = doc(db, `users/${userUid}`);
            const userDoc = await getDoc(userRef);
    
            if (!roomDoc.exists() || !userDoc.exists()) {
                console.log("Necessary data not found");
                return;
            }
    
            const skipRate = roomDoc.data().skipRate || 0;
            const ratePerRound = (userDoc.data().ratePerRound || 0) * 0.01;  // Convert to percentage
    
            // Determine which song to move based on priority
            const queries = [
                query(upNextRef, where("skipPlus", "==", "true"), orderBy("timeEntered", "asc")),
                query(upNextRef, where("skip", "==", "true"), where("skipPlus", "==", "false"), orderBy("timeEntered", "asc")),
                query(upNextRef, orderBy("timeEntered", "asc"))
            ];
    
            let songToMove, songId, creditsToAdd = 0;
    
            for (const queryRef of queries) {
                const snapshot = await getDocs(queryRef);
                if (!snapshot.empty) {
                    songToMove = snapshot.docs[0].data();
                    songId = snapshot.docs[0].id;
                    creditsToAdd = songToMove.skip === "true" ? (songToMove.skipPlus === "true" ? 2 * skipRate : skipRate) : 0;
                    break;
                }
            }
    
            if (songToMove && songId) {
                // Add to nowPlaying and remove from upNext
                await setDoc(doc(db, `liveRooms/${userUid}/nowPlaying`, songId), songToMove);
                await deleteDoc(doc(db, `liveRooms/${userUid}/upNext`, songId));
    
                // Calculate new creditsEarned for liveRoom
                const newCreditsEarned = (roomDoc.data().creditsEarned || 0) + creditsToAdd;
                await updateDoc(roomDocRef, {
                    creditsEarned: newCreditsEarned
                });
    
                // Update user document with new credits and earnings
                const additionalEarnings = creditsToAdd * ratePerRound;
                const newEarnings = (userDoc.data().earnings || 0) + additionalEarnings;
                const newEarningsTotal = (userDoc.data().earningsTotal || 0) + additionalEarnings;
                const newCreditsEarnedUser = (userDoc.data().creditsEarned || 0) + creditsToAdd;
                const newSongsReviewed = (userDoc.data().songsReviewed || 0) + 1;
    
                await updateDoc(userRef, {
                    creditsEarned: newCreditsEarnedUser,
                    earnings: newEarnings,
                    earningsTotal: newEarningsTotal,
                    songsReviewed: newSongsReviewed
                });
    
                console.log("Moved song to nowPlaying and updated user stats:", songToMove);
            } else {
                console.log("No songs available to move to nowPlaying");
            }
        } catch (error) {
            console.error("Failed to move next song to nowPlaying:", error);
        }
    };

    const toggleLineStatus = async () => {
        const userUid = getAuth().currentUser?.uid;
        if (!userUid) {
            console.error("User not authenticated");
            return;
        }
        const roomDocRef = doc(db, `liveRooms/${userUid}`);
        try {
            await updateDoc(roomDocRef, {
                lineOpen: !lineOpenStatus // Toggle the current Firestore state based on UI state
            });
            setLineOpenStatus(!lineOpenStatus); // Toggle UI state
        } catch (error) {
            console.error("Failed to toggle line status:", error);
        }
    };

    const goOffAir = async () => {
        const userUid = getAuth().currentUser?.uid;
        if (!userUid) {
            console.log("User not authenticated");
            return;
        }
    
        const roomDocRef = doc(db, `liveRooms/${userUid}`);
        const upNextRef = collection(db, `liveRooms/${userUid}/upNext`);
    
        try {
            // Update the onAir status and reset creditsEarned to zero
            await updateDoc(roomDocRef, { onAir: false, creditsEarned: 0 });
    
            // Retrieve the current rates from the room document
            const roomDoc = await getDoc(roomDocRef);
            if (!roomDoc.exists()) {
                console.log("Room data not found");
                return;
            }
            const skipRate = roomDoc.data().skipRate;
            const skipPlusRate = skipRate * 2; // Assuming skipPlusRate is always double the skipRate
    
            // Process each upNext entry to refund credits if necessary
            const entriesSnapshot = await getDocs(upNextRef);
            entriesSnapshot.forEach(async (entryDoc) => {
                const entry = entryDoc.data();
                let creditsToAdd = 0;
                if (entry.skip === "true") {
                    creditsToAdd = entry.skipPlus === "true" ? skipPlusRate : skipRate;
                }
    
                if (creditsToAdd > 0) {
                    const userRef = doc(db, `users/${entry.artistId}`);
                    // Fetch current user credits
                    const userDoc = await getDoc(userRef);
                    if (userDoc.exists()) {
                        const currentCredits = userDoc.data().credits || 0;
                        const newCredits = currentCredits + creditsToAdd;
                        await updateDoc(userRef, { credits: newCredits });
                    } else {
                        console.log("User document does not exist:", entry.artistId);
                    }
                }
    
                // Delete the entry from upNext after processing
                await deleteDoc(entryDoc.ref);
            });
    
            console.log("Go Off Air function completed.");
            // Redirect to dashboard after processing
            window.location.href = '/dashboard';
        } catch (error) {
            console.error("Failed to go off air:", error);
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
                <div style={avatarContainer}>
                    <div style={avatar}>
                        {avatarUrl && <img src={avatarUrl} alt="Host Avatar" 
                            style={{ 
                                width: '100px', 
                                height: '100px', 
                                borderRadius: '7%', 
                                boxShadow: '3px 3px 0px 0px #1b1b1b',
                                border: '2px solid #1b1b1b',
                                margin: '20px auto', 
                                display: 'block' 
                                }} 
                        />}
                    </div>
                    <div style={roomNameContainer}>
                        <p style={roomNameText}>{roomName || "No room assigned"}</p>
                    </div>
                </div>

                <header class="headercontainer">
                    <img src="../../images/Hit-Play-Logo-1.0.png" width="350px" alt="" />
                </header>

                <p>Room Name: {roomName || "No room assigned"}</p>
                <p>Your room is: {onAirStatus || "No status available"}</p>
                <p>Your line is: {lineOpenStatus ? "Open" : "Closed"}</p>
                <p>Songs in the queue: {songsInLine}</p>
                <p>Credits this live: {creditsEarned}</p>
                <button style="margin-bottom: 15px;" class="standardGreenButton" onClick={moveNextSongToNowPlaying}><p>NEXT SONG</p></button>
                <div>
                    <h2>Now Playing</h2>
                    {nowPlaying.length > 0 ? nowPlaying.map(song => (
                        <div key={song.id} className="song-item">
                            <p>{song.songName} by {song.artistName}</p>
                            {song.songLink && ( // Comment: Displaying Spotify link
                                    <a href={song.songLink} target="_blank" rel="noopener noreferrer">
                                        <img src="../../images/Spotify-Icon-1.0.png" alt="Spotify" style={{ width: '24px', height: '24px', marginLeft: '10px' }} />
                                    </a>
                                )}
                            <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={() => setIsPlaying(false)} />
                            <div>
                                <button onClick={togglePlay} style={{ border: 'none', background: 'none', padding: 0 }}>
                                    {isPlaying 
                                        ? <img src="../../images/Pause-Icon-1.0.png" alt="Pause" style={{ width: '25px', height: '25px' }} />
                                        : <img src="../../images/Play-Icon-1.0.png" alt="Play" style={{ width: '25px', height: '25px' }} />
                                    }
                                </button>
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
                            {song.songLink && ( // Comment: Displaying Spotify link
                                <a href={song.songLink} target="_blank" rel="noopener noreferrer">
                                    <img src="../../images/Spotify-Icon-1.0.png" alt="Spotify" style={{ width: '24px', height: '24px', marginLeft: '10px' }} />
                                </a>
                            )}
                        </div>
                    ))}
                    {songsSkipPlus.length === 0 && <p>No skip plus songs.</p>}

                    <h2>Skip Songs</h2>
                    {songsSkip.map(song => (
                        <div key={song.id} className="song-item">
                            <p>{song.songName} by {song.artistName}</p>
                            {song.songLink && ( // Comment: Displaying Spotify link
                                <a href={song.songLink} target="_blank" rel="noopener noreferrer">
                                    <img src="../../images/Spotify-Icon-1.0.png" alt="Spotify" style={{ width: '24px', height: '24px', marginLeft: '10px' }} />
                                </a>
                            )}
                        </div>
                    ))}
                    {songsSkip.length === 0 && <p>No skip songs.</p>}

                    <h2>Regular Songs</h2>
                    {songs.map(song => (
                        <div key={song.id} className="song-item">
                            <p>{song.songName} by {song.artistName}</p>
                            {song.songLink && ( // Comment: Displaying Spotify link
                                <a href={song.songLink} target="_blank" rel="noopener noreferrer">
                                    <img src="../../images/Spotify-Icon-1.0.png" alt="Spotify" style={{ width: '24px', height: '24px', marginLeft: '10px' }} />
                                </a>
                            )}
                        </div>
                    ))}
                    {songs.length === 0 && <p>No regular songs queued.</p>}


                    <div>
                        <button onClick={toggleLineStatus} style={buttonStyle}>
                            {lineOpenStatus ? "Close the Line" : "Open the Line"}
                        </button>
                    </div>
                    
                    <div>
                        <button style={buttonStyle} className="standardGreenButton" onClick={goOffAir}>
                            Go Off Air
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default LiveRoomComponent;