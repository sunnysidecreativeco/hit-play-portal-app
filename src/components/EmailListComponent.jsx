import { useState, useEffect } from 'preact/hooks';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { db, storage } from '../../firebase-config';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';
import '../styles/styles.css';


function EmailListComponent() {



    return (
        <div>
            <p>On this page you'll find the email and artist name of every entry to your room.</p>
        </div>
    );

}

export default EmailListComponent;