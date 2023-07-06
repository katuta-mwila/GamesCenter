namespace GamesHub.Protocol;
public class ErrorCollection
{   
    // string (inputId), Error
    public Dictionary<string, List<Error>> collection {get; set;} = new Dictionary<string, List<Error>>();
    
    public ErrorCollection()
    {

    }

    public void AddError(string collectionId, Error error)
    {
        if (collection.ContainsKey(collectionId)){
            for (int i = 0; i < collection[collectionId].Count; i++)
            {
                if (collection[collectionId][i].code == error.code)
                    return;
            }
            collection[collectionId].Add(error);
            return;
        }
        collection.Add(collectionId, new List<Error>{error});
    }

    public void AddError(string collectionId, string msg, string code)
    {
        this.AddError(collectionId, new Error(msg, code));
    }

    public void AddErrors(string collectionId, List<Error> errors)
    {
        if (errors.Count == 0)
            return;
        for (int i = 0; i < errors.Count; i++)
        {
            AddError(collectionId, errors[i]);
        }
    }

    public bool hasErrors()
    {
        foreach (KeyValuePair<string, List<Error>> kvp in collection)
        {
            if (kvp.Value.Count > 0)
                return true;
        }
        return false;
    }

    public void Merge(ErrorCollection otherCollection)
    {
        foreach (KeyValuePair<string, List<Error>> kvp in otherCollection.collection)
        {
            this.AddErrors(kvp.Key, kvp.Value);
        }
    }
}