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
    const [showOffAirModal, setShowOffAirModal] = useState(false);
    const [donations, setDonations] = useState([]);
    const [isHost, setIsHost] = useState(false);

    
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
        fontSize: 30,
        marginTop: 10,
        marginBottom: 10,
    };

    const h3 = {
        fontFamily: "'ChicagoFLF', serif",
        fontSize: 24,
        textAlign: 'left',
        marginBottom: 5,
    };

    const h3SkipPlus = {
        fontFamily: "'ChicagoFLF', serif",
        fontSize: 24,
        textAlign: 'left',
        marginBottom: 5,
        marginTop: 5,
    };

    const buttonStyleCloseLine = {
        fontFamily: "'ChicagoFLF', serif",
        fontSize: '18px',
        backgroundColor: '#ffffff', 
        marginTop: '15px',
        paddingTop: '13px',
        paddingBottom: '13px',
        paddingLeft: '70px',
        paddingRight: '70px',
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
        float: 'left', 
    };
    
    const avatar = {
        display: 'inline-block', 
        verticalAlign: 'middle',
        paddingLeft: 50,
        paddingTop: 20,
    };

    const backToDashboard = {
        fontFamily: '"IBMPlexSerif", serif',
        fontSize: 14,
        textDecoration: 'underline',
        marginTop: '5px',
        cursor: 'pointer'
    };

    const donationsContainer = {
        marginLeft: 50,
        float: 'left',
        position: 'absolute',
        
    };

    const donationsListTitle = {
        fontFamily: "'ChicagoFLF', serif",
        fontSize: '18px',
        textAlign: 'left',
        fontWeight: 500,
        paddingLeft: 10,
    };

    const donationsListContainer = {
        height: 200,
        borderRadius: '20px',
        border: '3px solid #1b1b1b',  
        boxShadow: '3px 3px 0px 0px #1b1b1b',  
        maxHeight: '500px',  
        overflowY: 'auto',  
        width: 235,
    };

    const artistNameDonationText = {
        textAlign: 'left',
        fontFamily: '"IBMPlexSerif", serif',
        fontSize: 16,
        paddingLeft: 10,
        marginBottom: 0,
    };

    const creditsDonationText = {
        textAlign: 'left',
        fontFamily: '"IBMPlexSerif", serif',
        fontSize: 16,
        paddingLeft: 10,
        marginTop: 0,
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
        verticalAlign: 'middle', 
        display: 'inline-block', 
        marginLeft: '20px',
        width: 150,
        textAlign: 'left',
    };

    const roomNameText = {
        fontFamily: '"IBMPlexSerif", serif',
        fontSize: 18,
        marginTop: '25px',
        marginBottom: '5px',
    };

    const artistContainer ={

    };

    const artistNameContainer = {
        display: 'inline-block',
        textAlign: 'left',
        verticalAlign: 'middle',
        paddingRight: 25,
    };

    const artistNameText = {
        fontFamily: '"IBMPlexSerif", serif',
        fontSize: 18,
        display: 'inline-block',
        marginTop: '0px',
        textAlign: 'left',
    };

    const songNameText = {
        fontFamily: '"IBMPlexSerif", serif',
        fontSize: 22,
        marginBottom: '0px',
        textAlign: 'left',
    };

    const artistNameTextList = {
        fontFamily: '"IBMPlexSerif", serif',
        fontSize: 16,
        display: 'inline-block',
        marginTop: '0px',
        marginBottom: '0px',
        textAlign: 'left',
    };

    const songNameTextList = {
        fontFamily: '"IBMPlexSerif", serif',
        fontSize: 22,
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

    const skipButtonStyle = {
        display: 'inline-block',
        verticalAlign: 'middle',
        textAlign: 'right',
        position: 'relative',
        height: 24,
        bottom: -20,
    };

    const skipLinkStyle = {
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        display: 'inline' // or 'block' depending on your layout needs
    };

    const skipIconStyle = {
        width: '20px', 
        height: '20px', 
        display: 'block',  // Ensures the image is not inline which can cause extra space
        verticalAlign: 'middle' // Aligns the image vertically if necessary
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
    


    const bottomColumns = {
        display: 'flex',          // Use flexbox to position children
        justifyContent: 'center', // Centers the flex container's children
        alignItems: 'flex-start', // Align items to the start of the container, keeping them top-aligned
        gap: '50px',              // Gap between the child elements
        padding: '0 10%', 
        marginTop: 75,
    };

    // Style for each child div to take equal width
    const childStyle = {
        flex: '0 0 20%',  
        minWidth: '0',
    };

    const childStyle2 = {
        flex: '0 0 30%',  
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
        borderRadius: '20px',
        textAlign: 'left'
    };

    const artistNameContainerList = {
        flex: '0 0 80%',
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
                        setRoomName(roomData.roomName);
                        setOnAirStatus(roomData.onAir ? "On Air" : "Off Air");
                        setLineOpenStatus(roomData.lineOpen);
                        setCreditsEarned(roomData.creditsEarned || 0);
                        setIsHost(roomData.hostId === user.uid); // Set isHost based on the hostId field
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
    
                    
                const donationsRef = collection(db, 'liveRooms', user.uid, 'donations');
                const donationsQuery = query(donationsRef, orderBy('timeEntered', 'desc'));
                const unsubscribeDonations = onSnapshot(donationsQuery, (querySnapshot) => {
                    const newDonations = [];
                    querySnapshot.forEach((doc) => {
                        newDonations.push({
                            ...doc.data(),
                            id: doc.id,
                            timeEntered: doc.data().timeEntered.toDate().toString(),
                        });
                    });
                    setDonations(newDonations);
                });
                
    
                return () => {
                    unsubscribeRoomDoc();
                    unsubscribeNowPlaying();
                    unsubscribeSongsPlus();
                    unsubscribeSongsSkip();
                    unsubscribeSongs();
                    unsubscribeUpNext();
                    unsubscribeDonations(); // You need to handle this conditionally based on whether it was set
                };
            } else {
                setShowModal(true);
                console.log("User is not logged in.");
            }
        });
    
        return () => unsubscribeAuth();
    }, []);

    const subscribeToSongs = (ref, skip, skipPlus, setState) => {
        const q = query(ref, where('boost', '>=', 0), where('skip', '==', skip), where('skipPlus', '==', skipPlus), orderBy('boost', 'desc'), orderBy('timeEntered', 'asc'));
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
            const hostRatePercentage = (userDoc.data().ratePerRound || 0) * 0.01;  // Convert to percentage
    
            // Determine which song to move based on priority
            const queries = [
                query(upNextRef, where("boost", ">=", 0), where("skipPlus", "==", "true"), orderBy("boost", "desc"), orderBy("timeEntered", "asc")),
                query(upNextRef, where("boost", ">=", 0), where("skip", "==", "true"), where("skipPlus", "==", "false"), orderBy("boost", "desc"), orderBy("timeEntered", "asc")),
                query(upNextRef, where("boost", ">=", 0), orderBy("boost", "desc"), orderBy("timeEntered", "asc"))
            ];
    
            let songToMove, songId, creditsToAdd = 0;
    
            for (const queryRef of queries) {
                const snapshot = await getDocs(queryRef);
                if (!snapshot.empty) {
                    songToMove = snapshot.docs[0].data();
                    songId = snapshot.docs[0].id;
                    creditsToAdd = songToMove.skip === "true" ? (songToMove.skipPlus === "true" ? 2 * skipRate + songToMove.boost : skipRate + songToMove.boost) : songToMove.boost;
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
                const additionalEarnings = creditsToAdd * hostRatePercentage;
                const newEarnings = (userDoc.data().earnings || 0) + additionalEarnings;
                const newEarningsTotal = (userDoc.data().earningsTotal || 0) + additionalEarnings;
                const newCreditsEarnedUser = (userDoc.data().creditsEarned || 0) + creditsToAdd;
                const newSongsReviewedHost = (userDoc.data().songsReviewed || 0) + 1;
    
                await updateDoc(userRef, {
                    creditsEarned: newCreditsEarnedUser,
                    earnings: newEarnings,
                    earningsTotal: newEarningsTotal,
                    songsReviewed: newSongsReviewedHost
                });
    
                // Update artist's document with new songsReviewed count
                const artistRef = doc(db, `users/${songToMove.artistId}`);
                const artistDoc = await getDoc(artistRef);
    
                if (artistDoc.exists()) {
                    const newSongsReviewedArtist = (artistDoc.data().songsReviewed || 0) + 1;
    
                    await updateDoc(artistRef, {
                        songsReviewed: newSongsReviewedArtist
                    });
    
                    console.log("Updated artist's songsReviewed count");
                } else {
                    console.log("Artist document not found");
                }
    
                console.log("Moved song to nowPlaying and updated user stats");
            } else {
                console.log("No songs available to move to nowPlaying");
            }
        } catch (error) {
            console.error("Failed to move next song to nowPlaying:", error);
        }
    };


    const skipSongManually = async (songId) => {
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
    
            // Fetch the specific song from upNext
            const songDocRef = doc(upNextRef, songId);
            const songDoc = await getDoc(songDocRef);
    
            if (!songDoc.exists()) {
                console.log("Song not found");
                return;
            }
    
            const songData = songDoc.data();
            const creditsToAdd = songData.skip === "true" ? (songData.skipPlus === "true" ? 2 * skipRate + songData.boost : skipRate + songData.boost) : songData.boost;
            
    
            // Add to nowPlaying and remove from upNext
            await setDoc(doc(db, `liveRooms/${userUid}/nowPlaying`, songId), songData);
            await deleteDoc(songDocRef);
    
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
    
            // Update artist's songs reviewed count
            const artistRef = doc(db, `users/${songData.artistId}`);
            const artistDoc = await getDoc(artistRef);
            if (artistDoc.exists()) {
                const newSongsReviewedArtist = (artistDoc.data().songsReviewed || 0) + 1;
                await updateDoc(artistRef, {
                    songsReviewed: newSongsReviewedArtist
                });
                console.log("Updated artist's songsReviewed count");
            } else {
                console.log("Artist document not found for ID");
            }
    
            console.log("Moved song to nowPlaying and updated user and artist stats");
        } catch (error) {
            console.error("Failed to move song to nowPlaying:", error);
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
        const nowPlayingRef = collection(db, `liveRooms/${userUid}/nowPlaying`);
        const donationsRef = collection(db, `liveRooms/${userUid}/donations`);
    
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
            const upNextEntriesSnapshot = await getDocs(upNextRef);
            for (const entryDoc of upNextEntriesSnapshot.docs) {
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
                        console.log("User document does not exist");
                    }
                }
    
                // Delete the entry from upNext after processing
                await deleteDoc(entryDoc.ref);
            }
    
            // Clear nowPlaying collection
            const nowPlayingEntriesSnapshot = await getDocs(nowPlayingRef);
            for (const entryDoc of nowPlayingEntriesSnapshot.docs) {
                await deleteDoc(entryDoc.ref);
            }

            const donationsSnapshot = await getDocs(donationsRef);
            for (const entryDoc of donationsSnapshot.docs) {
                await deleteDoc(entryDoc.ref);
            }
    
            console.log("Go Off Air function completed.");
            // Redirect to dashboard after processing
            window.location.href = '/dashboard';
        } catch (error) {
            console.error("Failed to go off air:", error);
        }
    };


    function OffAirModal({ onClose, onConfirm }) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000, // Ensure it's on top
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '5px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    zIndex: 1001,
                }}>
                    <p>Are you sure you want to go off air? <br />Any artists who spent skip credits and who are still in line will have their credits returned. <br />All lines will be emptied.</p>
                    <button onClick={onConfirm} style={{ marginRight: '10px' }}>Go Off Air</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        );
    }


    function handleModalOk() {
        window.location.href = '/';
    }

    function goToMirror() {
        window.open('/mirrorshow', '_blank');
    }

    function goToDashboard() {
        window.location.href = '/dashboard';
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
                        <p style={backToDashboard} onclick={goToDashboard}>Dashboard</p>
                    </div>
                    {donations.length > 0 && (
                    <div style={donationsContainer}>
                        <div style={donationsListContainer}>
                            <h2 style={donationsListTitle}>Donations List</h2>
                            {donations.map((donation, index) => (
                                <div key={index}>
                                    <p style={artistNameDonationText}>{donation.artist}</p>
                                    <p style={creditsDonationText}>Donation: {donation.credits}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    )}
                </div>

                

                <div style={mirrorContainer} onClick={goToMirror}>
                    <img style={mirrorButton} src="../../images/Mirror-Icon-1.0.jpg" width="50px" alt="" />
                </div>

                <header class="headercontainer">
                    <img src="../../images/Control-Center-Logo-1.0.png" width="350px" alt="" />
                </header>




                <div style="text-align: center;">
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
                                    
                                    <div style={spotifyButton}>
                                        {song.songLink && ( // Comment: Displaying Spotify link
                                                <a href={song.songLink} target="_blank" rel="noopener noreferrer">
                                                    <img src="../../images/Spotify-Icon-1.0.png" alt="Spotify" style={spotifyIcon} />
                                                </a>
                                            )}
                                    </div>
                                </div>


                                <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={() => setIsPlaying(false)} />
                                <div>
                                    <div style={playButton}>
                                        <button onClick={togglePlay} style={{ border: 'none', background: 'none', padding: 0 }}>
                                            {isPlaying 
                                                ? <img src="../../images/Pause-Icon-1.0.png" alt="Pause" style={{ width: '40px', height: '40px', marginBottom: '-16px', }} />
                                                : <img src="../../images/Play-Icon-1.0.png" alt="Play" style={{ width: '40px', height: '40px', marginBottom: '-16px', }} />
                                            }
                                        </button>
                                    </div>
                                    <div style={inputRange}>
                                        <input type="range" min="0" max={duration || 1} value={currentTime} onChange={(e) => {
                                            audioRef.current.currentTime = e.target.value;
                                            setCurrentTime(e.target.value);
                                        }} />
                                    </div>
                                    <div style={songDuration}>
                                        <span>{Math.floor(currentTime / 60)}:{('0' + Math.floor(currentTime % 60)).slice(-2)}</span>
                                        <span> / </span>
                                        <span>{Math.floor(duration / 60)}:{('0' + Math.floor(duration % 60)).slice(-2)}</span>
                                    </div>
                                    
                                </div>
                            </div>
                        )) : <p style={noSongsStyle}>No songs currently playing.</p>}
                </div>

                <div style={nextSongContainer}>
                    <button style={nextSongButton} class="standardGreenButton" onClick={moveNextSongToNowPlaying}><p>NEXT SONG</p></button>
                </div>



                <div style={bottomColumns}>     

                    <div>
                        <div style={{...childStyle, ...tableStyle}}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    <tr style={rowStyle}>
                                        <td style={cellText}>Your room is:</td>
                                        <td style={cellStyle}>{onAirStatus || "No status available"}</td>
                                    </tr>
                                    <tr style={rowStyle}>
                                        <td style={cellText}>Your line is:</td>
                                        <td style={cellStyle}>{lineOpenStatus ? "Open" : "Closed"}</td>
                                    </tr>
                                    <tr style={rowStyle}>
                                        <td style={cellText}>Songs in the queue:</td>
                                        <td style={cellStyle}>{songsInLine}</td>
                                    </tr>
                                    <tr style={{ ...rowStyle, borderBottom: 'none' }}>
                                        <td style={cellText}>Credits this live:</td>
                                        <td style={cellStyle}>{creditsEarned}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div style="margin-top: 15px;">
                            <button onClick={toggleLineStatus} style={buttonStyleCloseLine}>
                                {lineOpenStatus ? "CLOSE THE LINE" : "OPEN THE LINE"}
                            </button>
                        </div>
                        

                        <div>
                            {showOffAirModal && (
                                <OffAirModal
                                    onClose={() => setShowOffAirModal(false)}
                                    onConfirm={() => {
                                        goOffAir();
                                        setShowOffAirModal(false);
                                    }}
                                />
                            )}
                            {/* Other UI elements */}
                            <button style={buttonStyleOffAir} onClick={() => setShowOffAirModal(true)}>GO OFF AIR</button>
                        </div>

                    </div>

                    <div style={{...childStyle2, ...songList}}>
                        <h3 style={h3SkipPlus}>Skip+</h3>
                            {songsSkipPlus.length > 0 ? (
                                songsSkipPlus.map(song => (
                                    <div key={song.id} className="song-item" style={{ display: 'flex' }}>
                                        <div style={artistNameContainerList}>
                                            <p style={songNameTextList}>{song.songName}</p> 
                                            <p style={artistNameTextList}>{song.artistName}</p>
                                        </div>
                                        <div style={skipButtonStyle}>
                                            <a style={skipLinkStyle} onClick={() => skipSongManually(song.id)} role="button">
                                                <img src="../../images/Skip-Icon-1.0.png" alt="Skip To Song" style={skipIconStyle} />
                                            </a>
                                        </div>
                                        <div style={spotifyButtonList}>
                                            {song.songLink && (
                                                <a href={song.songLink} target="_blank" rel="noopener noreferrer">
                                                    <img src="../../images/Spotify-Icon-1.0.png" alt="Spotify" style={{ width: '24px', height: '24px', marginLeft: '10px', marginBottom: '-25px' }} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={noSongsStyle}>No skip plus songs.</p>
                            )}

                        <h3 style={h3}>Skip</h3>
                            {songsSkip.length > 0 ? (
                                songsSkip.map(song => (
                                    <div key={song.id} className="song-item" style={{ display: 'flex' }}>
                                        <div style={artistNameContainerList}>
                                            <p style={songNameTextList}>{song.songName}</p> 
                                            <p style={artistNameTextList}>{song.artistName}</p>
                                        </div>
                                        <div style={skipButtonStyle}>
                                            <a style={skipLinkStyle} onClick={() => skipSongManually(song.id)} role="button">
                                                <img src="../../images/Skip-Icon-1.0.png" alt="Skip To Song" style={skipIconStyle} />
                                            </a>
                                        </div>
                                        <div style={spotifyButtonList}>
                                            {song.songLink && (
                                                <a href={song.songLink} target="_blank" rel="noopener noreferrer">
                                                    <img src="../../images/Spotify-Icon-1.0.png" alt="Spotify" style={{ width: '24px', height: '24px', marginLeft: '10px', marginBottom: '-25px' }} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={noSongsStyle}>No skip songs.</p>
                            )}

                        <h3 style={h3}>Free</h3>
                            {songs.length > 0 ? (
                                songs.map(song => (
                                    <div key={song.id} className="song-item" style={{ display: 'flex' }}>
                                        <div style={artistNameContainerList}>
                                            <p style={songNameTextList}>{song.songName}</p> 
                                            <p style={artistNameTextList}>{song.artistName}</p>
                                        </div>
                                        <div style={skipButtonStyle}>
                                            <a style={skipLinkStyle} onClick={() => skipSongManually(song.id)} role="button">
                                                <img src="../../images/Skip-Icon-1.0.png" alt="Skip To Song" style={skipIconStyle} />
                                            </a>
                                        </div>
                                        <div style={spotifyButtonList}>
                                            {song.songLink && (
                                                <a href={song.songLink} target="_blank" rel="noopener noreferrer">
                                                    <img src="../../images/Spotify-Icon-1.0.png" alt="Spotify" style={{ width: '24px', height: '24px', marginLeft: '10px', marginBottom: '-25px' }} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={noSongsStyle}>No regular songs queued.</p>
                            )}
                    </div>



                </div> 
            </div>
        </div>
    );
}

export default LiveRoomComponent;