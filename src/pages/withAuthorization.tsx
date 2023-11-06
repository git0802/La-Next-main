
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const withAuthorization = (WrappedComponent:any) => {
    const WithAuthorization = (props:any) => {
        const [token, setToken] = useState("");
        const { data: session } = useSession();

        useEffect(() => {
            let _token = localStorage.getItem("token");
            if (_token) {
                setToken(_token);
            }
        }, []);

        if (session || token) {
            return <WrappedComponent {...props} />;
        }
    };

    // Set a display name for your component
    WithAuthorization.displayName = `WithAuthorization(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return WithAuthorization;
};

export default withAuthorization;
