import { useState } from 'preact/hooks';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; // Import Firebase auth functions
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

function LoginComponent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // Hook for navigation

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent the form from actually submitting

        const auth = getAuth(); // Initialize Firebase Auth

        try {
            await signInWithEmailAndPassword(auth, email, password); // Sign in with email and password
            console.log('Login successful');
            navigate('/dashboard'); // Redirect to dashboard upon successful login
        } catch (error) {
            console.error('Login failed:', error);
            // Handle login errors here, e.g., display an error message
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