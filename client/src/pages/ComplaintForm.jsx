import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ComplaintForm = () => {
  const [predefinedComplaints, setPredefinedComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [complaintType, setComplaintType] = useState('predefined');
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPredefinedComplaints = async () => {
      try {
        const guestInfo = JSON.parse(localStorage.getItem('guestInfo'));
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/complaints/predefined/${guestInfo.hotelId}`
        );
        setPredefinedComplaints(response.data);
      } catch (error) {
        console.error('Error fetching predefined complaints:', error);
        toast.error('Error loading complaints');
      } finally {
        setLoading(false);
      }
    };

    fetchPredefinedComplaints();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('guestToken');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/complaints/submit`,
        {
          ...formData,
          isPredefined: complaintType === 'predefined'
        },
        {
          headers: { Authorization: token }
        }
      );

      toast.success('Complaint submitted successfully');
      navigate('/guest/dashboard');
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast.error('Error submitting complaint');
    } finally {
      setSubmitting(false);
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
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">Submit a Complaint</h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Complaint Type</label>
                  <select
                    className="form-select"
                    value={complaintType}
                    onChange={(e) => setComplaintType(e.target.value)}
                  >
                    <option value="predefined">Select from Predefined</option>
                    <option value="custom">Custom Complaint</option>
                  </select>
                </div>

                {complaintType === 'predefined' ? (
                  <div className="mb-3">
                    <label className="form-label">Select Complaint</label>
                    <select
                      className="form-select"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    >
                      <option value="">Select a complaint</option>
                      {predefinedComplaints.map((complaint) => (
                        <option key={complaint._id} value={complaint.title}>
                          {complaint.title}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="mb-3">
                    <label className="form-label">Complaint Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Submitting...
                    </>
                  ) : (
                    'Submit Complaint'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintForm; 