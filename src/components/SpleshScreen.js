// import React, { useEffect } from "react";
// import { Link } from "react-router-dom";

// const SpleshScreen = () => {
//     useEffect(() => {
//         console.log("welcome to splesh page");

//         const timeoutId = setTimeout(() => {
//             const link = document.getElementById("LoginPageLink");
//             if (link) {
//                 link.click(); // Programmatically click the link after 4 seconds
//             }
//         }, 3500);

//         return () => clearTimeout(timeoutId); // Clear timeout on component unmount
//     }, []);

//     return (
//         <>
//             <div className="container SpleshScreen px-4 d-flex justify-content-center" id="hideFleshScreen">
//                 <div className="card text-left border-0">
//                     <div className="card-body">
//                         <p className="card-title text-center p-4 text-white rounded-circle" id="cardTitle">
//                             <img src="./assets/images/logo.png" width={200} alt="Logo"></img>
//                             <Link id="LoginPageLink" to="/WelcomeLogin"></Link>
//                         </p>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default SpleshScreen;




import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const SpleshScreen = () => {
    useEffect(() => {
        console.log("welcome to splash page");

        // Function to extract unique key from URL
        const extractUniqueKeyFromUrl = () => {
            const params = new URLSearchParams(window.location.search);
            return params.get('id'); // Assuming the query string is ?id=uniqueKey
        };

        // Function to increment visit count in the backend
        const incrementVisitCount = async (uniqueKey) => {
            if (uniqueKey) {
                try {
                    const response = await axios.post('https://backend.supermilla.com/generate/visit', { uniqueKey });
                    console.log("Visit count incremented:", response.data);
                } catch (error) {
                    console.error("Error incrementing visit count:", error);
                }
            } else {
                console.log("No unique key found in the URL.");
            }
        };

        // Extract the unique key from the URL and increment the visit count
        const uniqueKey = extractUniqueKeyFromUrl();
        incrementVisitCount(uniqueKey);

        // Set timeout for redirecting to another page
        const timeoutId = setTimeout(() => {
            const link = document.getElementById("LoginPageLink");
            if (link) {
                link.click(); // Programmatically click the link after 4 seconds
            }
        }, 3500);

        return () => clearTimeout(timeoutId); // Clear timeout on component unmount
    }, []);

    return (
        <>
            <div className="container SpleshScreen px-4 d-flex justify-content-center" id="hideFleshScreen">
                <div className="card text-left border-0">
                    <div className="card-body">
                        <p className="card-title text-center p-4 text-white rounded-circle" id="cardTitle">
                            <img src="./assets/images/logo.png" width={200} alt="Logo"></img>
                            <Link id="LoginPageLink" to="/WelcomeLogin"></Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SpleshScreen;