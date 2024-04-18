import { useState } from 'preact/hooks';
import { db, auth, storage } from '../../firebase-config';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; // Import Firebase auth functions
//import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

function LoginComponent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const labelStyle = {
        fontFamily: '"IBMPlexSerif", serif'
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const auth = getAuth();

        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log('Login successful');
            window.location.href = '/dashboard';
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <div>
            <form id="hostForm" onSubmit={handleSubmit}>
                <div style="margin-bottom: 15px;">
                    <label style={labelStyle} htmlFor="email">Email: </label>
                    <input 
                        style="border-radius: 5px; height: 27px; width: 250px;"
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label style={labelStyle} htmlFor="password">Password: </label>
                    <input
                        style="border-radius: 5px; height: 27px; width: 250px;"
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default LoginComponent;