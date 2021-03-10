import "@testing-library/jest-dom"
import * as React from "react"
import {render, fireEvent, screen} from "@testing-library/react"
import HiddenMessage from "./hidden-message"

test("shows the children when the checkbox is checked", () => {
  //source: https://github.com/testing-library/react-testing-library
  const testMessage = "Test Message";
  render(<HiddenMessage>{testMessage}</HiddenMessage>);
  expect(screen.queryByText(testMessage)).toBeNull();
  fireEvent.click(screen.getByLabelText(/show/i));
  expect(screen.getByText(testMessage)).toBeInTheDocument();
});


