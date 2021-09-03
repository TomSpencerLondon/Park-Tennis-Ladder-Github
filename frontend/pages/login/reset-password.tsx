import React, { useState } from "react";
import { useRouter } from "next/router";
import { resetPassword } from "../../lib/auth";
import { useAuthContext } from '../../auth/AuthProvider'
import Layout from '../../components/Layout'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { Input } from '../../components/Form'

export default function ResetPassword(props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const auth = useAuthContext()
  const { register, handleSubmit, errors } = useForm()

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await resetPassword(router.query.code, data.password, data.passwordConfirm)
      toast.success('Password reset')
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
    <Layout title="Reset password">
      <h2>Reset Password</h2>
      <form method="POST" action="" onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={loading}>
          <Input label="Password" type="password" name='password' placeholder="Password" register={register({ required: "is required" })} errors={errors} />
          <Input label="Confirm Password" type="password" name='passwordConfirm' placeholder="Confirm Password" register={register({ required: "is required" })} errors={errors} />
          <div>
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