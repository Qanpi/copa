import { Button } from "@mui/base";

function SignInPage() {
    const handleSignIn = () => {
        //axios.get("login/federated/google")
        const domain = window.location.host;
        window.open(`${domain}/login/federated/google`, "_self");
    }

    return (
        <>
            <Button onClick={handleSignIn}>Login in with Google</Button>
        </>
    )
}

export default SignInPage;