import { useState, useEffect, useRef } from 'preact/hooks';
import { AuthErrorCodes, getAuth, onAuthStateChanged } from 'firebase/auth';
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

function MirrorShowComponent() {
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
    const h2 = {
        fontFamily: "'ChicagoFLF', serif",
        fontSize: 32,
        marginTop: 10,
        marginBottom: 10,
    };

    const h3 = {
        fontFamily: "'ChicagoFLF', serif",
        fontSize: 32,
        textAlign: 'left',
        marginBottom: 5,
        marginTop: 0,
    };

    const h3SkipPlus = {
        fontFamily: "'ChicagoFLF', serif",
        fontSize: 32,
        textAlign: 'left',
        marginBottom: 5,
        marginTop: 0,
    };

    const buttonStyleCloseLine = {
        fontFamily: "'ChicagoFLF', serif",
        fontSize: '18px',
        backgroundColor: '#ffffff', 
        marginTop: '15px',
        paddingTop: '13px',
        paddingBottom: '13px',
        paddingLeft: '90px',
        paddingRight: '90px',
        borderRadius: '5px',
        boxShadow: '3px 3px 0px 0px #1b1b1b',  
        border: '2px solid #1b1b1b' 
    };

    const buttonStyleOffAir = {
        fontFamily: "'ChicagoFLF', serif",
        fontSize: '18px',
        backgroundColor: '#ffffff', 
        marginTop: '15px',
        paddingTop: '13px',
        paddingBottom: '13px',
        paddingLeft: '90px',
        paddingRight: '90px',
        borderRadius: '5px',
        boxShadow: '3px 3px 0px 0px #1b1b1b',  
        border: '2px solid #1b1b1b' 
    };
    
    const avatarContainer = {
        textAlign: 'center',
    };
    
    const avatar = {
        display: 'block', 
        //verticalAlign: 'middle',
        //paddingLeft: 50,
        //paddingTop: 20,
    };

    const mirrorContainer = {
        float: 'right',
        paddingRight: 50,
        paddingTop: 20
    }; 

    const mirrorButton = {
        borderRadius: 7,
        border: '2px solid #1b1b1b',
        boxShadow: '3px 3px 0px 0px #1b1b1b', 
    };
    
    const roomNameContainer = {
        //verticalAlign: 'middle', 
        display: 'block', 
        //marginLeft: '20px',
        //width: 150,
        textAlign: 'center',
    };

    const roomNameText = {
        fontFamily: '"IBMPlexSerif", serif',
        fontSize: 24,
    };

    const artistContainer = {

    };

    const artistNameContainer = {
        display: 'inline-block',
        // textAlign: 'left',
        verticalAlign: 'middle',
        // paddingRight: 25,
    };

    const artistNameText = {
        fontFamily: '"IBMPlexSerif", serif',
        fontSize: 26,
        display: 'inline-block',
        marginTop: '0px',
        textAlign: 'center',
    };

    const songNameText = {
        fontFamily: '"IBMPlexSerif", serif',
        fontSize: 30,
        marginTop: '10px',
        marginBottom: '0px',
        textAlign: 'center',
    };

    const artistNameTextList = {
        fontFamily: '"IBMPlexSerif", serif',
        fontSize: 20,
        display: 'inline-block',
        marginTop: '0px',
        marginBottom: '0px',
        textAlign: 'left',
    };

    const songNameTextList = {
        fontFamily: '"IBMPlexSerif", serif',
        fontSize: 26,
        marginTop: '0px',
        marginBottom: '0px',
        textAlign: 'left',
    };

    const playButton = {
        marginBottom: -10,
        marginRight: 10,
        display: 'inline-block',
    };

    const inputRange = {
        display: 'inline-block',
    };

    const songDuration = {
        display: 'inline-block',
        paddingLeft: 10,
        fontFamily: '"IBMPlexSerif", serif',
        fontSize: 28,
    };

    const spotifyButton = {
        display: 'inline-block',
        verticalAlign: 'middle',
    };

    const spotifyIcon = {
        width: '35px', 
        height: '35px', 
        marginLeft: '10px',
        verticalAlign: 'middle',
    };

    const nextSongContainer = {
        marginBottom: 15,
    };

    const nextSongButton = {
        fontFamily: "'ChicagoFLF', serif",
        fontSize: '18px',
        backgroundColor: '#ffffff', 
        marginTop: '40px',
        paddingTop: '13px',
        paddingBottom: '13px',
        paddingLeft: '90px',
        paddingRight: '90px',
        borderRadius: '5px',
        boxShadow: '3px 3px 0px 0px #1b1b1b',  
        border: '2px solid #1b1b1b' 
    };
    
    const topColumns = {
        display: 'flex',          // Use flexbox to position children
        justifyContent: 'center', // Centers the flex container's children
        alignItems: 'flex-start', // Align items to the start of the container, keeping them top-aligned
        gap: '50px',              // Gap between the child elements
        padding: '0 10%', 
        marginTop: 50,
        marginBottom: 25,
    };

    const bottomColumns = {
        display: 'flex',          // Use flexbox to position children
        justifyContent: 'center', // Centers the flex container's children
        alignItems: 'flex-start', // Align items to the start of the container, keeping them top-aligned
        gap: '50px',              // Gap between the child elements
        //padding: '0 10%', 
        marginTop: 75,
        maxWidth: 1450,
        margin: 'auto',
    };

    const songsInLineStyle = {
        textAlign: 'right',
        maxWidth: 1190,
        margin: 'auto',
        marginBottom: '-60px',
        fontFamily: '"IBMPlexSerif", serif',
        fontSize: 18,
        paddingBottom: 3,
    };

    const skipCostStyle = {
        textAlign: 'left',
        maxWidth: 1185,
        margin: 'auto',
        fontFamily: '"IBMPlexSerif", serif',
        fontSize: 18,
        paddingBottom: 3,
    };

    // Style for each child div to take equal width
    const childStyle = {
        flex: '0 0 20%',  
        minWidth: '0',
    };

    const childStyle2 = {
        flex: '0 0 25%',  
        minWidth: '0',
    };

    // Styles for the table
    const tableStyle = {
        border: '3px solid #1b1b1b',
        borderRadius: '20px',
        boxShadow: '3px 3px 0px 0px #1b1b1b',
        width: '100%', // Adjust the width as necessary
        borderCollapse: 'collapse', // This ensures that the border is consistent around all cells
        overflow: 'hidden', // Keeps the border radius on the table itself
        marginBottom: '20px', // Space below the table, adjust as needed
    };

    // Styles for the table rows
    const rowStyle = {
        borderBottom: '3px solid #1b1b1b', // Separates rows by a line
    };

    // Styles for the table data cells
    const cellStyle = {
        padding: '10px', // Adjust the padding as necessary
        fontFamily: '"IBMPlexSerif", serif',
        fontSize: 16,
    };

    const cellText = {
        textAlign: 'left',
        padding: '10px',
        fontFamily: '"IBMPlexSerif", serif',
        fontSize: 16,
        borderRight: '3px solid #1b1b1b',
    };

    const songList = {
        border: '3px solid #1b1b1b',  
        boxShadow: '3px 3px 0px 0px #1b1b1b',  
        maxHeight: '500px',  
        overflowY: 'auto',  
        padding: '10px',  
        borderRadius: '15px',
        textAlign: 'left'
    };

    const artistNameContainerList = {
        flex: '0 0 85%',
        display: 'inline-block',
        textAlign: 'left',
        verticalAlign: 'middle',
        paddingRight: 25,
        paddingBottom: 10,
    };

    const spotifyButtonList = {
        display: 'inline-block',
        verticalAlign: 'middle',
        textAlign: 'right',
    };

    const downloadContainer = {
        left: 0,
        bottom: 0,
        position: 'fixed',
        width: '200px',
    };

    const downloadImage = { 
        width: '100%',
        height: 'auto',
    };

    const noSongsStyle = {
        fontFamily: '"IBMPlexSerif", serif',
        fontSize: 18,
    }
    



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
                        const skipPlusRateTemp = roomData.skipRate;
                        const skipPlusRateVar = skipPlusRateTemp * 2;
                        console.log('the skip plus rate is', skipPlusRateVar);
                        setRoomName(roomData.roomName);
                        setOnAirStatus(roomData.onAir ? "On Air" : "Off Air");
                        setLineOpenStatus(roomData.lineOpen);
                        setCreditsEarned(roomData.creditsEarned || 0);
                        setSkipRate(roomData.skipRate)
                        setSkipPlusRate(skipPlusRateVar);
                        
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

    

    function handleModalOk() {
        window.location.href = '/';
    }

    function goToMirro() {
        window.location.href = '/mirrorshow';
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
                <div style={topColumns}>
                    <div style={{...childStyle, ...avatarContainer}}>
                        <div style={avatar}>
                            {avatarUrl && <img src={avatarUrl} alt="Host Avatar" 
                                style={{ 
                                    width: '150px', 
                                    height: '150px', 
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


                    <div style={childStyle}>
                        <div style="text-align: center; padding-top: 50px">
                            <h2 style={h2}>Now Playing</h2>
                        </div>


                        <div>
                            {nowPlaying.length > 0 ? nowPlaying.map(song => (
                                    <div key={song.id} className="song-item">

                                        <div style={artistContainer}>
                                            <div style={artistNameContainer}>
                                                <p style={songNameText}>{song.songName}</p> 
                                                <p style={artistNameText}>{song.artistName}</p>
                                            </div>
                                        </div>


                                        
                                    </div>
                                )) : <p style={noSongsStyle}>No songs currently playing.</p>}
                        </div>
                    </div>
                </div>


                <div style="paddingRight: 200px;">
                    <p style={songsInLineStyle}>Songs in line: {songsInLine}</p>
                    <p style={skipCostStyle}>Skip: {skipRate} credits</p>
                    <p style={skipCostStyle}>Skip+: {skipPlusRate} credits</p>
                </div>

                <div style={bottomColumns}>
                    <div style={{...childStyle2, ...songList}}>
                        <h3 style={h3SkipPlus}>Skip+</h3>
                        {songsSkipPlus.map(song => (
                            <div key={song.id} className="song-item" style="display: flex;">
                                <div style={artistNameContainerList}>
                                    <p style={songNameTextList}>{song.songName}{song.boost >= 1 ? ` +${song.boost}` : ''}</p> 
                                    <p style={artistNameTextList}>{song.artistName}</p>
                                </div>
                                <div style={spotifyButtonList}>
                                    {song.songLink && ( // Comment: Displaying Spotify link
                                        <a href={song.songLink} target="_blank" rel="noopener noreferrer">
                                            <img src="../../images/Spotify-Icon-1.0.png" alt="Spotify" style={{ width: '24px', height: '24px', marginLeft: '10px', marginBottom: '-25px' }} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                        {songsSkipPlus.length === 0 && <p style={noSongsStyle}>No skip plus songs.</p>}
                    </div>
                    <div style={{...childStyle2, ...songList}}>
                        <h3 style={h3}>Skip</h3>
                        {songsSkip.map(song => (
                            <div key={song.id} className="song-item" style="display: flex;">
                                <div style={artistNameContainerList}>
                                    <p style={songNameTextList}>{song.songName}{song.boost >= 1 ? ` +${song.boost}` : ''}</p> 
                                    <p style={artistNameTextList}>{song.artistName}</p>
                                </div>
                                <div style={spotifyButtonList}>
                                    {song.songLink && ( // Comment: Displaying Spotify link
                                        <a href={song.songLink} target="_blank" rel="noopener noreferrer">
                                            <img src="../../images/Spotify-Icon-1.0.png" alt="Spotify" style={{ width: '24px', height: '24px', marginLeft: '10px', marginBottom: '-25px' }} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                        {songsSkip.length === 0 && <p style={noSongsStyle}>No skip songs.</p>}
                    </div>
                    <div style={{...childStyle2, ...songList}}>
                        <h3 style={h3}>Free</h3>
                        {songs.map(song => (
                            <div key={song.id} className="song-item" style="display: flex;">
                                <div style={artistNameContainerList}>
                                    <p style={songNameTextList}>{song.songName}{song.boost >= 1 ? ` +${song.boost}` : ''}</p> 
                                    <p style={artistNameTextList}>{song.artistName}</p>
                                </div>
                                <div style={spotifyButtonList}>
                                    {song.songLink && ( // Comment: Displaying Spotify link
                                        <a href={song.songLink} target="_blank" rel="noopener noreferrer">
                                            <img src="../../images/Spotify-Icon-1.0.png" alt="Spotify" style={{ width: '24px', height: '24px', marginLeft: '10px', marginBottom: '-25px' }} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                        {songs.length === 0 && <p style={noSongsStyle}>No regular songs queued.</p>}
                    </div>



                </div> 


                <div style={downloadContainer}>
                    <img style={downloadImage} src="../../images/Download-App-1.0.png" width="50px" alt="" />
                </div>


            </div>
        </div>
    );
}

export default MirrorShowComponent;