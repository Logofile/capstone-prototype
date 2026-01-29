import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import pb from '../../lib/pocketbase';

export default function ProviderDashboard() {
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch opportunities created by this provider (via organization relation usually, 
        // but MVP might just query all or filtered by user's org. 
        // For MVP, since we didn't strictly enforce Org binding in Register, 
        // let's just fetch ALL opportunities for now or filter if we had the ID.
        // Ideally: filter={`organization = "${user.organization}"`}
        // But we don't have user.organization set in session easily without extra fetch.
        // Let's just fetch all specific to the user if we could, but for now let's just list all to prove concept
        // OR create a 'mine' filter if we bound 'point_of_contact' or similar.
        // Actually, schema has `organization`. 
        // Let's fetch all for prototype simplicity (admin view styled).

        async function fetchOpps() {
            try {
                const records = await pb.collection('opportunities').getList(1, 50, {
                    sort: '-created',
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-teal-900">Provider Dashboard</h1>
                <Link
                    to="/provider/opportunities/new"
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-teal-700 transition shadow"
                >
                    + Create Opportunity
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 font-medium text-gray-700 grid grid-cols-12 gap-4">
                    <div className="col-span-6">Title</div>
                    <div className="col-span-3">Status</div>
                    <div className="col-span-3 text-right">Actions</div>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : opportunities.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No opportunities found. Create one to get started!
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {opportunities.map((opp) => (
                            <div key={opp.id} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50 transition">
                                <div className="col-span-6 font-medium text-gray-900">{opp.title}</div>
                                <div className="col-span-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${opp.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {opp.is_published ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                                <div className="col-span-3 text-right">
                                    <Link to={`/opportunities/${opp.id}`} className="text-teal-600 hover:text-teal-800 text-sm font-medium mr-3">
                                        View
                                    </Link>
                                    <Link to={`/provider/opportunities/${opp.id}/edit`} className="text-gray-500 hover:text-teal-600 text-sm font-medium">
                                        Edit
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
