import { useState } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import Layout from '../../components/Layout'
import Loading from '../../components/Loading'
import { FooterActions } from '../../components/Footer'
import { Button } from '../../components/Buttons'
import { URLS } from '../../components/Nav'
import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import { useAuthContext } from '../../auth/AuthProvider'
import { useForm } from 'react-hook-form'
import { Select, TextArea, RadioButtonGroup, NumberInput, ErrorMsg } from '../../components/Form'
import { updateResult } from '../../lib/api'
import Avatar from '../../components/Avatar'
import Error from '../../components/Error'
import { withAuth } from '../../lib/auth'
import { toast } from 'react-toastify'

const Wrapper = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 1rem 0;
`

const QUERY = gql`
  query($matchId: ID!) {
    match(id: $matchId) {
      id
      status
      ladder { 
        id
        name
        ranks {
          id
          rank
          user {
            id
            username
          }
        }
      }
      challenger {
        id
        username
        avatar {
          formats
        }           
      }
      opponent {
        id
        username
        avatar {
          formats 
        }           
      }
    }
  }
`;

/**
 * Displays a match report form
 */
function Report() {
  const router = useRouter()
  const { matchId } = router.query
  const auth = useAuthContext()
  const { loading, error, data } = useQuery(QUERY, {
    variables: { matchId },
  })

  const { register, handleSubmit, watch, errors, formState, setValue } = useForm()

  const status = watch('status')
  const numSets = watch('numSets')

  const challengerScoreInputs = [];
  const opponentScoreInputs = [];
  for (let i = 0; i < Number(numSets); i++) {
    const challengerFieldName = `challenger_set_scores[${i}]`
    challengerScoreInputs.push(
      <NumberInput name={challengerFieldName} type="number" placeholder="0" min="0" max="7" ref={register} />
    )
    const opponentFieldName = `opponent_set_scores[${i}]`
    opponentScoreInputs.push(
      <NumberInput name={opponentFieldName} type="number" placeholder="0" min="0" max="7" ref={register} />
    )
  }

  const onSubmit = (formData: any) => {
    const { winner, numSets, status, comment } = formData
    const challenger_set_scores = formData?.challenger_set_scores?.map(x => x === '' ? '0' : x)
    const opponent_set_scores = formData?.opponent_set_scores?.map(x => x === '' ? '0' : x)
    updateResult(matchId, { status, winner, numSets, challenger_set_scores, opponent_set_scores, comment })
      .then(res => router.replace(URLS.ladder(data.match.ladder.id)))
      .catch(err => {
        toast.error(err.response.data.message, { autoClose: false })
      })
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 3000);
    });
  }

  if (error) return <Error error='Error loading' />
  if (loading || !auth.user) return <Loading />
  if (![Number(data.match.challenger.id), Number(data.match.opponent.id)].includes(auth.user.id)) {
    return <Error error='Access denied.  You must be a challenge participant to report a result' />
  }  
  if (data.match.status !== 'Accepted') return <Error error='You may only enter results for accepted challenges' />

  return (
    <Layout title="Challenge">
      <h2>Match Report</h2>
      <Wrapper>
        <Avatar
          url={data.match.challenger.avatar?.formats?.thumbnail?.url}
          alt={data.match.challenger.username}
          width="100px"
          height="100px"
        />
        <Avatar
          url={data.match.opponent.avatar?.formats?.thumbnail?.url}
          alt={data.match.opponent.username}
          width="100px"
          height="100px"
        />
      </Wrapper>
      <Wrapper>
        <p>{data.match.challenger.username}</p>
        <p>vs</p>
        <p>{data.match.opponent.username}</p>
      </Wrapper>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2>Result</h2>
        <Select
          label="Match Status"
          name="status"
          register={register({
            required: "is required",
          })}
          errors={errors}
        >
          <option value="" disabled selected >What happened?</option>
          <option value="Played">Match was played</option>
          <option value="Forfeited">Match was forfeited</option>
          <option value="Cancelled">Match was cancelled</option>
        </Select>
        {status === 'Played' || status === 'Forfeited' ? (
          <Select
            label="Winner"
            name="winner"
            register={register({
              required: "is required",
            })}
            errors={errors}
          >
            <option value="" disabled selected >Who won?</option>
            <option value={data.match.challenger.id}>{data.match.challenger.username}</option>
            <option value={data.match.opponent.id}>{data.match.opponent.username}</option>
          </Select>
        ) : null}
        {status === 'Played' && (
          <Select
            name="numSets"
            label="Number of Sets"
            register={register({
              required: "is required",
            })}
            errors={errors}
          >
            <option value="" disabled selected >Number of sets?</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </Select>          
        )}
        {numSets && (
          <>
            <h3>Set Scores</h3>
            <div>{data.match.challenger.username}:</div>
            <div>
              {challengerScoreInputs}
            </div>
            <div>{data.match.opponent.username}:</div>
            <div>
              {opponentScoreInputs}
            </div>
          </>
        )}
        <TextArea
          label="Match Report"
          name="comment" placeholder="Please be kind and respectful."
          register={register}
          errors={errors} />
        <FooterActions>
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ?  'Loading...' : 'Submit Result'}
          </Button>
        </FooterActions>
      </form>
    </Layout>
  )
}

export default withAuth(Report)