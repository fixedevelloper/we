'use client'
import { useNotificationContext } from '@/context/useNotificationContext'
import useQueryParams from '@/hooks/useQueryParams'
import { yupResolver } from '@hookform/resolvers/yup'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'

const useSignIn = () => {
  const [loading, setLoading] = useState(false)
  const { push } = useRouter()
  const { showNotification } = useNotificationContext()

  const queryParams = useQueryParams()

  const loginFormSchema = yup.object({
    email: yup.string().email('Please enter a valid email').required('Please enter your email'),
    password: yup.string().required('Please enter your password'),
  })

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  type LoginFormFields = yup.InferType<typeof loginFormSchema>

  const login = handleSubmit(async (values: LoginFormFields) => {
    try {
      setLoading(true);

      const res = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (res?.ok) {
        push(queryParams["redirectTo"] ?? "/dashboard");
        showNotification({
          message: "Connexion réussie. Redirection en cours...",
          variant: "success",
        });
      } else {
        showNotification({
          message: res?.error ?? "Identifiants incorrects",
          variant: "danger",
        });
      }
    } catch (err) {
      console.error(err);
      showNotification({
        message: "Erreur de connexion. Veuillez réessayer.",
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  });


  return { loading, login, control }
}

export default useSignIn
