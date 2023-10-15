import { Button } from "@mui/base";

function SignInPage() {
    const handleSignIn = () => {
        //axios.get("login/federated/google")
        window.open(`http://localhost:3001/login/federated/google`, "_self");
    }

    return (
        <>
            <Button onClick={handleSignIn}>Login in with Google</Button>
        </>
    )
}

export default SignInPage;