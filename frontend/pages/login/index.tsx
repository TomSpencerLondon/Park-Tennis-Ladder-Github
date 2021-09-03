import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { login } from '../../lib/auth'
import { useAuthContext } from '../../auth/AuthProvider'
import Layout from '../../components/Layout'
import { URLS } from '../../components/Nav'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import { Input, EmailInput } from '../../components/Form'
import styled from 'styled-components'
import { ButtonLink } from '../../components/Buttons'
import Link from 'next/link'

const AnchorLink = styled.a`
  color: ${(props: any) => props.theme.linkTextColor}; 
`

function Login() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = useAuthContext();
  const { register, handleSubmit, errors } = useForm()

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await login(data.email, data.password)
      auth.setUser(res.data.user);
      router.push(URLS.home())
    } catch (e) {
      const messages = e.response.data.data[0]
      if (messages) {
        Object.values(messages).forEach((item: []) => {
          item.forEach((item: { message: string }) => {
            toast.error(item.message, { autoClose: false })
          })
        })
      } else {
        toast.error(e.response.data.error, { autoClose: false })
      }
    }
    setLoading(false)
  }

  return (
    <Layout title="Login and play local tennis matches">
      <h2>Log In</h2>
      <form method="POST" action="" onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={loading}>
          <EmailInput
            label="Email"
            name="email"
            placeholder="Email"
            register={register}
            registerOpts={{ required: "is required" }}
            errors={errors}
          />
          <Input label="Password" type="password" name='password' placeholder="Password" register={register({ required: "is required" })} errors={errors} />
          <div>
            <span>
              <AnchorLink href="/login/forgotten-password">
                Forgot Password?
              </AnchorLink>
            </span>
            <button
              style={{ float: "right", width: 120 }}
              className="button-primary"
              color="primary"
              type="submit"
            >
              {loading ? "Loading... " : "Submit"}
            </button>
          </div>
        </fieldset>
      </form>
    </Layout>
  );
}

export default Login;