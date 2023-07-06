namespace GamesHub.Auth;

public class GuestAccounts{
    private HashSet<Guid> validGuests = new HashSet<Guid>();

    public void AddGuestId(Guid id){
        lock(validGuests)
        {
            validGuests.Add(id);
        }
    }

    public bool IsValidGuest(Guid id){
        lock(validGuests){
           return validGuests.Contains(id); 
        }
    }
}