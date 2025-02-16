/** 
 * TODO: USE QUERY TO CALL THE API TO THE BACKEND WITH PROPER GET / POST REQUEST
 * PASS THE PARAMTERS REQUIRED FOR EACH API CALL
 * 
 * TOTAL 3 APIS
 * 
 * 1. GET LIST
 *      - URL:
 *      - METHOD_TYPE: 
 *      - PARAMS/QUERY/BODY? 
 *      - RESPONSE OBJECT (CONSOLE.LOG)
 * 2. GET BUSINESS DETAILS
 *      - URL:
 *      - METHOD_TYPE:
 *      - PARAMS/QUERY/BODY? 
 *      - RESPONSE OBJECT
 * 3. REGISTER BUSINESS 
 *      - URL:
 *      - METHOD_TYPE:
 *      - PARAMS/QUERY/BODY? 
 *      - RESPONSE OBJECT
 * 
 * THERE MUST BE THREE FUNCTION FOR 3 API CALL
 *  - CALL COMMON API FUNCTION WITH PROPER INPUTS
 * 
 * ONE COMMON API FUNCTION TO MAKE A BACKEND CALL
 *  - URL, METHOR_TYPE, PARAMS OR BODY DEPENDS ON THE TYPE OF THE REQUEST
 */

const { response } = require("express");


/* 
1. GET LIST
      - URL:
      - METHOD_TYPE: 
      - PARAMS/QUERY/BODY? 
      - RESPONSE OBJECT (CONSOLE.LOG) 
*/

fetch('/business').then(response=> {
    console.log('Start: Fetching response through javascript');
    if (response.ok){
        return response.json();
    } else {
        throw new Error('API request failed!');
    }
}).then(data=> {
    console.log('Process: Fetching response through javascript');
    console.log(data);
}).catch(error => {
    console.log('Error: Fetching response through javascript');
    console.log(error);
});