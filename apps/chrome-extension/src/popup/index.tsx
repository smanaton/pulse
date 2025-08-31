import ReactDOM from "react-dom/client";
import Popup from "./Popup";
import "./index.css";
import "../styles/flowbite-theme.css";

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement,
);
root.render(<Popup />);
