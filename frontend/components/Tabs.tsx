import React, {useState, useCallback} from 'react'
import styled from 'styled-components'

const TabList = styled.div`
  display: flex;
  justify-content: space-around;
  font-family: "Raleway", "HelveticaNeue", "Helvetica Neue", Helvetica, Arial, sans-serif; 
`

const StyledTab = styled.button`
  padding: 10px;
  width: 100%;
  height: 100%;
  font-weight: bold;
  color: ${(props: any) => props.isActive ? props.theme.menuActiveColor : props.theme.menuColor};
  border: none;
  border-radius: 0;
  border-bottom: 3px solid ${(props: any) => props.isActive ? props.theme.menuActiveColor : props.theme.dividerColor };
  outline: 0;
  font-size: 1em;

  &:hover {
    color: ${(props: any) => props.theme.menuActiveColor};
  }  
`

type PropTypes = {
  children: React.ReactElement[];
  defaultIndex?: any;
}

/**
 * Displays tabs
 */
export default function Tabs({ children, defaultIndex}: PropTypes) {

  const [activeIndex, setActiveIndex] = useState(+defaultIndex || 0)

  const handleSelectTab = useCallback(
    (index) => setActiveIndex(index),
    [activeIndex]
  )

  const tabs = React.Children.map(children, (child, index) => (
      <StyledTab
        isActive={(activeIndex == index)}
        onClick={() => handleSelectTab(index)} 
      >
        {child.props.label} 
      </StyledTab>
    )
  )

  return (
    <>
      <TabList>
        {tabs}
      </TabList>
      {children[activeIndex]}
    </>
  )
}

export const TabPanel = ({ children, label }) => <React.Fragment>{children}</React.Fragment>