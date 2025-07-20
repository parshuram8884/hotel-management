import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [predefinedComplaints, setPredefinedComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComplaint, setNewComplaint] = useState('');
  const [adding, setAdding] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchComplaints();
    fetchPredefinedComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        navigate('/');
        return;
      }

      const response = await axios.get(
        'import.meta.env.VITE_API_URL/api/complaints/hotel',
        {
          headers: { Authorization: token }
        }
      );
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      if (error.response?.status === 401) {
        toast.error('Please login again');
        navigate('/');
      } else {
        toast.error('Error loading complaints');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPredefinedComplaints = async () => {
    try {
      const hotelInfo = JSON.parse(localStorage.getItem('hotelInfo'));
      const response = await axios.get(
        `import.meta.env.VITE_API_URL/api/complaints/predefined/${hotelInfo.id}`
      );
      setPredefinedComplaints(response.data);
    } catch (error) {
      console.error('Error fetching predefined complaints:', error);
    }
  };

  const handleAddPredefined = async (e) => {
    e.preventDefault();
    setAdding(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'import.meta.env.VITE_API_URL/api/complaints/predefined',
        { title: newComplaint },
        {
          headers: { Authorization: token }
        }
      );

      toast.success('Predefined complaint added');
      setNewComplaint('');
      fetchPredefinedComplaints();
    } catch (error) {
      console.error('Error adding predefined complaint:', error);
      toast.error('Error adding complaint');
    } finally {
      setAdding(false);
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `import.meta.env.VITE_API_URL/api/complaints/${complaintId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: token }
        }
      );

      toast.success('Status updated');
      fetchComplaints();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status');
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedComplaint) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        navigate('/');
        return;
      }

      const response = await axios.post(
        `import.meta.env.VITE_API_URL/api/complaints/${selectedComplaint._id}/staff-messages`,
        { message },
        {
          headers: { Authorization: token }
        }
      );
      
      setMessage('');
      setSelectedComplaint(response.data);
      fetchComplaints();
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      if (error.response?.status === 401) {
        toast.error('Please login again');
        navigate('/');
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to send message';
        toast.error(errorMessage);
      }
    }
  };

  const handleDeleteComplaint = async (complaintId) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        navigate('/');
        return;
      }

      await axios.delete(
        `import.meta.env.VITE_API_URL/api/complaints/${complaintId}`,
        {
          headers: { Authorization: token }
        }
      );
      
      toast.success('Complaint deleted successfully');
      if (selectedComplaint?._id === complaintId) {
        setSelectedComplaint(null);
      }
      fetchComplaints();
    } catch (error) {
      console.error('Error deleting complaint:', error);
      if (error.response?.status === 401) {
        toast.error('Please login again');
        navigate('/');
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to delete complaint';
        toast.error(errorMessage);
        
        if (error.response?.status === 400) {
          toast.error('Only resolved complaints can be deleted');
        }
      }
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
    <div className="container-fluid py-5 px-4">
      <div className="row">
        {/* Predefined Complaints Section */}
        <div className="col-md-3 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Predefined Complaints</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleAddPredefined} className="mb-4">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={newComplaint}
                    onChange={(e) => setNewComplaint(e.target.value)}
                    placeholder="Enter new complaint"
                    required
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={adding}
                  >
                    {adding ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </form>

              <div className="list-group">
                {predefinedComplaints.map((complaint) => (
                  <div key={complaint._id} className="list-group-item">
                    {complaint.title}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Complaints List */}
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Active Complaints</h5>
            </div>
            <div className="list-group list-group-flush">
              {complaints.map((complaint) => (
                <button
                  key={complaint._id}
                  className={`list-group-item list-group-item-action ${
                    selectedComplaint?._id === complaint._id ? 'active' : ''
                  }`}
                  onClick={() => setSelectedComplaint(complaint)}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">{complaint.title}</h6>
                      <small>Room: {complaint.guestId.roomNumber}</small>
                    </div>
                    <span className={`badge bg-${
                      complaint.status === 'pending' ? 'warning' :
                      complaint.status === 'in-progress' ? 'primary' :
                      'success'
                    }`}>
                      {complaint.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Complaint Details and Chat */}
        <div className="col-md-5">
          {selectedComplaint ? (
            <div className="card shadow-sm">
              <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{selectedComplaint.title}</h5>
                <div>
                  <select
                    className="form-select form-select-sm me-2 d-inline-block"
                    style={{ width: 'auto' }}
                    value={selectedComplaint.status}
                    onChange={(e) => handleStatusUpdate(selectedComplaint._id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  {selectedComplaint.status === 'resolved' && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteComplaint(selectedComplaint._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <h6 className="fw-bold">Guest Details:</h6>
                  <p className="mb-1">Name: {selectedComplaint.guestId.name}</p>
                  <p className="mb-1">Room: {selectedComplaint.guestId.roomNumber}</p>
                  <h6 className="fw-bold mt-3">Description:</h6>
                  <p>{selectedComplaint.description}</p>
                </div>

                {/* Chat Section */}
                <div className="mt-4">
                  <h6 className="fw-bold mb-3">Communication</h6>
                  <div 
                    className="chat-messages p-3 mb-3 border rounded"
                    style={{ height: '300px', overflowY: 'auto' }}
                  >
                    {selectedComplaint.messages?.map((msg, index) => (
                      <div
                        key={index}
                        className={`mb-2 d-flex ${
                          msg.isStaff ? 'justify-content-end' : 'justify-content-start'
                        }`}
                      >
                        <div
                          className={`p-2 rounded ${
                            msg.isStaff ? 'bg-primary text-white' : 'bg-light'
                          }`}
                          style={{ maxWidth: '75%' }}
                        >
                          <div className="small mb-1">
                            {msg.isStaff ? 'Staff' : 'Guest'}
                          </div>
                          {msg.message}
                          <div className="small text-end">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Message Input */}
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage();
                        }
                      }}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handleSendMessage}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm">
              <div className="card-body text-center text-muted">
                <p className="mb-0">Select a complaint to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintManagement; 