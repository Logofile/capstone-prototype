import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import pb from '../../lib/pocketbase';

export default function RootLayout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    // Use state to force re-render on auth changes
    const [authModel, setAuthModel] = useState(pb.authStore.model);

    useEffect(() => {
        // Subscribe to changes (login/logout)
        const unsub = pb.authStore.onChange((token, model) => {
            setAuthModel(model);
        });
        return () => unsub();
    }, []);

    const user = authModel;
    const isLoggedIn = !!authModel;

    const handleLogout = () => {
        pb.authStore.clear();
        navigate('/');
        window.location.reload(); // Force refresh to update UI state properly since we aren't using a Context provider yet
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
            {/* 
        Header Section
        p-4: Padding 1rem
        bg-teal-700: Dark teal background for branding (Premium look)
        text-white: White text
        shadow-md: Subtle shadow for depth
      */}
            <header className="bg-teal-700 text-white p-4 shadow-md sticky top-0 z-50">
                <div className="container mx-auto flex justify-between items-center">
                    <Link to="/" className="text-xl font-bold tracking-tight">
                        Allies Connect
                    </Link>

                    {/* Mobile Menu Button - Visible on small screens */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden focus:outline-none"
                        aria-label="Toggle Menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>

                    {/* Desktop Navigation - Hidden on mobile */}
                    <nav className="hidden md:flex space-x-6 items-center">
                        {/* <Link to="/volunteer" className="hover:text-teal-200 transition-colors">Volunteer</Link> */}

                        {isLoggedIn ? (
                            <div className="flex items-center gap-4">
                                <span className="text-white font-medium cursor-default">
                                    Hello, {user?.name || user?.email}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 bg-teal-800 text-white rounded-lg hover:bg-teal-900 transition-colors font-medium border border-teal-600"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/provider/login" className="px-4 py-2 text-teal-100 hover:text-white transition-colors font-medium">
                                    Sign In
                                </Link>
                                <Link to="/register" className="px-4 py-2 bg-white text-teal-700 rounded-lg hover:bg-gray-100 transition-colors font-medium shadow-sm">
                                    Register
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>

                {/* Mobile Navigation Dropdown */}
                {isMenuOpen && (
                    <nav className="md:hidden mt-4 pb-2 border-t border-teal-600 pt-4 flex flex-col space-y-3">
                        <Link to="/opportunities" className="block hover:bg-teal-600 px-2 py-1 rounded">Find Help</Link>
                        {isLoggedIn ? (
                            <>
                                <div className="px-2 py-1 text-teal-200 text-sm">Signed in as {user?.email}</div>
                                {user?.type === 'provider' && (
                                    <Link to="/provider/dashboard" className="block hover:bg-teal-600 px-2 py-1 rounded">Dashboard</Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left block bg-teal-800 hover:bg-teal-900 px-2 py-2 rounded"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <Link to="/provider/login" className="block bg-white text-teal-700 px-4 py-2 rounded font-medium text-center shadow-sm">
                                Sign In
                            </Link>
                        )}
                    </nav>
                )}
            </header>

            {/* Main Content Area */}
            <main className="flex-grow container mx-auto p-4 md:p-8">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
                <p>© 2026 Allies Connect. Connecting Georgia Communities.</p>
            </footer>
        </div>
    );
}
