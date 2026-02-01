import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import pb from '../../lib/pocketbase';

export default function OpportunityDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [opportunity, setOpportunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedShift, setSelectedShift] = useState(null);
    const [shifts, setShifts] = useState([]); // In MVP, we might auto-generate a shift or fetch real ones
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const record = await pb.collection('opportunities').getOne(id, {
                    expand: 'organization'
                });
                setOpportunity(record);

                // Fetch shifts for this opportunity
                // If no shifts exist (providers can't create them yet in UI), we mock one for demo
                try {
                    const shiftRecords = await pb.collection('shifts').getList(1, 50, {
                        filter: `opportunity = "${id}"`,
                        sort: 'start'
                    });
                    if (shiftRecords.items.length > 0) {
                        setShifts(shiftRecords.items);
                    } else {
                        // Mock a shift if none exists so we can test signup flow
                        setShifts([{
                            id: 'mock_shift_' + id,
                            start: new Date(Date.now() + 86400000).toISOString(),
                            end: new Date(Date.now() + 90000000).toISOString(),
                            capacity: 10,
                            filled: 0,
                            isMock: true // Flag to know we need to create it on fly or just warn
                        }]);
                    }
                } catch (e) {
                    console.warn("Shift fetch error", e);
                }

            } catch (e) {
                console.error("Error fetching opportunity", e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    const handleSignup = async (e) => {
        e.preventDefault();

        if (!pb.authStore.isValid) {
            alert("Please sign in to volunteer.");
            navigate('/login');
            return;
        }

        if (!selectedShift) {
            alert("Please select a shift.");
            return;
        }

        // Collect custom form data
        const formData = new FormData(e.target);
        const customResponses = {};
        if (opportunity.form_schema?.fields) {
            opportunity.form_schema.fields.forEach(field => {
                if (field.type === 'checkbox') {
                    customResponses[field.label] = formData.get(field.id) === 'on';
                } else {
                    customResponses[field.label] = formData.get(field.id);
                }
            });
        }

        setSubmitting(true);
        try {
            // If MOCK shift, we can't really sign up to backend properly unless we create it first.
            // For MVP demo flow if shift creation UI isn't ready:
            let shiftId = selectedShift.id;
            if (selectedShift.isMock) {
                // Create the real shift now? Or just fail?
                // Let's create it silently for the demo to work
                const newShift = await pb.collection('shifts').create({
                    opportunity: id,
                    start: selectedShift.start,
                    end: selectedShift.end,
                    capacity: 10,
                    filled: 1
                });
                shiftId = newShift.id;
            }

            await pb.collection('signups').create({
                shift: shiftId,
                user: pb.authStore.model.id,
                status: 'confirmed',
                form_data: customResponses,
                reminder_sent: ''
            });

            alert("Successfully signed up! Thank you for volunteering.");
            navigate('/opportunities'); // Back to list
        } catch (err) {
            console.error("Signup failed", err);
            alert("Signup failed: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!opportunity) return <div className="p-8 text-center">Opportunity not found.</div>;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <Link to="/opportunities" className="text-teal-600 hover:underline mb-4 inline-block">← Back to Opportunities</Link>

            <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                <div className="p-6 md:p-8">
                    <div className="mb-6">
                        <span className="text-sm font-bold text-teal-600 uppercase tracking-wide">
                            {opportunity.expand?.organization?.name || 'Overview'}
                        </span>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">{opportunity.title}</h1>

                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                            {opportunity.date && (
                                <div className="flex items-center gap-1">
                                    <span className="text-lg">📅</span>
                                    <span className="font-medium">
                                        {new Date(opportunity.date).toLocaleDateString()} at {new Date(opportunity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            )}
                            {opportunity.zip_code && (
                                <div className="flex items-center gap-1">
                                    <span className="text-lg">📍</span>
                                    <span className="font-medium">
                                        {opportunity.zip_code}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="prose max-w-none text-gray-700 mb-8 whitespace-pre-wrap">
                        {opportunity.description}
                    </div>

                    <hr className="my-8 border-gray-100" />

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Shift Selection */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">1. Select a Shift</h3>
                            <div className="space-y-3">
                                {shifts.map(shift => (
                                    <label
                                        key={shift.id}
                                        className={`block p-4 rounded-lg border cursor-pointer transition ${selectedShift?.id === shift.id
                                            ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500'
                                            : 'border-gray-200 hover:border-teal-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="shift"
                                            className="hidden"
                                            onChange={() => setSelectedShift(shift)}
                                            checked={selectedShift?.id === shift.id}
                                        />
                                        <div className="font-semibold text-gray-900">
                                            {new Date(shift.start).toLocaleDateString()}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {new Date(shift.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                            {new Date(shift.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {shift.capacity - (shift.filled || 0)} spots remaining
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Dynamic Signup Form */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">2. Complete Registration</h3>
                            <form onSubmit={handleSignup} className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
                                {!pb.authStore.isValid && (
                                    <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded mb-4">
                                        You must be logged in to sign up. <Link to="/login" className="underline font-bold">Login here</Link>
                                    </div>
                                )}

                                {/* Render Custom Questions from Form Builder */}
                                {opportunity.form_schema?.fields?.map(field => (
                                    <div key={field.id} className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                        </label>

                                        {field.type === 'textarea' ? (
                                            <textarea
                                                name={field.id}
                                                required={field.required}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 outline-none"
                                            />
                                        ) : field.type === 'checkbox' ? (
                                            <input
                                                type="checkbox"
                                                name={field.id}
                                                className="rounded text-teal-600 focus:ring-teal-500 w-5 h-5"
                                                required={field.required}
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                name={field.id}
                                                required={field.required}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 outline-none"
                                            />
                                        )}
                                    </div>
                                ))}

                                <button
                                    type="submit"
                                    disabled={!selectedShift || !pb.authStore.isValid || submitting}
                                    className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-teal-700 transition shadow disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                >
                                    {submitting ? 'Confirming...' : 'Sign Up for Shift'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
