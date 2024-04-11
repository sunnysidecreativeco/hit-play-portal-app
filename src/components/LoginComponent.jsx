import { useState } from 'preact/hooks';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; // Import Firebase auth functions
//import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

function LoginComponent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    //const navigate = useNavigate(); // Hook for navigation

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent the form from actually submitting

        const auth = getAuth(); // Initialize Firebase Auth

        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log('Login successful');
            window.location.href = '/dashboard'; // Redirect to dashboard
        } catch (error) {
            console.error('Login failed:', error);
            // Handle login errors here
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Login</button>
        </form>
    );
}

export default LoginComponent;