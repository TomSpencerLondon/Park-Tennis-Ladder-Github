import React, { useEffect, useState } from 'react';
import { getProfile, updateProfile, createUpload } from '../../lib/api';
import Layout from '../../components/Layout'
import Loading from '../../components/Loading'
import { URLS } from '../../components/Nav'
import { useForm } from 'react-hook-form'
import { Select, TextArea, Checkbox, Input, EmailInput, TelInput } from '../../components/Form'
import { useRouter } from 'next/router'
import { FooterActions } from '../../components/Footer'
import { Button } from '../../components/Buttons'
import Avatar from '../../components/Avatar'
import Error from '../../components/Error'
import styled from 'styled-components'
import { withAuth } from '../../lib/auth'
import { toast } from 'react-toastify'

const Center = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`

function EditProfile({ auth }) {
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState()
  const [avatarUrl, setAvatarUrl] = useState()
  const [formData, setFormData] = useState({
    firstname: '', lastname: '', phone: '', skill: '', availability: ''
  });
  const router = useRouter();

  const { register, handleSubmit, reset, setValue, errors } = useForm({ defaultValues: formData })

  useEffect(() => {
    getProfile()
      .then((res: any) => {
        const { avatar, skill,  ...values } = res.data
        // if (!res.data.availability) {
          // toast.warn('Please complete your profile before joining a ladder', { autoClose: false })
        // }        
        setFormData({ ...values, skill: String(skill.id) })
        setAvatarUrl(avatar?.formats?.thumbnail?.url)
        setLoading(false)
      }).catch(setError)
  }, [])

  useEffect(() => {
    reset(formData)
  }, [formData])

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const { avatar, firstname, lastname, skill, ...filteredData } = data
      const profileData = { username: firstname + ' ' + lastname, firstname, lastname, skill, ...filteredData}
      const formData = new FormData();

      const res = await updateProfile(auth.user.id, profileData)
      if (avatar.length > 0) {
        formData.append('files', avatar[0]);
        formData.append('refId', res.data.id)
        formData.append('ref', 'user');
        formData.append('source', 'users-permissions');
        formData.append('field', 'avatar');
        await createUpload(formData)
      }
      router.push(URLS.profile())
    } catch (e) {
      if (e.response.status === 413) {
        toast.error('Avatar file size must be less than 4MB', { autoClose: false })
      } else if (!e.response.data.data) {
        toast.error(e.response.data.message, { autoClose: false })
      } else {
        const messages = e.response.data.data[0]
        Object.values(messages).forEach((item: []) => {
          item.forEach((item: { message: string }) => {
            toast.error(item.message, { autoClose: false })
          })
        })
      }
    }
    setIsLoading(false)
  }

  if (error) return <Error error='Error loading' />
  if (loading) return <Loading />

  return (
    <Layout title="Register">
      <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
        <h2>Edit Profile</h2>
        <fieldset disabled={loading}>
          <Center>
            <Avatar
              url={avatarUrl}
              alt="Avatar"
              width="100px"
              height="100px"
            />
          </Center>
          <Input label="Avatar*" type="file" name='avatar' placeholder="Avatar" accept="image/*" register={register} errors={errors} />
          <p><i>*Please upload a cropped square image.  iPhone selfies may also need to be rotated 90 degrees.</i></p>
          <Input label="First Name" type="text" name='firstname' placeholder="First Name" register={register({ required: "is required" })} errors={errors} />
          <Input label="Last Name" type="text" name='lastname' placeholder="Last Name" register={register({ required: "is required" })} errors={errors} />
          <EmailInput
            label="Email"
            name="email"
            placeholder="Email"
            register={register}
            registerOpts={{ required: "is required" }}
            errors={errors}
          />
          <TelInput
            label="Telephone"
            name="phone"
            placeholder="Telephone"
            register={register}
            errors={errors}
          />
          <Select
            label="Ability"
            name="skill"
            register={register({ required: "is required" })} 
            errors={errors}
          >
            <option value="">Select your tennis ability level</option>
            <option value="1">Beginner</option>
            <option value="2">Improver</option>
            <option value="3">Intermediate</option>
            <option value="4">Experienced</option>
            <option value="5">Advanced</option>
          </Select>
          <TextArea label="Availability" name="availability" placeholder="When are you generally available to play?" register={register} errors={errors}></TextArea>
          <Checkbox label="Away (injured, busy or holidays)" name="away" value="1" register={register} errors={errors} />
        </fieldset>
        <FooterActions>
          <Button type="submit">
            {isLoading ? "Loading... " : "Update Profile"}
          </Button>
        </FooterActions>
      </form>
    </Layout>
  )
}

export default withAuth(EditProfile)