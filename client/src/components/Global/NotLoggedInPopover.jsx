import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import {Link} from "@reach/router";

const NotLoggedInPopover = ({loggedIn, action, placement, children}) => {

  const popoverStyle = {
    fontFamily: "Raleway, serif",
    textAlign: "center"
  }

  const logPopover = (
    <Popover
      id="not-logged-in-message"
      style={popoverStyle}
    >
      <Popover.Content>
        You must be logged in to {action}.
      </Popover.Content>
      <Popover.Title as="h3">
        <Link to="/">Log In or Register Here</Link>
      </Popover.Title>
    </Popover>
    );

  return (
    <OverlayTrigger
      trigger={loggedIn.email? null : "click"}
      placement={placement}
      overlay={logPopover}
    >
      {children}
    </OverlayTrigger>
  );
}

export default NotLoggedInPopover;