import { useEffect, useState } from 'react';
import { getDrinks, createDrink, updateDrink, deleteDrink } from '../../services/drinkService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { CATEGORIES } from '../../utils/constants';
import { formatPrice } from '../../utils/formatters';
import { compressImageFile } from '../../utils/imageUtils';

const emptyForm = {
  name: '',
  category: 'Dirty Soda',
  price: '',
  description: '',
  image: '',
  availability: true,
};

const AdminDrinks = () => {
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const fetchDrinks = async () => {
    setLoading(true);
    try {
      const data = await getDrinks();
      setDrinks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrinks();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }

    setImageUploading(true);
    setError(null);

    try {
      const compressedImage = await compressImageFile(file);
      setFormData((prev) => ({ ...prev, image: compressedImage }));
    } catch (err) {
      setError(err.message);
    } finally {
      setImageUploading(false);
    }
  };

  const handleEdit = (drink) => {
    setFormData({
      name: drink.name,
      category: drink.category,
      price: drink.price,
      description: drink.description,
      image: drink.image,
      availability: drink.availability,
    });
    setEditingId(drink._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this drink?')) return;
    try {
      await deleteDrink(id);
      setDrinks((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
    };
    try {
      if (editingId) {
        const updated = await updateDrink(editingId, payload);
        setDrinks((prev) => prev.map((d) => (d._id === editingId ? updated : d)));
      } else {
        const created = await createDrink(payload);
        setDrinks((prev) => [created, ...prev]);
      }
      setFormData(emptyForm);
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const cancelForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <LoadingSpinner className="py-20" size="lg" />;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-3xl font-bold text-white">Drinks</h1>
        <button
          onClick={() => { setShowForm(!showForm); if (showForm) cancelForm(); }}
          className="btn-primary text-sm"
        >
          {showForm ? 'Cancel' : '+ Add Drink'}
        </button>
      </div>

      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-8 space-y-4">
          <h2 className="font-semibold text-white">{editingId ? 'Edit Drink' : 'Add New Drink'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="input-field" required />
            <select name="category" value={formData.category} onChange={handleChange} className="input-field">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="number" name="price" placeholder="Price" step="0.01" value={formData.price} onChange={handleChange} className="input-field" required />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="input-field"
              required={!editingId}
            />
          </div>
          {imageUploading && <p className="text-sm text-kalma-muted">Uploading image...</p>}
          {formData.image && (
            <img
              src={formData.image}
              alt="Drink preview"
              className="w-24 h-24 object-cover rounded-lg border border-white/10"
            />
          )}
          <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="input-field" rows={3} required />
          <label className="flex items-center gap-2 text-kalma-muted">
            <input type="checkbox" name="availability" checked={formData.availability} onChange={handleChange} className="rounded" />
            Available
          </label>
          <button type="submit" disabled={submitting || imageUploading} className="btn-primary">
            {submitting || imageUploading ? 'Saving...' : editingId ? 'Update Drink' : 'Create Drink'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {drinks.map((drink) => (
          <div key={drink._id} className="card p-4 flex gap-4">
            <img src={drink.image} alt={drink.name} className="w-20 h-20 object-cover rounded-lg" />
            <div className="flex-1">
              <h3 className="font-semibold text-white">{drink.name}</h3>
              <p className="text-kalma-muted text-sm">{drink.category} · {formatPrice(drink.price)}</p>
              <p className={`text-xs mt-1 ${drink.availability ? 'text-green-400' : 'text-red-400'}`}>
                {drink.availability ? 'Available' : 'Unavailable'}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => handleEdit(drink)} className="text-sm text-kalma-gold hover:underline">Edit</button>
              <button onClick={() => handleDelete(drink._id)} className="text-sm text-red-400 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDrinks;
