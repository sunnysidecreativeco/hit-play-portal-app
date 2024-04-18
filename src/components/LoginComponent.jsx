import { useState } from 'preact/hooks';
import { db, auth, storage } from '../../firebase-config';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; // Import Firebase auth functions
//import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

function LoginComponent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const labelStyle = {
        fontFamily: '"IBMPlexSerif", serif',
    };
    const buttonStyle = {
        fontFamily: "'ChicagoFLF', serif",
        marginTop: 15,
        paddingTop: 13,
        paddingBottom: 13,
        paddingLeft: 150,
        paddingRight: 150,
        borderRadius: 5,
        boxShadow: '3px 3px 0px 0px #1b1b1b',  // Proper CSS shadow syntax
        border: '2px solid #1b1b1b'  // Proper CSS border syntax
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
                <div style="margin-bottom: 10px;">
                    <label style={labelStyle} htmlFor="email">Email: </label>
                    <input 
                        style="border-radius: 5px; height: 27px; width: 275px;"
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
                <button style={buttonStyle} type="submit">LOGIN</button>
            </form>
        </div>
    );
}

export default LoginComponent;