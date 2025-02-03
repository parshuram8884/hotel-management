import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const GuestComplaintTracking = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('guestToken');
      const response = await axios.get(
        'http://localhost:5000/api/complaints/guest',
        {
          headers: { Authorization: token }
        }
      );
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Error loading complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (complaintId) => {
    if (!message.trim()) return;

    try {
      const token = localStorage.getItem('guestToken');
      await axios.post(
        `http://localhost:5000/api/complaints/${complaintId}/messages`,
        { message },
        {
          headers: { Authorization: token }
        }
      );
      setMessage('');
      fetchComplaints(); // Refresh to get new messages
      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
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
      <h2 className="mb-4">My Complaints</h2>
      
      <div className="row">
        {/* Complaints List */}
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Your Complaints</h5>
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
                    <h6 className="mb-1">{complaint.title}</h6>
                    <span className={`badge bg-${
                      complaint.status === 'pending' ? 'warning' :
                      complaint.status === 'in-progress' ? 'primary' :
                      'success'
                    }`}>
                      {complaint.status}
                    </span>
                  </div>
                  <small className="text-muted">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </small>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Complaint Details and Chat */}
        <div className="col-md-8">
          {selectedComplaint ? (
            <div className="card shadow-sm">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">{selectedComplaint.title}</h5>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <h6 className="fw-bold">Description:</h6>
                  <p>{selectedComplaint.description}</p>
                  <div className="d-flex justify-content-between">
                    <span>Status: 
                      <span className={`badge ms-2 bg-${
                        selectedComplaint.status === 'pending' ? 'warning' :
                        selectedComplaint.status === 'in-progress' ? 'primary' :
                        'success'
                      }`}>
                        {selectedComplaint.status}
                      </span>
                    </span>
                    <small className="text-muted">
                      Submitted on: {new Date(selectedComplaint.createdAt).toLocaleDateString()}
                    </small>
                  </div>
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
                          msg.isStaff ? 'justify-content-start' : 'justify-content-end'
                        }`}
                      >
                        <div
                          className={`p-2 rounded ${
                            msg.isStaff ? 'bg-light' : 'bg-primary text-white'
                          }`}
                          style={{ maxWidth: '75%' }}
                        >
                          <div className="small mb-1">
                            {msg.isStaff ? 'Staff' : 'You'}
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
                          handleSendMessage(selectedComplaint._id);
                        }
                      }}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSendMessage(selectedComplaint._id)}
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

export default GuestComplaintTracking; 