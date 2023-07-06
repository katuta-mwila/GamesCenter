import {useState} from 'react'
import {v4 as uuid} from "uuid"

export default function useReload(callback = () =>{}){
    const [r, setR] = useState(uuid())
    return (input) =>{
        const nextuuid = uuid()
        setR(nextuuid)
        callback(nextuuid, input)
    }
}