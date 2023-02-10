/* Page prompting users to log in with their Spotify account */

import styled from "styled-components/macro";

// main tag that centers login button with flexbox
const StyledLoginContainer = styled.main`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

//a makes it an anchor link
const StyledLoginButton = styled.a`
  display: inline-block;
  background-color: var(--green);
  color: var(--white);
  border-radius: var(--border-radius-pill);
  font-weight: 700;
  font-size: var(--fz-lg);
  padding: var(--spacing-sm) var(--spacing-xl);

  &:hover,
  &:focus {
    text-decoration: none;
    filter: brightness(1.1);
  }
`;

const Login = () => (
  <StyledLoginContainer>
    <StyledLoginButton href="http://localhost:8888/login">
      Log in to Spotify
    </StyledLoginButton>
  </StyledLoginContainer>
);

export default Login;
