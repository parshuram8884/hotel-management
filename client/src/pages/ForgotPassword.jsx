import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        email
      })
      setSubmitted(true)
      toast.success('Password reset instructions sent to your email!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process request')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="card shadow-sm p-4 text-center col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4">
          <h2 className="mb-4">Check Your Email</h2>
          <p className="text-muted mb-4">
            If an account exists with {email}, you will receive password reset instructions.
          </p>
          <Link to="/" className="btn btn-link">
            Return to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-sm p-4 col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4">
        <h2 className="text-center mb-4">Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Sending...
              </>
            ) : (
              'Send Reset Instructions'
            )}
          </button>
          <div className="text-center">
            <Link to="/" className="btn btn-link">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword