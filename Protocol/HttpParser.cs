using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace GamesHub.Protocol
{
    public class HttpParser
    {
        public string Method {get; set;}
        public string Target {get; set;}
        public string Version {get; set;}
        public Dictionary<string, string> Headers {get; set;} = new Dictionary<string, string>();
        public HttpParser()
        {

        }

        public bool ParseHttpRequest(string httpRequest)
        {
            //Regex startLineRegex = new Regex("([^\\s]+)\\s([^\\s]+)\\s([^\\s]+)\r\n");
            //startLineRegex.Match(httpRequest).Captures
            string[] lines = httpRequest.Split("\r\n");

            if (lines.Length == 0) return false;

            string[] startLine = lines[0].Split(" ");

            if (startLine.Length != 3) return false;

            this.Method = startLine[0];
            this.Target = startLine[1];
            this.Version = startLine[2];
            for (int i = 1; i < lines.Length; i++)
            {
                Regex headerRegex = new Regex("^([\\w-]+):\\s*(.+)\\s*$");
                Match match = headerRegex.Match(lines[i]);
                if (match.Success)
                {
                    Headers[match.Groups[1].Value.ToLower()] = match.Groups[2].Value;
                }
            }
            System.Console.WriteLine(JsonSerializer.Serialize(lines));
            //System.Console.WriteLine(JsonSerializer.Serialize(this));
            return true;
        }

        public string? GetHeader(string name)
        {
            string n = name.ToLower();
            if (Headers.ContainsKey(n))
            {
                return Headers[n];
            }
            return null;
        }

        public static string EncodeKey(string key)
        {
            string uuid = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
            string concat = key + uuid;
            string encodedKey = Convert.ToBase64String(System.Security.Cryptography.SHA1.Create().ComputeHash(Encoding.UTF8.GetBytes(concat)));
            return encodedKey;
        }

        public static void Test(){
            HttpParser parser = new HttpParser();
            string eol = "\r\n";
            string request =
            "GET / HTTP/1.1" + eol
            + "Header-Name: Header-Value" + eol
            + "Header-Name-Two: Header-Value-Two" + eol
            + eol
            + "This is the body";
            parser.ParseHttpRequest(request);
        }
    }
}