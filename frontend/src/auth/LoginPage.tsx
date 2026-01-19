import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { GalleryVerticalEnd } from "lucide-react"
import { useAuth } from "@/auth/AuthContext"
import { login } from "@/api/login"
import { Input } from "@/components/ui/input"
import loginImage from "@/assets/img.jpg"

export default function LoginPage() {
  const { isAuthenticated, user, login: setAuth } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard')
      } else if (user.role === 'packager') {
        navigate('/packager/scan')
      }
    }
  }, [isAuthenticated, user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await login(username, password)
      
      // The API returns user object with id, username, role, tenant_id
      // Store auth info using AuthContext (which stores in sessionStorage)
      if (response.user) {
        setAuth(response.access_token, response.user)
      } else {
        throw new Error("User data not received from server")
      }
      
      // Redirect based on role
      if (response.role === 'admin') {
        navigate('/admin/dashboard')
      } else if (response.role === 'packager') {
        navigate('/packager/scan')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during login"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2 dark bg-background">
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-background">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-red-600 text-white flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <span className="font-semibold text-lg">PackVision</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <div className="flex flex-col items-center gap-2 text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground">Login to your account</h1>
              <p className="text-sm text-muted-foreground">
                Enter your credentials below to login
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label 
                  htmlFor="username" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white"
                >
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  placeholder="Enter your username"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label 
                    htmlFor="password" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white"
                  >
                    Password
                  </label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-red-600 text-white shadow hover:bg-red-700 w-full"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src={loginImage}
          alt="Login Background"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
