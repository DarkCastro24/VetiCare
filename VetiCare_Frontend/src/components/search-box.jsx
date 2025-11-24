import { useState } from "react";
import searchIcon from "../assets/images/search-box-component/search-icon.png"

function SearchBox({ onSearch, placeholder }) {

    const [search, setSearch] = useState("");

    const handleChange = (e) => {
        setSearch(e.target.value);
        onSearch(e.target.value);
    }


    return (
        <div id="search-container">
            <img src={searchIcon} alt="magnifying glass icon" />
            <input type="search" name="name-search" id="name-search-appo" className="search-box" value={search} onChange={handleChange}
                onSearch={(e) => {
                    if (e.target.value === "") {
                        setSearch("");
                        onSearch("");
                    }
                }}
                placeholder={placeholder} 
                style={{
           
            paddingRight: "2rem", // deja espacio para la X
          }}/>
        </div>
    )
}

export default SearchBox