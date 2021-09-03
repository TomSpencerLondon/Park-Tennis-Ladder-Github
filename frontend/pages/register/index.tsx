import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { registerUser, sendEmailConfirmation } from '../../lib/auth'
import { useAuthContext } from '../../auth/AuthProvider'
import Layout from '../../components/Layout'
import { useForm } from 'react-hook-form'
import { Input, EmailInput, TelInput, Checkbox, Select } from '../../components/Form'
import { URLS } from '../../components/Nav'
import { toast } from 'react-toastify'
import styled from 'styled-components'

const AnchorLink = styled.a`
  color: ${(props: any) => props.theme.linkTextColor};
`

export default function Register() {
  const auth = useAuthContext()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, watch, errors } = useForm()

  const onSubmit = async (formData: any) => {
    setLoading(true)
    try {
      const { firstname, lastname, skill, email, phone, password } = formData
      const data = { username: firstname + ' ' + lastname, firstname, lastname, skill, phone, email, password }
      await registerUser(data)
      // await sendEmailConfirmation(email)
      router.push(URLS.registerConfirm())
    } catch (e) {
      const messages = e.response.data?.data[0]
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
    <Layout title="Sign up and play more local tennis">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={loading}>
          <Link href={URLS.terms()} passHref>
            <AnchorLink>Terms and Conditions</AnchorLink>
          </Link>
          <Checkbox label="I have read the terms and conditions" name="terms" value="1" register={register({ required: "is required" })} errors={errors} />
          <Input label="First Name" type="text" name='firstname' placeholder="First Name" register={register({ required: "is required" })} errors={errors} />
          <Input label="Last Name" type="text" name='lastname' placeholder="Last Name" register={register({ required: "is required" })} errors={errors} />
          <Select
            label="Ability"
            name="skill"
            register={register({ required: "is required" })} 
            errors={errors}
          >
            <option value="" selected>Select your tennis ability level</option>
            <option value="1">Beginner</option>
            <option value="2">Improver</option>
            <option value="3">Intermediate</option>
            <option value="4">Experienced</option>
            <option value="5">Advanced</option>
          </Select>
          <TelInput
            label="Telephone"
            name="phone"
            placeholder="Phone"
            register={register}
            registerOpts={{ required: "is required" }}
            errors={errors}
          />
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
            <button
              style={{ float: "right", width: 120 }}
              className="button-primary"
              color="primary"
              type="submit">{loading ? "Loading... " : "Submit"}</button>
          </div>
        </fieldset>
      </form>
    </Layout>
  )
}