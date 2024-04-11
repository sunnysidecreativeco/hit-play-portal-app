import { useState, useEffect } from 'preact/hooks';
import { db, auth, storage } from './firebase-config';
import { doc, getDoc } from 'firebase/firestore';

function StateDisplay() {
    const [count, setCount] = useState(0);
    const [giveawayItem, setGiveawayItem] = useState("");
    const [loading, setLoading] = useState(true);

    //Connect to the db
    useEffect(() => {
        const loadGiveaway = async () => {
            setLoading(true); // Start loading
            const docRef = doc(db, 'giveaway', 'giveawayStatus');
            const docSnap = await getDoc(docRef);
    
            if (docSnap.exists()) {
                const currentGiveawayItem = docSnap.data().item;
                setGiveawayItem(currentGiveawayItem);
            } else {
                console.log("No such document!");
            }
            setLoading(false); // Data loaded
        };
    
        loadGiveaway();
    }, []);
    //Run the query
    //Return the result



    return (
        <div>
            <div>
                <p>Current Count: {count}</p>
                <button onClick={() => setCount(count + 1)}>Increment</button>
            </div>
    
            {loading ? (
                <p>Loading giveaway item...</p>
            ) : (
                <div>
                    <p>Giveaway Item: {giveawayItem}</p>
                </div>
            )}
        </div>

    );
}

export default StateDisplay;