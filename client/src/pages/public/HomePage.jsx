import { Link } from 'react-router-dom';

export default function HomePage() {
    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <section className="text-center py-12 md:py-20">
                <h1 className="text-4xl md:text-5xl font-extrabold text-teal-900 mb-4">
                    Georgia's Community Resource
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                    Allies Connect links residents with essential resources, events, and volunteer opportunities across the state.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link to="/opportunities" className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold shadow-lg hover:bg-teal-700 transition transform hover:-translate-y-0.5">
                        Find Resources
                    </Link>
                    <Link to="/register" className="px-6 py-3 bg-white text-teal-600 border border-teal-600 rounded-lg font-semibold shadow hover:bg-gray-50 transition">
                        Volunteer Now
                    </Link>
                </div>
            </section>
        </div>
    );
}
