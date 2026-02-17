import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react'; // router imported
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { useState, useEffect } from 'react';

export default function ResourceIndex({ auth, type, title, readonly, primaryKey, fields, items, filters }) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentItemId, setCurrentItemId] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // Initialize form data based on fields
    useEffect(() => {
        if (!isModalOpen) {
            const initialData = {};
            fields.forEach(field => initialData[field.name] = '');
            setData(initialData);
            clearErrors(); // Clear errors when closing modal
        }
    }, [isModalOpen, fields]);

    const openCreateModal = () => {
        setIsEditMode(false);
        setCurrentItemId(null);
        const initialData = {};
        fields.forEach(field => initialData[field.name] = ''); // Reset data
        setData(initialData);
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setIsEditMode(true);
        const id = item[primaryKey];
        setCurrentItemId(id);

        const formData = {};
        fields.forEach(field => formData[field.name] = item[field.name]);
        setData(formData);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditMode) {
            put(route('admin.master.update', { type, id: currentItemId }), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.master.store', type), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (item) => {
        if (confirm('Are you sure you want to delete this item?')) {
            const id = item[primaryKey];
            router.delete(route('admin.master.destroy', { type, id }));
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.master.resource.index', type), { search: searchTerm }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{title}</h2>}
        >
            <Head title={title} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between mb-4">
                                <form onSubmit={handleSearch} className="flex gap-2">
                                    <TextInput
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-full"
                                    />
                                    <SecondaryButton type="submit">Search</SecondaryButton>
                                </form>
                                {!readonly && (
                                    <PrimaryButton onClick={openCreateModal}>Add New {title}</PrimaryButton>
                                )}
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {fields.map((field) => (
                                                <th key={field.name} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    {field.label}
                                                </th>
                                            ))}
                                            {!readonly && <th className="px-6 py-3 text-right">Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {items.data.map((item, index) => (
                                            <tr key={index}>
                                                {fields.map((field) => (
                                                    <td key={field.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item[field.name]}
                                                    </td>
                                                ))}
                                                {!readonly && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button onClick={() => openEditModal(item)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                                        <button onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-900">Delete</button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="mt-4 flex justify-between">
                                {items.links.map((link, key) => (
                                    link.url ? (
                                        <Link
                                            key={key}
                                            href={link.url}
                                            className={`px-3 py-1 border rounded ${link.active ? 'bg-indigo-500 text-white' : 'bg-white text-gray-700'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={key}
                                            className="px-3 py-1 border rounded bg-gray-100 text-gray-400"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        {isEditMode ? `Edit ${title}` : `Create New ${title}`}
                    </h2>
                    <form onSubmit={handleSubmit} className="mt-6">
                        {fields.map((field) => (
                            <div key={field.name} className="mb-4">
                                <InputLabel htmlFor={field.name} value={field.label} />
                                <TextInput
                                    id={field.name}
                                    type={field.type}
                                    className="mt-1 block w-full"
                                    value={data[field.name] || ''}
                                    onChange={(e) => setData(field.name, e.target.value)}
                                    // simple boolean support check
                                    {...(field.type === 'checkbox' ? { checked: data[field.name], value: undefined, onChange: (e) => setData(field.name, e.target.checked) } : {})}
                                />
                                <InputError message={errors[field.name]} className="mt-2" />
                            </div>
                        ))}
                        <div className="mt-6 flex justify-end">
                            <SecondaryButton onClick={closeModal} className="mr-3">Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing}>
                                {isEditMode ? 'Update' : 'Create'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
