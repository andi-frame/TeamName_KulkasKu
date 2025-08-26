"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/useAuth";

interface AuthFormValues {
  name?: string;
  email: string;
  password: string;
}

const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { register: registerUser, login: loginUser, loading } = useAuth();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: AuthFormValues) => {
    if (isLogin) {
      await loginUser(values);
    } else {
      const success = await registerUser(values);
      if (success) {
        setIsLogin(true);
        form.reset();
      }
    }
  };

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!isLogin && (
          <div>
            <input {...form.register("name")} placeholder="Name" className="w-full px-4 py-2 border rounded-md" />
            {form.formState.errors.name && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message?.toString()}</p>
            )}
          </div>
        )}
        <div>
          <input {...form.register("email")} placeholder="Email" className="w-full px-4 py-2 border rounded-md" />
          {form.formState.errors.email && (
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message?.toString()}</p>
          )}
        </div>
        <div>
          <input
            {...form.register("password")}
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-md"
          />
          {form.formState.errors.password && (
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.password.message?.toString()}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#5EB1FF] text-white py-2 rounded-md font-bold disabled:bg-opacity-50">
          {loading ? "Loading..." : isLogin ? "Login" : "Sign Up"}
        </button>
      </form>
      <div className="mt-4 text-center">
        <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-gray-600 hover:underline">
          {isLogin ? "Need an account? Sign Up" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
