import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useLogin } from "@/shared/api/generated/auth-controller/auth-controller";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useLogin();

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMsg("");
    try {
      const response = await loginMutation.mutateAsync({ data });
      if (response.data?.data?.accessToken) {
        localStorage.setItem("token", response.data.data.accessToken);
        navigate("/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errorMsg && (
        <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
          {errorMsg}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700">Email address</label>
        <div className="mt-1">
          <input
            {...register("email")}
            type="email"
            className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Password</label>
        <div className="mt-1">
          <input
            {...register("password")}
            type="password"
            className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </form>
  );
}
