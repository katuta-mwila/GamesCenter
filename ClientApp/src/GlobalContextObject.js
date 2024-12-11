import jwt_decode from "jwt-decode";
import { UserData } from "./UserData";
class GlobalContextObject{
    //url = "http://localhost:10050" // testing
    //hostname = "http://localhost"
    //port = '10050'
    url = window.location.origin // production
    //hostname = window.location.hostname



    token = {
      Username: ""
    };
    constructor(){
      /*this.token = {
        Username: UserData.getName()
      }*/

        if (process.env.NODE_ENV === 'development'){
          this.url = "http://localhost:10050"
          this.host = 'localhost:10050'
        } else{
          this.url = window.location.origin
          this.host = window.location.host
        }

        const cookies = document.cookie.split("; ")
        for (let i = 0; i < cookies.length; i++){
            const cookie = cookies[i]
            if (cookie.startsWith("gameshub_token"))
            {
                const token = cookie.substring(15)
                this.token = jwt_decode(token)
            }
        }
    }
}

export default GlobalContextObject