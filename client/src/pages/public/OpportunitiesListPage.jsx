import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import pb from '../../lib/pocketbase';

export default function OpportunitiesListPage() {
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function fetchOpps() {
            try {
                // Fetch only published opportunities
                const records = await pb.collection('opportunities').getList(1, 50, {
                    filter: 'is_published = true',
                    sort: '-created',
                    expand: 'organization'
                });
                setOpportunities(records.items);
            } catch (e) {
                console.error("Error fetching opportunities", e);
            } finally {
                setLoading(false);
            }
        }

        fetchOpps();
    }, []);

    // Simple client-side search filtering
    const filteredOpps = opportunities.filter(opp =>
        opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.expand?.organization?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="text-center py-6">
                <h1 className="text-3xl font-bold text-teal-900 mb-2">Volunteer Opportunities</h1>
                <p className="text-gray-600">Find a way to give back to your community today.</p>
            </div>

            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
                <input
                    type="text"
                    placeholder="Search by title or organization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <div className="col-span-full text-center py-12 text-gray-500">Loading opportunities...</div>
                ) : filteredOpps.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No opportunities found matching your search.
                    </div>
                ) : (
                    filteredOpps.map((opp) => (
                        <Link key={opp.id} to={`/opportunities/${opp.id}`} className="block group">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-full hover:shadow-md transition-shadow">
                                <div className="mb-2">
                                    <span className="text-xs font-bold text-teal-600 uppercase tracking-wide">
                                        {opp.expand?.organization?.name || 'Community Organization'}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors">
                                    {opp.title}
                                </h3>
                                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                                    {opp.description}
                                </p>
                                <div className="flex justify-between items-center mt-auto">
                                    {/* Tags Placeholder */}
                                    <div className="flex gap-1">
                                        {/* {opp.tags?.map(t => <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{t}</span>)} */}
                                    </div>
                                    <span className="text-teal-600 text-sm font-medium group-hover:underline">
                                        View Details →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
