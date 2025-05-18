import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEden } from '../../lib/useEden';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../lib/authStore';
import { useUserName } from '../../lib/context';

export const Route = createFileRoute('/signup')({
  component: SignupComponent,
});

const signupSchema = z
  .object({
    username: z.string().min(3, 'Name must be at least 3 characters long'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

function SignupComponent() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const router = useRouter();
  const { api } = useEden();
  const { dispatch } = useUserName();
  const [nameTaken, setNameTaken] = useState(false);

  // ✅ Redirect only after component mounts
  useEffect(() => {
    const user = useAuthStore.getState().user;
    if (user) {
      router.navigate({ to: '/chat-ui' });
    }
  }, [router]);

  const onSubmit = (data: { username: string; password: string; confirmPassword: string }) => {
    if (data.password === data.confirmPassword) {
      delete data.confirmPassword;
      setNameTaken(false);

      api.auth.register.post({ name: data.username, password: data.password }).then((res) => {
        console.log("Res", res.data?.name);

        useAuthStore.setState({
          user: res.data.name,
          token: res.data.accessToken,
          id: res.data.id,
          timestamp: res.data.timestamp,
        });

        dispatch({ type: 'SET_NAME', payload: res.data.name });

        if (res.status === 200) {
          router.navigate({ to: '/chat-ui' });
        }
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Signup</h2>

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

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Confirm Password</label>
          <input
            type="password"
            {...register('confirmPassword')}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-2">{errors.confirmPassword.message}</p>
          )}
        </div>

        <input
          value="Signup"
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>
    </div>
  );
}