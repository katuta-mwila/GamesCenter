export default function useReload(obj, callback = () => {}) {
    const [r, setR] = useState(false);
  
    useEffect(() => {
      const handleChange = () => {
        setR((prevR) => !prevR);
      };
      const proxy = new Proxy(obj, {
        set: (target, key, value) => {
          handleChange();
          target[key] = value;
          return true;
        },
      });
      return () => {
        // Remove the proxy and its handlers when the component unmounts
        Object.keys(proxy).forEach((key) => {
          delete proxy[key];
        });
      };
    }, [obj]);
  
    return () => {
      callback();
      setR((prevR) => !prevR);
    };
  }