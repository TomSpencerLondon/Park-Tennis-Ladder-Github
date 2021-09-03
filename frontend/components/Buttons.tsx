import styled from 'styled-components';
import { FaPlusCircle, FaMinusCircle } from 'react-icons/fa'

export const Button = styled.button`
  background-color: ${(props: any) => props.color || props.theme.primaryButton};
  color: ${(props: any) => props.theme.textColor};
  border: 1px solid ${(props: any) => props.color || props.theme.primaryButton};
  height: 40px;
  margin: 10px 5px;
  font-size: 16px;
  font-family: "Raleway", "HelveticaNeue", "Helvetica Neue", Helvetica, Arial, sans-serif; 
  text-align: center;
`;

export const ButtonLink = styled.a.attrs(({
  className: 'button'
}))`
  background-color: ${(props: any) => props.color || props.theme.primaryButton};  
  color: ${(props: any) => props.theme.textColor};
  border: 1px solid ${(props: any) => props.color || props.theme.primaryButton};
  height: 40px;
  margin: 10px 5px;
  font-size: 16px;
  font-family: "Raleway", "HelveticaNeue", "Helvetica Neue", Helvetica, Arial, sans-serif; 
  text-align: center;
`;

export const ButtonLinkSmall = styled.a.attrs(({
  className: 'button'
}))`
  background-color: ${(props: any) => props.color || props.theme.primaryButton};  
  color: ${(props: any) => props.theme.textColor};
  border: 1px solid ${(props: any) => props.color || props.theme.primaryButton};
  height: 30px;
  margin: 15px 5px;
  font-size: 12px;
  line-height: 28px;
  font-family: "Raleway", "HelveticaNeue", "Helvetica Neue", Helvetica, Arial, sans-serif; 
  text-align: center;
  padding: 0 10px;
`;

export const PlusButton = styled(FaPlusCircle).attrs(({
  size: 24
}))`
  color: ${(props: any) => props.theme.primary} !important;
`;

export const MinusButton = styled(FaMinusCircle).attrs(({
  size: 24
}))`
  color: ${(props: any) => props.theme.primary} !important;
`;