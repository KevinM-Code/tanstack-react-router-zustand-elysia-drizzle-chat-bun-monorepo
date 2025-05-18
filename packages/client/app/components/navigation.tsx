import { Link, useRouter } from "@tanstack/react-router";
import { Fragment, useEffect, useState } from "react";
import { useAuthStore } from "../../lib/authStore";
import Swal from 'sweetalert2';
import { useEden } from "../../lib/useEden";
import { useUserName } from "../../lib/context";

export const getSessionData = async (api: any, router: any, showAlert: boolean) => {

    const res = await api.auth.refresh.get();

    if (res.response.status === 401) {
        router.navigate({ to: "/login" });
    } else {
        return res.data;
    }
};

export default function Navigation() {
    const { api } = useEden();
    const router = useRouter();
    const { state, dispatch } = useUserName();
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    useEffect(() => {
        const tokenExists = !!useAuthStore.getState().token;

        getSessionData(api, router, tokenExists).then((res) => {
            if (res) {
                dispatch({ type: 'SET_NAME', payload: res.name });

                useAuthStore.setState({
                    user: res.name,
                    token: res.accessToken,
                    id: res.id,
                    timestamp: res.timestamp,
                });
            }
            setIsFirstLoad(false);
        });
    }, [api, router]);

    return (
        <Fragment>
            <div className="p-2 flex gap-2 text-lg">
                <Link to="/" activeProps={{ className: 'font-bold' }} activeOptions={{ exact: true }}>
                    Home
                </Link>
                <Link to="/about" activeProps={{ className: 'font-bold' }}>
                    About
                </Link>
                <Link to="/login" activeProps={{ className: 'font-bold' }}>
                    Login
                </Link>
                <Link to="/signup" activeProps={{ className: 'font-bold' }}>
                    Signup
                </Link>
                 {state.name ? (
                    <Link
                        className="justify-self-end"
                        activeProps={{ className: 'font-bold' }}
                        to="/chat-ui"                        
                    >
                        Chat Page
                    </Link>
                ) : null}
                {state.name ? (
                    <Link
                        className="justify-self-end"
                        activeProps={{ className: 'font-bold' }}
                        to="/"
                        onClick={() => {
                            useAuthStore.getState().logout();
                            api.auth.logout.get();
                        }}
                    >
                        Logout
                    </Link>
                ) : null}
            </div>
            <hr />
        </Fragment>
    );
}