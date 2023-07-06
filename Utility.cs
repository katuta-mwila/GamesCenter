using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Primitives;

namespace GamesHub;

public static class Utility
    {
        public static Random random = new Random();
        public static Object randLock = new Object();

        public static int GetRandom(int lower, int upper)
        {
            lock(randLock)
            {
                return random.Next(lower, upper-1);
            }
        }
        public static bool EqualsIgnoreCase(this string s1, string s2)
        {
            return s1.ToUpper().Equals(s2.ToUpper());
        }

        // remove whitespace at beginning middle and end of string
        public static string FormatText(this string s) 
        {
            Regex reg1 = new Regex("(^\\s+)|(\\s+$)");
            Regex reg2 = new Regex("(?<=[^\\s+])\\s+(?=[^\\s])");
            string newString = reg1.Replace(s, "");
            return reg2.Replace(newString, " ");
        }

        public static T GetRandom<T>(this List<T> list)
        {
            if (list.Count == 0)
                return default(T);
            return list[random.Next(0, list.Count)];
        }

        public static T GetRandom<T>(this List<T> list, int start, int end)
        {
            if (list.Count == 0)
                return default(T);
            return list[random.Next(start, end+1)];
        }

        public static void Print(this object obj)
        {
            Console.WriteLine(JsonSerializer.Serialize(obj));
        }

        public static List<T> ToList<T>(this IEnumerable<T> enumerable)
        {
            List<T> list = new List<T>();
            foreach (T item in enumerable)
            {
                list.Add(item);
            }
            return list;
        }

        public static bool ContainsHeaders(this IHeaderDictionary dict, IList<string> names)
        {
            for (int i = 0; i < names.Count; i++)
            {
                if (dict[names[i]] == StringValues.Empty)
                    return false;
            }
            return true;
        }
    }