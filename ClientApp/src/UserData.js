const UserData = (function(){
  let key = 'gamescenterstorage'
  let user = null

  const loadData = () =>{
    const json = sessionStorage.getItem(key)
    if (json == null){
      user = new UserDataObj({})
      saveData()
    }else 
      user = new UserDataObj(JSON.parse(json))
    console.log(user)
  }

  const saveData = () =>{
    if (user == null) return
    sessionStorage.setItem(key, JSON.stringify(user))
  }

  const getName = () =>{
    if (!user || !user.name){
      setName('player_' + Math.round(Math.random() * 1_000_000))
    }
    return user.name
  }

  const setName = (name) =>{
    user.name = name
    console.log(user)
    saveData()
  }

  return {loadData, saveData, getName, setName}
})()

class UserDataObj{
  name
  constructor(obj){
    this.name = obj.name
  }
}

export {UserData}