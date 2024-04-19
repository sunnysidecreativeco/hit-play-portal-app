import { useState, useEffect, useRef } from 'preact/hooks';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db, storage } from '../../firebase-config';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';
import '../styles/styles.css';
import {
    doc,
    getDoc,
    setDoc,
    onSnapshot,
    updateDoc,
    collection,
    getDocs,
    deleteDoc,
    query,
    orderBy,
    where
} from "firebase/firestore";

function LiveRoomComponent() {
    const [roomName, setRoomName] = useState('');
    const [onAirStatus, setOnAirStatus] = useState(false);
    const [lineOpenStatus, setLineOpenStatus] = useState(false);
    const [creditsEarned, setCreditsEarned] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [nowPlaying, setNowPlaying] = useState([]);
    const [songsSkip, setSongsSkip] = useState([]);
    const [songsSkipPlus, setSongsSkipPlus] = useState([]);
    const [regularSongs, setRegularSongs] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [avatarUrl, setAvatarUrl] = useState('');
    const [songLink, setSongLink] = useState('');

    const audioRef = useRef(null);
    // Additional states that might be used or shown in the UI
    const [credits, setCredits] = useState("");
    const [userId, setUserId] = useState("");
    const [artistName, setArtistName] = useState("");
    const [songName, setSongName] = useState("");
    const [roomSkips, setRoomSkips] = useState("");
    const [loginButton, setLoginButton] = useState("");
    const [loginButtonNote, setLoginButtonNote] = useState("");
    const [lineButton, setLineButton] = useState("");
    const [lineButtonNote, setLineButtonNote] = useState("");
    const [yourSongsTitle, setYourSongsTitle] = useState("");
    const [onAirButton, setOnAirButton] = useState("");
    const [nowPlayingControls, setNowPlayingControls] = useState("");
    const [songsInLine, setSongsInLine] = useState(0);
    const [skipStatus, setSkipStatus] = useState(false);
    const [artistIdNow, setArtistIdNow] = useState("");
    const [songFile, setSongFile] = useState("");
    const [songFileName, setSongFileName] = useState("");
    const [songFileNameNow, setSongFileNameNow] = useState("");
    const [roomId, setRoomId] = useState("");
    const [skipRate, setSkipRate] = useState(0);
    const [skipPlusRate, setSkipPlusRate] = useState(0);
    const [trigger, setTrigger] = useState(0);
    const [creditsEarnedText, setCreditsEarnedText] = useState("");
    const [creditsEarnedLive, setCreditsEarnedLive] = useState(0);
    const [liveControlButton, setLiveControlButton] = useState("");
    const [modal, setModal] = useState("");

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, user => {
            if (user) {
                const avatarPath = `avatars/${user.uid}/profile-image`;
                const avatarRef = storageRef(storage, avatarPath);
                getDownloadURL(avatarRef)
                    .then(url => {
                        setAvatarUrl(url);
                    })
                    .catch(error => {
                        console.error('Error fetching avatar:', error);
                    });

                const roomDocRef = doc(db, "liveRooms", user.uid);
                onSnapshot(roomDocRef, docSnap => {
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

                const nowPlayingRef = collection(db, `liveRooms/${user.uid}/nowPlaying`);
                onSnapshot(nowPlayingRef, snapshot => {
                    setNowPlaying(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                });

                const songsRef = collection(db, `liveRooms/${user.uid}/upNext`);
                onSnapshot(songsRef, snapshot => {
                    const allSongs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setSongsSkip(allSongs.filter(song => song.skip && !song.skipPlus));
                    setSongsSkipPlus(allSongs.filter(song => song.skip && song.skipPlus));
                    setRegularSongs(allSongs.filter(song => !song.skip));
                    setSongsInLine(snapshot.size);
                });
            } else {
                setShowModal(true);
                console.log("User is not logged in.");
            }
        });
    }, []);

    const fetchSongUrl = (artistId, fileName) => {
        const songPath = `songs/${artistId}/${fileName}`;
        const songRef = storageRef(storage, songPath);
        getDownloadURL(songRef)
            .then(url => {
                audioRef.current.src = url;
                audioRef.current.load();
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
            const currentSongsSnapshot = await getDocs(nowPlayingRef);
            currentSongsSnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });

            const roomDoc = await getDoc(roomDocRef);
            const userRef = doc(db, `users/${userUid}`);
            const userDoc = await getDoc(userRef);

            if (!roomDoc.exists() || !userDoc.exists()) {
                console.log("Necessary data not found");
                return;
            }

            const skipRate = roomDoc.data().skipRate || 0;
            const ratePerRound = (userDoc.data().ratePerRound || 0) * 0.01;

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
                await setDoc(doc(db, `liveRooms/${userUid}/nowPlaying`, songId), songToMove);
                await deleteDoc(doc(db, `liveRooms/${userUid}/upNext`, songId));

                const newCreditsEarned = (roomDoc.data().creditsEarned || 0) + creditsToAdd;
                await updateDoc(roomDocRef, {
                    creditsEarned: newCreditsEarned
                });

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
                lineOpen: !lineOpenStatus
            });
            setLineOpenStatus(!lineOpenStatus);
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
            await updateDoc(roomDocRef, { onAir: false, creditsEarned: 0 });

            const roomDoc = await getDoc(roomDocRef);
            if (!roomDoc.exists()) {
                console.log("Room data not found");
                return;
            }
            const skipRate = roomDoc.data().skipRate;
            const skipPlusRate = skipRate * 2;

            const entriesSnapshot = await getDocs(upNextRef);
            entriesSnapshot.forEach(async (entryDoc) => {
                const entry = entryDoc.data();
                let creditsToAdd = 0;
                if (entry.skip === "true") {
                    creditsToAdd = entry.skipPlus === "true" ? skipPlusRate : skipRate;
                }

                if (creditsToAdd > 0) {
                    const userRef = doc(db, `users/${entry.artistId}`);
                    const userDoc = await getDoc(userRef);
                    if (userDoc.exists()) {
                        const currentCredits = userDoc.data().credits || 0;
                        const newCredits = currentCredits + creditsToAdd;
                        await updateDoc(userRef, { credits: newCredits });
                    } else {
                        console.log("User document does not exist:", entry.artistId);
                    }
                }

                await deleteDoc(entryDoc.ref);
            });

            console.log("Go Off Air function completed.");
            window.location.href = '/dashboard';
        } catch (error) {
            console.error("Failed to go off air:", error);
        }
    };

    const handleModalOk = () => {
        window.location.href = '/';
    };

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
                {avatarUrl && <img src={avatarUrl} alt="Host Avatar" style={{ width: '100px', height: '100px', borderRadius: '50%', boxShadow: '3px 3px 0px 0px #1b1b1b', border: '2px solid #1b1b1b', margin: '20px auto', display: 'block' }} />}
                <p>Room Name: {roomName || "No room assigned"}</p>
                <p>Your room is: {onAirStatus || "No status available"}</p>
                <p>Your line is: {lineOpenStatus ? "Open" : "Closed"}</p>
                <p>Songs in the queue: {songsInLine}</p>
                <p>Credits this live: {creditsEarned}</p>
                <button className="standardGreenButton" onClick={moveNextSongToNowPlaying}>NEXT SONG</button>
                <div>
                    <h2>Now Playing</h2>
                    {nowPlaying.map(song => (
                        <div key={song.id} className="song-item">
                            <p>{song.songName} by {song.artistName}</p>
                            {song.link && <a href={song.link} target="_blank" rel="noopener noreferrer"><img src="../../images/Spotify-Icon-1.0.png" alt="Spotify Link" style={{ width: '24px', height: '24px' }} /></a>}
                            <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={() => setIsPlaying(false)}>
                                <source src={song.songLink} type="audio/mpeg" />
                            </audio>
                            <div>
                                <button onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
                                <input type="range" min="0" max={duration || 1} value={currentTime} onChange={(e) => setCurrentTime(e.target.value)} />
                                <div>{Math.floor(currentTime / 60)}:{('0' + Math.floor(currentTime % 60)).slice(-2)} / {Math.floor(duration / 60)}:{('0' + Math.floor(duration % 60)).slice(-2)}</div>
                            </div>
                        </div>
                    ))}
                    <h2>Skip Plus Songs</h2>
                    {songsSkipPlus.map(song => (
                        <div key={song.id} className="song-item">
                            <p>{song.songName} by {song.artistName}</p>
                            {song.link && <a href={song.link} target="_blank" rel="noopener noreferrer"><img src="../../images/Spotify-Icon-1.0.png" alt="Spotify Link" style={{ width: '24px', height: '24px' }} /></a>}
                        </div>
                    ))}
                    <h2>Skip Songs</h2>
                    {songsSkip.map(song => (
                        <div key={song.id} className="song-item">
                            <p>{song.songName} by {song.artistName}</p>
                            {song.link && <a href={song.link} target="_blank" rel="noopener noreferrer"><img src="../../images/Spotify-Icon-1.0.png" alt="Spotify Link" style={{ width: '24px', height: '24px' }} /></a>}
                        </div>
                    ))}
                    <h2>Regular Songs</h2>
                    {regularSongs.map(song => (
                        <div key={song.id} className="song-item">
                            <p>{song.songName} by {song.artistName}</p>
                            {song.link && <a href={song.link} target="_blank" rel="noopener noreferrer"><img src="../../images/Spotify-Icon-1.0.png" alt="Spotify Link" style={{ width: '24px', height: '24px' }} /></a>}
                        </div>
                    ))}
                    <div>
                        <button onClick={toggleLineStatus} className="standardGreenButton">Toggle Line</button>
                    </div>
                    <div>
                        <button onClick={goOffAir} className="standardGreenButton">Go Off Air</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LiveRoomComponent;