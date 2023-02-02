import { css } from "styled-components/macro";

import "./PlusJakartaSans-Regular.woff";
import "./PlusJakartaSans-Regular.woff2";

const fonts = css`
  @font-face {
    font-family: "PlusJackartaSans";
    src: url(./PlusJackartaSans-Regular.woff2) format("woff2"),
      url(./PlusJackartaSans-Regular.woff) format("woff");
    font-weight: 400;
    font-style: normal;
  }
`;

export default fonts;
