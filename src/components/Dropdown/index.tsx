import "./index.scss";

const Dropdown = () => {
  return (
    <div className="center">
      <div className="container">
        <div className="setting-description">
          <div className="setting-description-text" style={{ marginLeft: 15 }}>
            <p>Description</p>
          </div>
        </div>
        <div className="wrapper-dropdown" id="dropdown">
          <span className="selected-display" id="destination">
            Pick an option!
          </span>
          <svg
            className="arrow transition-all ml-auto rotate-180"
            id="drp-arrow"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 14.5l5-5 5 5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
          <ul className="dropdown">
            <li className="item">Option 1</li>
            <li className="item">Option 2</li>
            <li className="item">Option 3</li>
            <li className="item">Option 4</li>
          </ul>
        </div>

        <br />

        <div className="setting-description">
          <div className="setting-description-text" style={{ marginLeft: 15 }}>
            <p>Description</p>
          </div>
        </div>
        <div className="wrapper-dropdown" id="dropdown">
          <span className="selected-display" id="destination">
            Pick a different option!
          </span>
          <svg
            className="arrow transition-all ml-auto rotate-180"
            id="drp-arrow"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 14.5l5-5 5 5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
          <ul className="dropdown">
            <li className="item">Special Option 1</li>
            <li className="item">Special Option 2</li>
            <li className="item">Special Option 3</li>
            <li className="item">Special Option 4</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dropdown;
