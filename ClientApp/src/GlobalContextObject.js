import jwt_decode from "jwt-decode";
import { UserData } from "./UserData";
class GlobalContextObject{
    url = "http://localhost:10050" // testing
    hostname = "http://localhost"

    /*url = window.location.origin // production
    hostname = window.location.hostname
    sslPort = 7050*/
    token;
    constructor(){
      this.token = {
        Username: UserData.getName()
      }
        /*const cookies = document.cookie.split("; ")
        for (let i = 0; i < cookies.length; i++){
            const cookie = cookies[i]
            if (cookie.startsWith("gameshub_token"))
            {
                const token = cookie.substring(15)
                this.token = jwt_decode(token)
            }
        }*/
    }
}

export default GlobalContextObject