import styled from 'styled-components'

export default function Section({title, text}) {
  return text ? (
    <section>
      <h3>{title}</h3>
      <p>{text}</p>
    </section>
  ) : null;
}