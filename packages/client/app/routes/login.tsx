import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../../lib/authStore'
import { useEden } from '../../lib/useEden'
import Swal from 'sweetalert2'
import { useUserName } from '../../lib/context'

export const Route = createFileRoute('/login')({
  component: AuthComponent,
})

const loginSchema = z.object({
  username: z.string().min(3, 'Name must be more than 3 letters'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
})

function AuthComponent() {
  const router = useRouter()
  const { api } = useEden()
  const { dispatch } = useUserName()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const [isIncorrectPassword, setIsIncorrectPassword] = useState(false)

  // ✅ Redirect after component mounts, not during render
  useEffect(() => {
    const token = useAuthStore.getState().token
    if (token) {
      router.navigate({ to: '/chat-ui' })
    }
  }, [router])

  const onSubmit = (data: any) => {
    api.auth.login
      .post({ name: data.username, password: data.password })
      .then((res) => {
        // Only show alert if it's definitely unauthorized
        if (res?.response?.status === 401) {
          setIsIncorrectPassword(true)
          Swal.fire({
            title: "Authentication Error",
            text: "Please try again",
            icon: "error"
          });
          return
        }

        // Auth success path
        useAuthStore.setState({
          user: res.data.name,
          token: res.data.accessToken,
          id: res.data.id,
          timestamp: res.data.timestamp,
        })
        dispatch({ type: 'SET_NAME', payload: res.data.name })

        if (res.status === 200) {
          router.navigate({ to: '/chat-ui' })
        }
      })
      .catch((error) => {
        console.error("Login error:", error)
        Swal.fire({
          title: "Login Failed",
          text: "Something went wrong. Please try again.",
          icon: "error"
        })
      })
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
      >
        {isIncorrectPassword && (
          <div className="p-4 mb-4 text-sm text-center text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
            <span className="font-medium">Unauthorized!</span> Please try again!
          </div>
        )}
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Username</label>
          <input
            type="text"
            {...register('username')}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-2">{errors.username.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Password</label>
          <input
            type="password"
            {...register('password')}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-2">{errors.password.message}</p>
          )}
        </div>

        <input
          value="Login"
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>
    </div>
  )
}