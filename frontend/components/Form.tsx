import React from "react"
import styled from 'styled-components'
import { MinusButton, PlusButton } from './Buttons'
import { ErrorMessage } from '@hookform/error-message';
import { FaExclamationTriangle } from 'react-icons/fa'

const OptionWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 5px;
`;

const Label = styled.label`
  width: 100%;
  cursor: pointer;
  color: ${(props: any) => props.error ? 'red' : props.theme.textColor};
`;
// display: none;

const InputCheckbox = styled.input`
  margin: 6px 0;
`;

const Quantity = styled.span`
  margin 0 10px 0 10px;
  position: relative;
  top: -7px;
`;

export const ErrorMsg = styled.span`
  color: red;
`;

const Divider = styled.hr`
  margin: 5px 0;
  background-color: ${(props: any) => props.theme.dividerColor} !important;
`;

export const StyledSelect = styled.select`
  color: ${(props: any) => props.theme.textColor} !important; 
  background-color: ${(props: any) => props.theme.inputBackgroundColor} !important;
  ${(props: any) => props.error ? 'border: 1px solid red !important;' : null}
`;

export const StyledTextArea = styled.textarea`
  color: ${(props: any) => props.theme.textColor} !important;
  background-color: ${(props: any) => props.theme.inputBackgroundColor} !important;
  ${(props: any) => props.error ? 'border: 1px solid red !important;' : null}
`;

export const StyledInput = styled.input`
  color: ${(props: any) => props.theme.textColor} !important;
  background-color: ${(props: any) => props.theme.inputBackgroundColor} !important;
  width: 100%;
  ${(props: any) => props.error ? 'border: 1px solid red !important;' : null}
`;

export const NumberInput = styled.input`
  color: ${(props: any) => props.theme.textColor} !important;
  background-color: ${(props: any) => props.theme.inputBackgroundColor} !important;
  width: 4em;
  margin-top: 0.5em;
  margin-right: 0.5em;
`;

type InputPropTypes = { 
  label: string, 
  name: string, 
  errors: object,
  register: any, 
  registerOpts?: object, 
  type?: string, 
  accept?: string, 
  placeholder?: string,
}

type GenericInputPropTypes = { 
  label: string, 
  name: string, 
  errors: object,
  children: React.ReactNode,
}

// Wraps an input with a label and error message
function GenericInput({ children, label, name, errors }: GenericInputPropTypes) {
  const id = `${name}`;
  return (
    <div key={id}>
      <Label htmlFor={id} error={errors[name]}>{label}&nbsp;
      <ErrorMessage
        errors={errors}
        name={name}
        render={({ message }) => <ErrorMsg>
          {message}
        </ErrorMsg>}
      />
      </Label>
      {children}
    </div>
  )
}

export function Input({ label, type, name, placeholder, register, errors }: InputPropTypes) {
  return (
    <GenericInput label={label} name={name} errors={errors}>
      <StyledInput name={name} type={type} placeholder={placeholder} ref={register} error={errors[name]} autoFill="off" autoComplete="new-password" />
    </GenericInput>
  )
}

export function EmailInput({ label, name, placeholder, register, registerOpts, errors }: InputPropTypes) {
  return (
    <GenericInput label={label} name={name} errors={errors}>
      <StyledInput name={name} type="email" placeholder={placeholder} error={errors[name]} ref={register({
        ...registerOpts,
        pattern: { value: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, message: "invalid email" }
      })} />
    </GenericInput>
  )
}

export function TelInput({ label, name, placeholder, register, registerOpts, errors }: InputPropTypes) {
  const id = `${name}`;
  return (
    <GenericInput label={label} name={name} errors={errors}>
      <StyledInput name={name} type="tel" placeholder={placeholder} ref={register({
        ...registerOpts,
        pattern: { value: /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g, message: "invalid telephone" }
      })} />
    </GenericInput>
  )
}

export function TextArea({ label, name, placeholder, register, errors }: InputPropTypes) {
  return (
    <GenericInput label={label} name={name} errors={errors}>
      <StyledTextArea name={name} placeholder={placeholder} ref={register} error={errors[name]} className="u-full-width" rows={4} />
    </GenericInput>
  )
}

export function Select({ label, name, children, register, errors }: InputPropTypes & {children: React.ReactNode}) {
  return (
    <GenericInput label={label} name={name} errors={errors}>
      <StyledSelect name={name} ref={register} error={errors[name]} className="u-full-width">
        {children}      
      </StyledSelect>  
    </GenericInput>
  )
}

// export function TextInput({ label, name, placeholder, register, errors }: { label: string, name: string, placeholder: string, register: any, errors: any }) {
//   const id = `${name}`;
//   return (
//     <div key={id}>
//       <Label htmlFor={id}>{label}</Label>
//       <ErrorMessage 
//         errors={errors}
//         name={name}
//         render={({ message }) => <ErrorMsg><FaExclamationTriangle size={24} color="red" /> {message}</ErrorMsg>}
//       />
//       <StyledInput name={name} id={id} type="text" placeholder={placeholder} ref={register} />
//     </div>
//   )
// }

export function Checkbox({ label, name, value, register, errors }: any) {
  return (
    <GenericInput label={label} name={name} errors={errors}>
      <InputCheckbox name={name} type="checkbox" value={value} ref={register} />
    </GenericInput>
  )
}

export function CheckboxGroup({ title, options, register }: { title: string, options: string, register: any }) {
  if (options.indexOf(',') === -1) {
    return (
      <section>
        <h3>{title}</h3>
        <div>No options currently available</div>
      </section>
    );
  }
  const checkboxes = options.split(',').map((value: string, i: number, arr: string[]) => (
    <>
      <Checkbox name={title} key={value} value={value} register={register} />
      {(arr.length - 1 !== i) ? (<Divider />) : (null)}
    </>
  ))
  return (
    <section>
      <h3>{title}</h3>
      <div>{checkboxes}</div>
    </section>
  )
}

export function RadioButton({ name, value, register }: { name: string, value: string, register: any }) {
  const id = `${name}-${value}`;
  return (
    <OptionWrapper key={id}>
      <Label htmlFor={id}>{value}</Label>
      <InputCheckbox name={name} id={id} type="radio" value={value} ref={register} />
      {/* <InputCheckbox name={name} id={id} type="radio" value={value} ref={register({ required: true })} /> */}
    </OptionWrapper>
  )
}

export function RadioButtonGroup({ name, title, options, register, errors }: { name: string, title: string, options: string, register: any, errors: any }) {
  if (options.indexOf(',') === -1) {
    return (
      <section>
        <h3>{title}</h3>
        <div>No options currently available</div>
      </section>
    );
  }
  const radioButtons = options.split(',').map((value: string, i: number, arr: string[]) => (
    <>
      <RadioButton name={name} key={value} value={value} register={register} />
      {(arr.length - 1 !== i) ? (<Divider />) : (null)}
    </>
  ))
  return (
    <section>
      <h3>{title}</h3>
      {errors[name] && <ErrorMsg><FaExclamationTriangle size={24} color="red" /> Please select an option</ErrorMsg>}
      <div>{radioButtons}</div>
    </section>
  )
}

type NumberPickerPropsType = {
  handleSubtract: () => void;
  handleAdd: () => void;
  onChange: () => void;
  value: number;
}

export function NumberPicker({ handleSubtract, handleAdd, onChange, value }: NumberPickerPropsType) {
  const _handleSubract = (e: any) => {
    e.preventDefault();
    if (value < 1) return;
    handleSubtract();
    onChange();
  }
  const _handleAdd = (e: any) => {
    e.preventDefault();
    handleAdd();
    onChange();
  }
  return (
    <span>
      <MinusButton onClick={_handleSubract} />
      <Quantity>
        {value ? `${value}` : `0`}
      </Quantity>
      <PlusButton onClick={_handleAdd} />
    </span>
  )
}