import React, { useState } from "react";
import { forgottenPassword } from "../../lib/auth";
import Layout from '../../components/Layout'
import { useForm } from 'react-hook-form'
import { EmailInput } from '../../components/Form'
import { toast } from 'react-toastify'

export default function ForgottenPassword() {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, errors } = useForm()

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await forgottenPassword(data.email)
      toast.success('Reset password email sent')
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
    <Layout title="Forgotten password">
      <h2>Forgotten Password</h2>
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