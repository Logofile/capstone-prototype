import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import pb from '../../lib/pocketbase';

export default function CreateOpportunityPage() {
    const navigate = useNavigate();
    const { id } = useParams(); // Check if we are editing
    const isEditing = !!id;

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditing);
    const [formFields, setFormFields] = useState([]);

    // Default values
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [date, setDate] = useState('');

    useEffect(() => {
        if (isEditing) {
            async function fetchOpp() {
                try {
                    const record = await pb.collection('opportunities').getOne(id);
                    setTitle(record.title);
                    setDescription(record.description || '');
                    setZipCode(record.zip_code || '');
                    // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
                    if (record.date) {
                        setDate(new Date(record.date).toISOString().slice(0, 16));
                    }
                    if (record.form_schema?.fields) {
                        setFormFields(record.form_schema.fields);
                    }
                } catch (e) {
                    console.error("Error fetching opportunity to edit", e);
                    alert("Could not load opportunity.");
                    navigate('/provider/dashboard');
                } finally {
                    setInitialLoading(false);
                }
            }
            fetchOpp();
        }
    }, [id, isEditing, navigate]);

    // Add a new question to the custom form
    const addField = () => {
        setFormFields([...formFields, {
            id: Math.random().toString(36).substr(2, 9),
            label: '',
            type: 'text',
            required: false
        }]);
    };

    // Update a question's properties
    const updateField = (id, key, value) => {
        setFormFields(formFields.map(f => f.id === id ? { ...f, [key]: value } : f));
    };

    // Remove a question
    const removeField = (id) => {
        setFormFields(formFields.filter(f => f.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);

        // Construct the payload
        // Organization Logic...
        let orgId = pb.authStore.model?.organization;

        if (!orgId) {
            // Fallback logic (keep same as create)
            try {
                const orgs = await pb.collection('organizations').getList(1, 1);
                if (orgs.items.length > 0) {
                    orgId = orgs.items[0].id;
                } else {
                    // stub
                }
            } catch (e) { }
        }

        const data = {
            title: formData.get('title'),
            description: formData.get('description'),
            zip_code: formData.get('zip_code'),
            date: formData.get('date') ? new Date(formData.get('date')).toISOString() : null,
            // Only update organization if creating? Or always? Usually shouldn't change owner org on edit.
            // If editing, we might omit organization or keep it.
            // But PocketBase rules might require it or not. Let's pass it if we have it, or just omit if undefined.
            // Actually, best to just not touch 'organization' field on edit unless switching orgs.
            // But for simplicity/robustness in prototype:
            ...(isEditing ? {} : {
                organization: orgId,
                point_of_contact: {
                    name: pb.authStore.model?.name || 'Volunteer Coordinator',
                    email: pb.authStore.model?.email
                }
            }),

            is_published: true,
            form_schema: { fields: formFields },
        };

        try {
            if (isEditing) {
                await pb.collection('opportunities').update(id, data);
            } else {
                await pb.collection('opportunities').create(data);
            }
            navigate('/provider/dashboard');
        } catch (err) {
            console.error("Error saving opportunity:", err);
            alert("Failed to save opportunity. See console for details.");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <div className="p-10 text-center">Loading editor...</div>;

    return (
        <div className="max-w-3xl mx-auto py-8">
            <h1 className="text-3xl font-bold text-teal-900 mb-8">
                {isEditing ? 'Edit Opportunity' : 'Post Volunteer Opportunity'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Details Section */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Basic Details</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Opportunity Title</label>
                        <input
                            type="text"
                            name="title"
                            required
                            defaultValue={title}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            placeholder="e.g. Weekend Food Sort"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            rows={4}
                            defaultValue={description}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            placeholder="Describe the activity, requirements, and impact..."
                        />
                    </div>
                </section>

                {/* Custom Form Builder Section */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h2 className="text-xl font-semibold text-gray-800">Volunteer Questions</h2>
                        <button
                            type="button"
                            onClick={addField}
                            className="text-sm bg-teal-50 text-teal-700 px-3 py-1 rounded-md font-medium hover:bg-teal-100 transition"
                        >
                            + Add Question
                        </button>
                    </div>

                    <p className="text-sm text-gray-500">
                        Define specific questions you need volunteers to answer when they sign up (e.g., T-shirt size, Dietary restrictions).
                    </p>

                    <div className="space-y-3">
                        {formFields.length === 0 && (
                            <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                No custom questions added yet.
                            </div>
                        )}

                        {formFields.map((field, index) => (
                            <div key={field.id} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg border border-gray-200 animate-fadeIn">
                                <div className="flex-grow space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Question (e.g. What is your T-shirt size?)"
                                        value={field.label}
                                        onChange={(e) => updateField(field.id, 'label', e.target.value)}
                                        required
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 outline-none text-sm"
                                    />
                                    <div className="flex gap-4">
                                        <select
                                            value={field.type}
                                            onChange={(e) => updateField(field.id, 'type', e.target.value)}
                                            className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                                        >
                                            <option value="text">Short Text</option>
                                            <option value="textarea">Long Text</option>
                                            <option value="checkbox">Yes/No</option>
                                        </select>
                                        <label className="flex items-center gap-1 text-sm text-gray-600">
                                            <input
                                                type="checkbox"
                                                checked={field.required}
                                                onChange={(e) => updateField(field.id, 'required', e.target.checked)}
                                                className="rounded text-teal-600 focus:ring-teal-500"
                                            />
                                            Required
                                        </label>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeField(field.id)}
                                    className="text-gray-400 hover:text-red-500 p-1"
                                    aria-label="Remove question"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/provider/dashboard')}
                        className="px-6 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition shadow-md disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : (isEditing ? 'Update Opportunity' : 'Publish Opportunity')}
                    </button>
                </div>
            </form>
        </div>
    );
}
