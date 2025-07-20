import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email,
        password
      })

      // Store token without Bearer prefix (will be added in requests)
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('hotelInfo', JSON.stringify(response.data.hotel));

      toast.success('Login successful!')
      navigate('/staff/dashboard')
    } catch (error) {
      console.error('Login error:', error.response?.data)
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-sm p-4 col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4">
        <h2 className="text-center mb-4">Hotel Staff Login</h2>
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
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="text-end mb-3">
            <Link to="/forgot-password" className="text-decoration-none">
              Forgot Password?
            </Link>
            <div className="text-center mt-4">
  <span className="text-gray-600">Don't have an account? </span>
  <Link
    to="/signup"
    className="text-blue-500 hover:text-blue-600 font-medium"
  >
    Register here
  </Link>
</div>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Loading...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login