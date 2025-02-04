import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const FoodManagement = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const hotelInfo = JSON.parse(localStorage.getItem('hotelInfo'));
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `https://hotel-management-server-a3o3.onrender.com/api/food/menu/${hotelInfo.id}`, // Updated endpoint
        {
          headers: { Authorization: token }
        }
      );
      setFoods(response.data);
    } catch (error) {
      console.error('Error fetching foods:', error);
      toast.error('Error loading food items');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      toast.error('Please select an image');
      return;
    }

    setAdding(true);
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('image', formData.image);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'https://hotel-management-server-a3o3.onrender.com/api/food',
        formDataToSend,
        {
          headers: { 
            Authorization: token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('Food item added successfully');
      setFormData({ name: '', price: '', image: null });
      setImagePreview(null);
      fetchFoods();
    } catch (error) {
      console.error('Error adding food:', error);
      toast.error('Error adding food item');
    } finally {
      setAdding(false);
    }
  };

  const handleUpdate = async (foodId, isAvailable) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `https://hotel-management-server-a3o3.onrender.com/api/food/${foodId}`,
        { isAvailable },
        {
          headers: { Authorization: token }
        }
      );

      toast.success('Food availability updated');
      fetchFoods();
    } catch (error) {
      console.error('Error updating food:', error);
      toast.error('Error updating food item');
    }
  };

  const handleDelete = async (foodId) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `https://hotel-management-server-a3o3.onrender.com/api/food/${foodId}`,
        {
          headers: { Authorization: token }
        }
      );

      toast.success('Food item deleted');
      fetchFoods();
    } catch (error) {
      console.error('Error deleting food:', error);
      toast.error('Error deleting food item');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-5">
      <div className="row">
        {/* Add Food Form */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Add New Food Item</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Price</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Image</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mt-2 rounded"
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    />
                  )}
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={adding}
                >
                  {adding ? 'Adding...' : 'Add Food Item'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Food Items List */}
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Food Items</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foods.map((food) => (
                      <tr key={food._id}>
                        <td>
                          <img
                            src={`https://hotel-management-server-a3o3.onrender.com${food.imageUrl}`} // Updated image URL
                            alt={food.name}
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            className="rounded"
                          />
                        </td>
                        <td>{food.name}</td>
                        <td>₹{food.price}</td>
                        <td>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={food.isAvailable}
                              onChange={(e) => handleUpdate(food._id, e.target.checked)}
                            />
                            <label className="form-check-label">
                              {food.isAvailable ? 'Available' : 'Unavailable'}
                            </label>
                          </div>
                        </td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(food._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodManagement;